import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";

const app = express();

app.use(cors());
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.send("Bobo Analytics API Running 🚀");
});

const startServer = async () => {
  await connectDB();

  app.listen(5000, () => {
    console.log("🚀 Server running on port 5000");
  });
};

startServer();
