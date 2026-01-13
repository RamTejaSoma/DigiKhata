import mongoose from "mongoose";
import businessModel from "../models/Business.js";
import userModel from "../models/user.js";
import PDFDocument from "pdfkit";

const addItem = async (req, res) => {
  try {
    const { userId } = req;
    let {
      subCategory,
      quantity,
      unitPrice,
      totalCost,
      vendor,
      type,
      date,
      description,
      isNewSubCategory,
    } = req.body;
    subCategory = subCategory.toLowerCase();

    if (isNewSubCategory) {
      const user = await userModel.findById(userId);
      if (user) {
        const existingSubs = user.commodities.business.map((sub) =>
          sub.toLowerCase()
        );
        const newSubLower = subCategory.toLowerCase();

        if (!existingSubs.includes(newSubLower)) {
          user.commodities.business.push(newSubLower);
          await user.save();
        }
      }
    }

    const computedTotal =
      totalCost !== "" && totalCost !== null && !isNaN(totalCost)
        ? Number(totalCost)
        : quantity && unitPrice
        ? quantity * unitPrice
        : 0;

    const parsedDate = date ? new Date(date) : new Date();
    const item = new businessModel({
      userId,
      subCategory,
      quantity,
      unitPrice,
      totalCost: computedTotal,
      vendor,
      date: parsedDate,
      description,
      type,
    });

    await item.save();

    res.status(201).json({
      success: true,
      data: item,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const getAllItems = async (req, res) => {
  try {
    const { userId } = req;
    const transactions = await businessModel
      .find({ userId })
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: transactions.length,
      data: transactions,
    });
  } catch (err) {
    console.error("Error fetching user business transactions:", err.message);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const allSubCategories = async (req, res) => {
  try {
    const { userId } = req;
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    const subcategories = user.commodities.business;

    res.status(200).json({
      success: true,
      data: subcategories,
    });
  } catch (err) {
    console.error(
      "Error fetching all subcategories business transactions:",
      err.message
    );

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const getBySubCategory = async (req, res) => {
  try {
    const { userId } = req;
    const { subCategory } = req.params;

    const transactions = await businessModel
      .find({ userId, subCategory: subCategory.toLowerCase() })
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: transactions });
  } catch (err) {
    console.error(
      "Error fetching all transactions of a subcategory business transactions:",
      err
    );
    res.status(500).json({ success: false, message: err.message });
  }
};

const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req;

    const transaction = await businessModel.findOneAndDelete({
      _id: id,
      userId,
    });
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }
    const rem = await businessModel.findOne({
      userId,
      subCategory: transaction.subCategory,
    });
    if (!rem) {
      let user = await userModel.findById(userId);
      if (user) {
        user.commodities.business = user.commodities.business.filter(
          (sub) => sub.toLowerCase() !== transaction.subCategory.toLowerCase()
        );
        await user.save();
      }
    }

    res.status(200).json({
      success: true,
      message: "Transaction deleted successfully",
    });
  } catch (err) {
    console.error("Error deleting a transaction(business):", err.message);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const filter = async (req, res) => {
  try {
    const { userId } = req;
    let { subCategory, type, fromDate, toDate } = req.query;

    const query = { userId };
    if (subCategory && subCategory !== "All") query.subCategory = subCategory;
    if (type && type !== "All") query.type = type;
    if (fromDate || toDate) query.date = {};
    if (fromDate) query.date.$gte = new Date(fromDate);
    if (toDate) query.date.$lte = new Date(toDate);

    const transactions = await businessModel.find(query).sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: transactions.length,
      data: transactions,
    });
  } catch (err) {
    console.error("Error in fetching transactions(filter):", err.message);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const getBusinessAnalysis = async ({
  userId,
  subCategory,
  fromDate,
  toDate,
}) => {
  const query = { userId: new mongoose.Types.ObjectId(userId) };
  if (subCategory && subCategory !== "All") query.subCategory = subCategory;

  if (fromDate || toDate) query.date = {};
  if (fromDate) query.date.$gte = new Date(fromDate);
  if (toDate) query.date.$lte = new Date(toDate);

  const result = await businessModel.aggregate([
    { $match: query },
    {
      $group: {
        _id: "$type",
        totalQuantity: { $sum: "$quantity" },
        totalAmount: { $sum: "$totalCost" },
        weightedAvg: { $sum: { $multiply: ["$quantity", "$unitPrice"] } },
      },
    },
  ]);

  const buyData = result.find((r) => r._id === "buy") || {
    totalQuantity: 0,
    totalAmount: 0,
    weightedAvg: 0,
  };

  const sellData = result.find((r) => r._id === "sell") || {
    totalQuantity: 0,
    totalAmount: 0,
    weightedAvg: 0,
  };

  const totalBought = buyData.totalQuantity;
  const totalSold = sellData.totalQuantity;
  const totalLeft = totalBought - totalSold;

  const avgBuy = totalBought ? buyData.weightedAvg / totalBought : 0;
  const avgSell = totalSold ? sellData.weightedAvg / totalSold : 0;

  const totalExpenditure = buyData.totalAmount;
  const totalIncome = sellData.totalAmount;
  const profit = totalIncome - totalExpenditure;

  const turnover = totalIncome + totalExpenditure;
  const profitMargin = avgBuy ? ((avgSell - avgBuy) / avgBuy) * 100 : 0;
  const revenueEfficiency = turnover ? (profit / turnover) * 100 : 0;

  return {
    totalBought,
    totalSold,
    totalLeft,
    avgBuy: avgBuy.toFixed(2),
    avgSell: avgSell.toFixed(2),
    totalExpenditure: totalExpenditure.toFixed(2),
    totalIncome: totalIncome.toFixed(2),
    turnover: turnover.toFixed(2),
    netProfit: profit.toFixed(2),
    profitMargin: profitMargin.toFixed(2),
    revenueEfficiency: revenueEfficiency.toFixed(2),
    stockPosition:
      totalLeft >= 0 ? "Stable" : "Deficit (Sold more than bought)",
  };
};

const reportPdf = async (req, res) => {
  try {
    const { userId } = req;
    let { subCategory = "All", type = "All", fromDate, toDate } = req.query;

    // === Build Query ===
    const query = { userId };
    if (subCategory && subCategory !== "All") query.subCategory = subCategory;
    if (type && type !== "All") query.type = type;
    if (fromDate || toDate) query.date = {};
    if (fromDate) query.date.$gte = new Date(fromDate);
    if (toDate) query.date.$lte = new Date(toDate);

    const docs = await businessModel.find(query).sort({ date: -1 });
    const summary = await getBusinessAnalysis({
      userId,
      subCategory,
      fromDate,
      toDate,
    });
    //console.log(docs)

    // === Setup PDF ===
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=business_expenses_report.pdf`
    );

    const doc = new PDFDocument({ margin: 50, size: "A4" });
    doc.pipe(res);

    // === Title ===
    doc.fontSize(20).font("Helvetica-Bold").text("Business Expenses Report", {
      align: "center",
    });
    doc.moveDown(1);

    // === Filters Info ===
    doc.fontSize(12).font("Helvetica");
    doc.text(`Subcategory: ${subCategory}`, { continued: true });
    doc.text(`    Type: ${type}`);
    if (fromDate)
      doc.text(`From Date: ${new Date(fromDate).toLocaleDateString()}`, {
        continued: true,
      });
    if (toDate)
      doc.text(`    To Date: ${new Date(toDate).toLocaleDateString()}`);
    doc.moveDown(1.5);
    
    // === Analysis Summary ===
doc.moveDown(1);
doc.font("Helvetica-Bold").fontSize(14).text("Business Analysis Summary");
doc.moveDown(0.5);

doc.font("Helvetica").fontSize(11);

const summaryRows = [
  ["Total Bought", summary.totalBought],
  ["Total Sold", summary.totalSold],
  ["Stock Left", summary.totalLeft],
  ["Average Buy Price", summary.avgBuy],
  ["Average Sell Price", summary.avgSell],
  ["Total Expenditure", summary.totalExpenditure],
  ["Total Income", summary.totalIncome],
  ["Net Profit", summary.netProfit],
  ["Profit Margin (%)", summary.profitMargin],
  ["Revenue Efficiency (%)", summary.revenueEfficiency],
  ["Stock Position", summary.stockPosition],
];

summaryRows.forEach(([label, value]) => {
  doc.text(`${label}: `, { continued: true, width: 200 });
  doc.font("Helvetica-Bold").text(value.toString());
  doc.font("Helvetica");
});

doc.moveDown(1.5);

// Divider
doc
  .moveTo(50, doc.y)
  .lineTo(600, doc.y)
  .strokeColor("#aaaaaa")
  .lineWidth(0.5)
  .stroke();

doc.moveDown(1);

    // === Table Settings ===
    const startX = 50;
    let y = doc.y + 10;
    const tableWidth = 550;
    const colWidths = [50, 80, 80, 100, 80, 100, 60];
    const headers = [
      "Qty",
      "Unit Price",
      "Total Cost",
      "Vendor",
      "Date",
      "Description",
      "Type",
    ];

    // === Header Row ===
    doc.font("Helvetica-Bold").fontSize(12);
    doc.rect(startX, y - 2, tableWidth, 20).fill("#eeeeee");
    doc.fillColor("#000000");

    let headerX = startX;
    headers.forEach((header, i) => {
      doc.text(header, headerX + 4, y + 4, {
        width: colWidths[i] - 8,
        align: "left",
      });
      headerX += colWidths[i];
    });

    y += 26;

    // === Divider Line ===
    doc
      .moveTo(startX, y)
      .lineTo(startX + tableWidth, y)
      .strokeColor("#888888")
      .lineWidth(0.5)
      .stroke();
    y += 4;

    // === Table Body (Dynamic Row Height) ===
    doc.font("Helvetica").fontSize(10);

    for (let index = 0; index < docs.length; index++) {
      const txn = docs[index];
      const rowData = [
        txn.quantity?.toString() || "-",
        txn.unitPrice?.toFixed(2) || "-",
        txn.totalCost?.toFixed(2) || "-",
        txn.vendor || "-",
        txn.date ? new Date(txn.date).toLocaleDateString() : "-",
        txn.description || "-",
        txn.type || "-",
      ];

      // 1️⃣ Calculate dynamic row height
      let rowHeight = 0;
      rowData.forEach((cell, i) => {
        const h = doc.heightOfString(cell, {
          width: colWidths[i] - 8,
          align: "left",
        });
        if (h > rowHeight) rowHeight = h;
      });
      rowHeight += 6; // small vertical padding

      // 2️⃣ Check if new row fits on page
      if (y + rowHeight > 750) {
        doc.addPage();
        y = 60;

        // Reprint header on new page
        doc.font("Helvetica-Bold").fontSize(12);
        doc.rect(startX, y - 2, tableWidth, 20).fill("#eeeeee");
        doc.fillColor("#000000");

        let hx = startX;
        headers.forEach((header, i) => {
          doc.text(header, hx + 4, y + 4, {
            width: colWidths[i] - 8,
            align: "left",
          });
          hx += colWidths[i];
        });
        y += 26;
        doc.font("Helvetica").fontSize(10);
      }

      // 3️⃣ Draw background and row text
      const rowColor = index % 2 === 0 ? "#f9f9f9" : "#ffffff";
      doc.rect(startX, y - 2, tableWidth, rowHeight).fill(rowColor);
      doc.fillColor("#000000");

      let cellX = startX;
      rowData.forEach((cell, i) => {
        doc.text(cell, cellX + 4, y + 4, {
          width: colWidths[i] - 8,
          align: "left",
        });
        cellX += colWidths[i];
      });

      // 4️⃣ Draw horizontal line under row
      doc
        .moveTo(startX, y + rowHeight)
        .lineTo(startX + tableWidth, y + rowHeight)
        .strokeColor("#dddddd")
        .lineWidth(0.3)
        .stroke();

      y += rowHeight;
    }

    // === Final Line ===
    doc
      .moveTo(startX, y)
      .lineTo(startX + tableWidth, y)
      .strokeColor("#888888")
      .lineWidth(0.5)
      .stroke();

    // === End PDF ===
    doc.end();
  } catch (err) {
    console.error("Failed to generate PDF:", err);
    res.status(500).send("Failed to generate PDF");
  }
};

const analysis = async (req, res) => {
  try {
    const { userId } = req;
    let { subCategory, fromDate, toDate } = req.query;

    const summary = await getBusinessAnalysis({
      userId,
      subCategory,
      fromDate,
      toDate,
    });

    res.status(200).json({
      success: true,
      summary,
    });
  } catch (err) {
    console.error("Error in fetching transactions(filter):", err.message);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const summary = async (req, res) => {
  try {
    const { userId } = req;
    const { subCategory, type, fromDate, toDate } = req.query;

    const query = { userId: new mongoose.Types.ObjectId(userId) };
    if (subCategory && subCategory !== "All") query.subCategory = subCategory;
    if (type && type !== "All") query.type = type;
    if (fromDate || toDate) query.date = {};
    if (fromDate) query.date.$gte = new Date(fromDate);
    if (toDate) query.date.$lte = new Date(toDate);

    const netRes = await businessModel.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          inFlow: {
            $sum: { $cond: [{ $eq: ["$type", "sell"] }, "$totalCost", 0] },
          },
          outFlow: {
            $sum: { $cond: [{ $eq: ["$type", "buy"] }, "$totalCost", 0] },
          },
        },
      },
    ]);

    const inflow = netRes[0]?.inFlow || 0;
    const outflow = netRes[0]?.outFlow || 0;

    res.json({
      success: true,
      data: {
        inflow: inflow,
        outflow: outflow,
      },
    });
  } catch (err) {
    console.error("Error in fetching transactions(filter):", err.message);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export {
  addItem,
  getAllItems,
  allSubCategories,
  getBySubCategory,
  deleteTransaction,
  filter,
  reportPdf,
  analysis,
  summary,
};
