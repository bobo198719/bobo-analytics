require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const uploadRoutes = require("./routes/upload");
const productRoutes = require("./routes/products");
const orderRoutes = require("./routes/orders");

const app = express();

app.use(cors());
app.use(express.json());

// Serve images from the public directory in the root
app.use("/menu-images", express.static(path.join(__dirname, "..", "public", "menu-images")));

app.use("/api", uploadRoutes);
app.use("/api", productRoutes);
app.use("/api", orderRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 MySQL-backed Server running on port ${PORT}`);
});
