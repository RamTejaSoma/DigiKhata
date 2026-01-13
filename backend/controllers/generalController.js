import generalModel from "../models/General.js";
import userModel from "../models/user.js";
import PDFDocument from "pdfkit";
import mongoose from "mongoose";

const addItem = async (req, res) => {
  try {
    const { userId } = req;
    let { subCategory, amount, date, description, type, isNewSubCategory } =
      req.body;
    subCategory = subCategory.toLowerCase();
    if (isNewSubCategory) {
      const user = await userModel.findById(userId);
      if (user) {
        const existingSubs = user.commodities.general.map((sub) =>
          sub.toLowerCase()
        );
        const newSubLower = subCategory.toLowerCase();

        if (!existingSubs.includes(newSubLower)) {
          user.commodities.general.push(newSubLower);
          await user.save();
        }
      }
    }

    const parsedDate = date ? new Date(date) : new Date();
    const item = new generalModel({
      userId,
      subCategory,
      amount,
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
    const transactions = await generalModel.find({ userId }).sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: transactions.length,
      data: transactions,
    });
  } catch (err) {
    console.error("Error fetching user General transactions:", err.message);

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
    const subcategories = user.commodities.general;

    res.status(200).json({
      success: true,
      data: subcategories,
    });
  } catch (err) {
    console.error(
      "Error fetching all subcategories General transactions:",
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

    const transactions = await generalModel
      .find({ userId, subCategory: subCategory.toLowerCase() })
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: transactions });
  } catch (err) {
    console.error(
      "Error fetching all transactions of a subcategory General transactions:",
      err
    );
    res.status(500).json({ success: false, message: err.message });
  }
};

const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req;

    const transaction = await generalModel.findOneAndDelete({
      _id: id,
      userId,
    });
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }
    const rem = await generalModel.findOne({
      userId,
      subCategory: transaction.subCategory,
    });
    if (!rem) {
      let user = await userModel.findById(userId);
      if (user) {
        user.commodities.general = user.commodities.general.filter(
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
    console.error("Error deleting a transaction(general):", err.message);

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

    const transactions = await generalModel.find(query).sort({ date: -1 });

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
const getGeneralSummary = async ({
  userId,
  subCategory,
  type,
  fromDate,
  toDate,
}) => {
  const query = { userId: new mongoose.Types.ObjectId(userId) };

  if (subCategory && subCategory !== "All") query.subCategory = subCategory;
  if (type && type !== "All") query.type = type;

  if (fromDate || toDate) query.date = {};
  if (fromDate) query.date.$gte = new Date(fromDate);
  if (toDate) query.date.$lte = new Date(toDate);

  const netRes = await generalModel.aggregate([
    { $match: query },
    {
      $group: {
        _id: null,
        inFlow: {
          $sum: {
            $cond: [{ $eq: ["$type", "received"] }, "$amount", 0],
          },
        },
        outFlow: {
          $sum: {
            $cond: [{ $eq: ["$type", "spent"] }, "$amount", 0],
          },
        },
      },
    },
  ]);

  const inflow = netRes[0]?.inFlow || 0;
  const outflow = netRes[0]?.outFlow || 0;
  const netBalance = inflow - outflow;

  return {
    inflow: inflow,
    outflow: outflow,
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

    const docs = await generalModel.find(query).sort({ date: -1 });
    const summary = await getGeneralSummary({
      userId,
      subCategory,
      type,
      fromDate,
      toDate,
    });

    //console.log(docs);

    // === Setup PDF ===
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=general_expenses_report.pdf`
    );

    const doc = new PDFDocument({ margin: 50, size: "A4" });
    doc.pipe(res);

    // === Title ===
    doc.fontSize(20).font("Helvetica-Bold").text("General Expenses Report", {
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

    // === General Summary ===
    doc.moveDown(1);
    doc.font("Helvetica-Bold").fontSize(14).text("General Summary");
    doc.moveDown(0.5);

    doc.font("Helvetica").fontSize(11);

    const summaryRows = [
      ["Total Earned", `${summary.inflow}/-`],
      ["Total Spent", `${summary.outflow}/-`],
     
    ];

    summaryRows.forEach(([label, value]) => {
      doc.text(`${label}: `, { continued: true, width: 200 });
      doc.font("Helvetica-Bold").text(value);
      doc.font("Helvetica");
    });

    doc.moveDown(1.2);

    // Divider
    doc
      .moveTo(50, doc.y)
      .lineTo(530, doc.y)
      .strokeColor("#aaaaaa")
      .lineWidth(0.5)
      .stroke();

    doc.moveDown(1);

    // === Table Settings ===
    const startX = 50;
    let y = doc.y + 10;
    const tableWidth = 480; // Reduced width without the Category column
    const colWidths = [80, 80, 100, 130, 90];
    const headers = ["Amount", "Type", "Date", "Description", "Subcategory"];

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

    // === Table Body ===
    doc.font("Helvetica").fontSize(10);

    for (let index = 0; index < docs.length; index++) {
      const txn = docs[index];
      const rowData = [
        txn.amount?.toFixed(2) || "-",
        txn.type || "-",
        txn.date ? new Date(txn.date).toLocaleDateString() : "-",
        txn.description || "-",
        txn.subCategory || "-",
      ];

      // Calculate dynamic row height
      let rowHeight = 0;
      rowData.forEach((cell, i) => {
        const h = doc.heightOfString(cell, {
          width: colWidths[i] - 8,
          align: "left",
        });
        if (h > rowHeight) rowHeight = h;
      });
      rowHeight += 6;

      // Check if new row fits on page
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

      // Draw background and row text
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

      // Draw horizontal line under row
      doc
        .moveTo(startX, y + rowHeight)
        .lineTo(startX + tableWidth, y + rowHeight)
        .strokeColor("#dddddd")
        .lineWidth(0.3)
        .stroke();

      y += rowHeight;
    }

    // Final Line
    doc
      .moveTo(startX, y)
      .lineTo(startX + tableWidth, y)
      .strokeColor("#888888")
      .lineWidth(0.5)
      .stroke();

    // End PDF
    doc.end();
  } catch (err) {
    console.error("Failed to generate PDF:", err);
    res.status(500).send("Failed to generate PDF");
  }
};

const summary = async (req, res) => {
  try {
    const { userId } = req;
    const { subCategory, type, fromDate, toDate } = req.query;

    const data = await getGeneralSummary({
      userId,
      subCategory,
      type,
      fromDate,
      toDate,
    });

    res.json({
      success: true,
      data,
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
  summary,
};
