import express from "express";
import cors from "cors";
import { MongoClient } from "mongodb";

const app = express();

app.use(cors());
app.use(express.json());

// ✅ LOCAL MongoDB Connection
const MONGO_URI = "mongodb://127.0.0.1:27017";

async function startServer() {
  try {
    console.log("⏳ Connecting to Local MongoDB...");

    const client = new MongoClient(MONGO_URI);

    await client.connect();

    console.log("✅ MongoDB Connected Successfully");

    // Create / Use database
    const db = client.db("boboAnalytics");

    // Test route
    app.get("/", (req, res) => {
      res.send("Bobo Analytics Backend Running 🚀");
    });

    // Health API
    app.get("/api/health", (req, res) => {
      res.json({
        status: "OK",
        database: "Connected",
      });
    });

    const PORT = 5000;

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error);
  }
}

startServer();