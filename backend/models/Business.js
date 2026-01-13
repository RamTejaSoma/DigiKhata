import mongoose from "mongoose";

const businessSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  category: { type: String, default: "Business" },
  subCategory: { type: String, required: true }, // e.g., Paddy, Cotton
  quantity: { type: Number ,default: 0 },
  unitPrice: { type: Number ,default: 0 },
  totalCost: { type: Number ,default: 0 },
  vendor: { type: String ,default: "N/A" },
  type: { type: String, enum: ["buy", "sell"], required: true },
  description: { type: String ,default: ""},
  date: { type: Date, default: Date.now },
}, { timestamps: true });

const businessModel= mongoose.model("Business", businessSchema);
export default businessModel