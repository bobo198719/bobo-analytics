// ===============================
// BOBO ANALYTICS API SERVER
// Production Ready Server
// ===============================

const express = require("express");
const cors = require("cors");

const app = express();

// -------------------------------
// MIDDLEWARE
// -------------------------------
app.use(cors());
app.use(express.json());

// -------------------------------
// TEST ROUTE (Health Check)
// -------------------------------
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Bobo Analytics API Working 🚀",
  });
});

// -------------------------------
// ROOT ROUTE (Optional)
// -------------------------------
app.get("/", (req, res) => {
  res.send("Bobo Analytics Backend Running 🚀");
});

// -------------------------------
// PORT CONFIG
// -------------------------------
const PORT = 5000;

// ⭐ IMPORTANT FIX — LISTEN ON ALL NETWORKS
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});