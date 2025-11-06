import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import cron from "node-cron";

import authRoutes from "./routes/authRoutes.js";
import leaveRoutes from "./routes/leaveRoutes.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/leaveDB";

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("MongoDB error:", err.message));

app.get("/", (_, res) => res.send("Leave Management API running"));
app.use("/api/auth", authRoutes);
app.use("/api/leaves", leaveRoutes);

// Optional: Auto-reset balances every Jan 1st at 00:00
// (can be removed if not needed)
import User from "./models/userModel.js";
cron.schedule("0 0 1 1 *", async () => {
  try {
    const defaultBalance = { casual: 12, sick: 8, earned: 10 };
    await User.updateMany({ role: "employee" }, { $set: { leaveBalance: defaultBalance } });
    console.log("✅ Annual leave balances reset");
  } catch (e) {
    console.error("Balance reset failed:", e.message);
  }
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
