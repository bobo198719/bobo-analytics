import express from "express";
import cors from "cors";

const app = express();

/* Middlewares */
app.use(cors());
app.use(express.json());

/* Test Route */
app.get("/", (req, res) => {
  res.send("🚀 Bobo Analytics Backend Running Successfully");
});

export default app;
