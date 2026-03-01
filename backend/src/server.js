const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");

const app = express();
app.use(cors());
app.use(express.json());

// ✅ MongoDB Connection String (EDIT PASSWORD HERE)
const MONGO_URI =
  "mongodb+srv://clintbobo54_db_user:Bobo@12345@cluster0.jegbytg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const client = new MongoClient(MONGO_URI);

async function connectDB() {
  try {
    await client.connect();
    console.log("✅ MongoDB Connected Successfully");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error);
  }
}

connectDB();

// Health API
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Bobo Analytics API Working 🚀",
  });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
