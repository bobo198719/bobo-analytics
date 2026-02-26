import express from "express";
import cors from "cors";

const app = express();

/* Middlewares */
app.use(cors());
app.use(express.json());

/* Root Test */
app.get("/", (req, res) => {
  res.send("🚀 Bobo Analytics Backend Running Successfully");
});

/* HEALTH API (THIS WAS MISSING) */
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    app: "Bobo Analytics SaaS",
    server: "Running"
  });
});

export default app;