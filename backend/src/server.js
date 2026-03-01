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
   HEALTH CHECK API
====================== */
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Bobo Analytics API Working 🚀",
  });
});

/* ======================
   CONNECT DATABASE
====================== */
await connectDB();

/* ======================
   START SERVER
====================== */
const PORT = 5000;

app.listen(PORT, () => {
  console.log("🚀 Server running on port 5000");
});
