const express = require("express");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./routes/authRoutes");
const inventoryRoutes = require("./routes/inventoryRoutes");
const billRoutes = require("./routes/billRoutes");
const whatsappRoutes = require("./routes/whatsappRoutes");
const aiRoutes = require("./routes/aiRoutes");
// const customerRoutes = require("./routes/customerRoutes");
const refillRoutes = require("./routes/refillRoutes");
// const scanBillRoutes = require("./routes/scanBillRoutes");
// const medicineRoutes = require("./routes/medicineRoutes");
const productImageRoutes = require("./routes/productImageRoutes");
const triviaProductRoutes = require("../routes/products");
const triviaOrderRoutes = require("../routes/orders");
const triviaUploadRoutes = require("../routes/upload");

// Initialize Cloud Database
require("../mongo");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Bobo Analytics API Working 🚀",
  });
});

// API Routes - Using original base paths
app.use("/api/users", authRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api", billRoutes);
app.use("/api/whatsapp", whatsappRoutes);
app.use("/api/ai", aiRoutes);
// app.use("/api/customers", customerRoutes);
app.use("/api/refills", refillRoutes);
// app.use("/api", scanBillRoutes);
// app.use("/api", medicineRoutes);
app.use("/api", productImageRoutes);
app.use("/api/products", triviaProductRoutes);
app.use("/api/orders", triviaOrderRoutes);
app.use("/api/v2", triviaUploadRoutes);

// Serve static files AFTER API routes to prevent collision
app.use(express.static(path.join(__dirname, "..", "..", "public")));

module.exports = app;
