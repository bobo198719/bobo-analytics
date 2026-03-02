// ✅ TEST LINE (VERY IMPORTANT — proves correct file is running)
console.log("🔥 NEW SERVER FILE LOADED");

import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";

const app = express();
const PORT = 5000;

/* =========================
   MIDDLEWARE
========================= */

app.use(cors());
app.use(express.json());

/* =========================
   HEALTH CHECK API
========================= */

app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Bobo Analytics API Working 🚀",
  });
});

/* =========================
   START SERVER
========================= */

const startServer = async () => {
  try {
    // Connect Database (JSON DB)
    await connectDB();

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

  } catch (error) {
    console.error("❌ Server failed to start:", error);
  }
};

startServer();
