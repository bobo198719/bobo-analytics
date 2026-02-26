import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("🚀 Bobo Analytics Backend Running Successfully");
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    app: "Bobo Analytics SaaS",
    server: "Running"
  });
});

export default app;