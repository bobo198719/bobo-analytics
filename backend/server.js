require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const uploadRoutes = require("./routes/upload");
const productRoutes = require("./routes/products");
const orderRoutes = require("./routes/orders");
const authRoutes = require("./routes/auth");
const settingsRoutes = require("./routes/settings");

const fs = require('fs');

const app = express();

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, "public", "menu-images");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

app.use(cors());

// Serve images from the internal public directory
app.use("/menu-images", express.static(uploadDir));

// Serve images from permanent storage (VPS)
const STORAGE_ROOT = "/var/www/storage";
if (fs.existsSync(STORAGE_ROOT)) {
    app.use("/storage", express.static(STORAGE_ROOT));
}

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.use("/api", uploadRoutes);
app.use("/api", productRoutes);
app.use("/api", orderRoutes);
app.use("/api", authRoutes);
app.use("/api", settingsRoutes);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 MySQL-backed Server running on port ${PORT}`);
});

// Set server timeout to 60 seconds
server.timeout = 60000;
