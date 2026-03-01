import express from "express";
import cors from "cors";

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Root route (optional test)
app.get("/", (req, res) => {
  res.send("Bobo Analytics API is running 🚀");
});

// Health check route
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Bobo Analytics API Working 🚀"
  });
});

export default app;
