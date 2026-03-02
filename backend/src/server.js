import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Test Route
app.get("/", (req, res) => {
  res.send("Bobo Analytics API Running 🚀");
});

// Start Server ONLY after DB connects
const startServer = async () => {
  await connectDB();

  const PORT = 5000;

  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
};

startServer();
