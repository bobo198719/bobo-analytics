import express from "express";
import cors from "cors";
import { MongoClient } from "mongodb";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 5000;

const MONGO_URI = "mongodb://127.0.0.1:27017";

async function startServer() {
  try {
    console.log("⏳ Connecting MongoDB...");

    const client = new MongoClient(MONGO_URI);
    await client.connect();

    console.log("✅ MongoDB Connected Successfully");

    const db = client.db("boboAnalytics");

    app.get("/", (req, res) => {
      res.send("Bobo Analytics API Running 🚀");
    });

    app.get("/api/health", (req, res) => {
      res.json({
        status: "OK",
        database: "Connected"
      });
    });

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error);
  }
}

startServer();
