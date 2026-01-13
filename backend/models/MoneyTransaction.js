import mongoose from "mongoose";

const moneyTransactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  category: { type: String, default: "MoneyTransaction" },
  entityName: { type: String, required: true }, // e.g., Zerodha, Ramesh
  transactionType: { type: String, enum: ["given", "received"], required: true },
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  description: { type: String ,default: " " },
}, { timestamps: true });

const moneyTransactionModel= mongoose.model("MoneyTransaction", moneyTransactionSchema);
export default moneyTransactionModel
