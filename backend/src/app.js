const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const inventoryRoutes = require("./routes/inventoryRoutes");

const app = express();

/* Middlewares */

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* API Routes */

app.use("/api/users", authRoutes);
app.use("/api/inventory", inventoryRoutes);

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
