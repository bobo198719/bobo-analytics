import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import uploadRoute from "./routes/uploadImage.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Main Image Upload API
app.use("/api", uploadRoute);

// Health Check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Bakers OS Image Server running 🚀" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log("Bakers OS Image Server running on port", PORT);
});
