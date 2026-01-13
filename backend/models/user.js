import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  commodities: {
    general: { type: [String], default: [] },
    business: { type: [String], default: [] },
    borrowings: { type: [String], default: [] },
  },
});

const userModel= mongoose.model("User",userSchema);
export default userModel;