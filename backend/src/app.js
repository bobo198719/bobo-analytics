const express = require("express");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./routes/authRoutes");

const app = express();

/* Middleware */

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* API Routes */

app.use("/api/users", authRoutes);

/* Health Check */

app.get("/", (req, res) => {
  res.json({
    message: "Bobo Analytics Backend Running"
  });
});

/* 404 Handler */

app.use((req, res) => {
  res.status(404).json({
    error: "Route not found"
  });
});

module.exports = app;
