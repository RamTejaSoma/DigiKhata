import userModel from "../models/user.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import generalModel from "../models/General.js";
import businessModel from "../models/Business.js";
import moneyTransactionModel from "../models/MoneyTransaction.js";
import mongoose from "mongoose";

const register = async (req, res) => {
  let { name, email, password } = req.body;
  try {
    const existingUser = await userModel.findOne({ email });
    if (existingUser)
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    if (!name || !email || !password) {
      return res.json({ success: false, message: "Missing Details" });
    }
    if (password.length < 8) {
      return res.json({ success: false, message: "Enter a strong Password" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new userModel({
      name,
      email,
      password: hashedPassword,
    });
    await newUser.save();
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET);
    return res.status(201).json({
      success: true,
      token,
      newUser,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const nUser = await userModel.findOne({ email });
    if (!nUser) {
      return res.status(400).json({
        success: false,
        message: "User Not Found",
      });
    }
    const isMatch = await bcrypt.compare(password, nUser.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Enter Valid Credentials",
      });
    }
    const token = await jwt.sign({ id: nUser._id }, process.env.JWT_SECRET);
    res.json({ success: true, token, nUser });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
// general: {
//   inflow: generalInflow,
//   outflow: generalOutflow,
//   net: generalInflow - generalOutflow,
// },
// business: {
//   inflow: businessInflow,
//   outflow: businessOutflow,
//   net: businessInflow - businessOutflow,
// },
// money: {
//   inflow: moneyInflow,
//   outflow: moneyOutflow,
//   net: moneyInflow - moneyOutflow,
// }
const summary = async (req, res) => {
  try {
    const { userId } = req;
    const { fromDate, toDate } = req.query;
    const query = { userId: new mongoose.Types.ObjectId(userId) };
    if (fromDate || toDate) query.date = {};
    if (fromDate) query.date.$gte = new Date(fromDate);
    if (toDate) query.date.$lte = new Date(toDate);

    const genRes = await generalModel.aggregate([
      { $match: query },
      {
        $group: {
          _id: "$type",
          total: { $sum: "$amount" },
        },
      },
    ]);
    const busRes = await businessModel.aggregate([
      { $match: query },
      {
        $group: {
          _id: "$type",
          total: { $sum: "$totalCost" },
        },
      },
    ]);
    const moneyRes = await moneyTransactionModel.aggregate([
      { $match: query },
      {
        $group: {
          _id: "$transactionType",
          total: { $sum: "$amount" },
        },
      },
    ]);

    function normalize(arr) {
      return arr.reduce((acc, curr) => {
        acc[curr._id] = curr.total;
        return acc;
      }, {});
    }

    const general = normalize(genRes);
    const business = normalize(busRes);
    const moneyTxns = normalize(moneyRes);

    const generalInflow = general.received || 0;
    const generalOutflow = general.spent || 0;

    const businessInflow = business.sell || 0;
    const businessOutflow = business.buy || 0;

    const moneyInflow = moneyTxns.received || 0;
    const moneyOutflow = moneyTxns.given || 0;

    res.status(200).json({
      success: true,
      data: {
        inflow: generalInflow + businessInflow + moneyInflow,
        outflow: generalOutflow + businessOutflow + moneyOutflow,
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

const segmentSummary = async (req, res) => {
  try {
    const { type } = req.params;
    const { fromDate, toDate } = req.query;
    const userId = new mongoose.Types.ObjectId(req.userId);

    let Model, amountField, inflowCond, outflowCond, entityField;

    if (type === "general") {
      Model = generalModel;
      amountField = "$amount";
      entityField = "$subCategory";
      inflowCond = ["$type", "received"];
      outflowCond = ["$type", "spent"];
    } else if (type === "business") {
      Model = businessModel;
      amountField = "$totalCost";
      entityField = "$subCategory";
      inflowCond = ["$type", "sell"];
      outflowCond = ["$type", "buy"];
    } else if (type === "money") {
      Model = moneyTransactionModel;
      amountField = "$amount";
      entityField = "$entityName";
      inflowCond = ["$transactionType", "received"];
      outflowCond = ["$transactionType", "given"];
    } else {
      return res
        .status(400)
        .json({ success: false, message: "Invalid segment" });
    }

    const match = { userId };
    if (fromDate || toDate) {
      match.date = {};
      if (fromDate) match.date.$gte = new Date(fromDate);
      if (toDate) match.date.$lte = new Date(toDate);
    }

    const [netRes, topEntityRes, topTxns] = await Promise.all([
      Model.aggregate([
        { $match: match },
        {
          $group: {
            _id: null,
            inflow: {
              $sum: { $cond: [{ $eq: inflowCond }, amountField, 0] },
            },
            outflow: {
              $sum: { $cond: [{ $eq: outflowCond }, amountField, 0] },
            },
          },
        },
      ]),
      Model.aggregate([
        { $match: match },
        {
          $group: {
            _id: entityField,
            total: { $sum: amountField },
          },
        },
        { $sort: { total: -1 } },
        { $limit: 1 },
      ]),
      Model.aggregate([
        { $match: match },
        { $sort: { [amountField.slice(1)]: -1 } },
        { $limit: 3 },
      ]),
    ]);

    const inflow = netRes[0]?.inflow || 0;
    const outflow = netRes[0]?.outflow || 0;

    res.json({
      success: true,
      data: {
        inflow: inflow,
        outflow: outflow,
        topEntity: topEntityRes[0]
          ? { name: topEntityRes[0]._id, amount: topEntityRes[0].total }
          : null,
        topTransactions: topTxns,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export { register, login, summary, segmentSummary };
