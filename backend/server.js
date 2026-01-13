import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import userRouter from "./routes/userRoutes.js";
import connectDB from "./config/db.js";
import generalRouter from "./routes/generalRoutes.js";
import businessRouter from "./routes/businessRoutes.js";
import moneyTrancationRouter from "./routes/moneyTransactionsRoute.js";

const app = express();
dotenv.config();
connectDB();

const PORT = process.env.PORT || 5000;

//Middlewares
app.use(cors());
app.use(express.json());

//api-endPoints
app.use("/api/user", userRouter);
app.use("/api/general", generalRouter);
app.use("/api/business", businessRouter);
app.use("/api/moneyTransaction", moneyTrancationRouter);

//Test
app.get("/", (req, res) => {
  res.send("AI Finance Assistant Backend is running 🚀");
});

app.listen(PORT, () => console.log("server Started", PORT));
