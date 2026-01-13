import mongoose from "mongoose";

const generalSchema=new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // reference user
  category: { type: String, default: "General" },
  subCategory: { type: String, required: true }, // e.g., Petrol, Groceries
  amount: { type: Number, required: true },
  type: { type: String, enum: ["spent", "received"], required: true },
  description: { type: String ,default: " "},
  date: { type: Date, default: Date.now },
}, { timestamps: true });

const generalModel= mongoose.model("General", generalSchema);
 export default generalModel
