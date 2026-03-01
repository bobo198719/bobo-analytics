import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";

const app = express();

/* ======================
   MIDDLEWARE
====================== */
app.use(cors());
app.use(express.json());

/* ======================
   HEALTH CHECK ROUTE
====================== */
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Bobo Analytics API Working 🚀",
  });
});

/* ======================
   START SERVER FUNCTION
====================== */
const startServer = async () => {
  try {
    // CONNECT DATABASE FIRST
    await connectDB();

    // START SERVER ONLY AFTER DB CONNECTS
    const PORT = 5000;

    app.listen(PORT, () => {
      console.log("🚀 Server running on port 5000");
    });
  } catch (error) {
    console.error("❌ Server failed to start:", error);
    process.exit(1);
  }
};

// RUN SERVER
startServer();
