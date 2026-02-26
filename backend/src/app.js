import express from "express";

const app = express();

// middleware
app.use(express.json());

// ROOT TEST
app.get("/", (req, res) => {
  res.send("🚀 Bobo Analytics Backend Running Successfully");
});

// HEALTH CHECK API
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    app: "Bobo Analytics SaaS",
    server: "Running"
  });
});

export default app;