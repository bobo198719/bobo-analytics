require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const uploadRoutes = require("./routes/upload");
const productRoutes = require("./routes/products");
const orderRoutes = require("./routes/orders");
const authRoutes = require("./routes/auth");
const settingsRoutes = require("./routes/settings");
const followRoutes = require("./routes/follow");
const offerRoutes = require("./routes/offers");
const bakeryRoutes = require("./routes/bakery");
const customerRoutes = require("./routes/customers");
const recipeRoutes = require("./routes/recipes");
const saasRoutes = require("./routes/saas");
const staffRoutes = require("./routes/staff");
const whatsappRoutes = require("./routes/whatsapp");
const aiRoutes = require("./routes/ai");
const securityRoutes = require("./routes/security");
const { startExpiryCron } = require("./services/expiryCron");

const fs = require('fs');

const app = express();

// Start Subscription Expiry Cron
startExpiryCron();

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, "public", "menu-images");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

app.use(cors());

// Serve uploads directory specifically (proxied via /api/uploads)
app.use("/api/uploads", express.static(path.join(__dirname, "uploads")));

// Serve images from the internal public directory
app.use("/menu-images", express.static(uploadDir));

// Ensure Permanent Storage (VPS) Directory Structure
const STORAGE_ROOT = "/var/www/storage";
const BAKERY_IMAGES = path.join(STORAGE_ROOT, "bakery", "images");

try {
    if (!fs.existsSync(BAKERY_IMAGES)) {
        fs.mkdirSync(BAKERY_IMAGES, { recursive: true });
        // Set permissions if possible
        try { fs.chmodSync(STORAGE_ROOT, '755'); } catch(e) {}
    }
} catch (err) {
    console.warn("⚠️ Warning: Could not create permanent storage directory. Local fallback will be used.");
}

// Serve images from permanent storage (VPS) with high-performance caching
app.use("/storage", express.static(STORAGE_ROOT, {
    maxAge: '1y',
    setHeaders: (res) => {
        res.set('Cache-Control', 'public, max-age=31536000, immutable');
    }
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.use("/api", uploadRoutes);
app.use("/api", productRoutes);
app.use("/api", orderRoutes);
app.use("/api", authRoutes);
app.use("/api", settingsRoutes);
app.use("/api", followRoutes);
app.use("/api", offerRoutes);
app.use("/api", bakeryRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/recipes", recipeRoutes);
app.use("/api", saasRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/whatsapp", whatsappRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/security", securityRoutes);

app.get("/api/system-repair", async (req, res) => {
    try {
        const { exec } = require('child_process');
        const cmd = `chmod -R 755 ${STORAGE_ROOT} && chown -R www-data:www-data ${STORAGE_ROOT}`;
        
        exec(cmd, (error, stdout, stderr) => {
            if (error) {
                console.error("Repair Error:", error);
                return res.status(500).json({ success: false, error: error.message });
            }
            res.json({ success: true, message: "Permissions and ownership repaired.", output: stdout });
        });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 MySQL-backed Server running on port ${PORT}`);
});

// Set server timeout to 60 seconds
server.timeout = 60000;

// Real-time Order Notifications (WebSocket)
const WebSocket = require("ws");
const wss = new WebSocket.Server({ port: 8080 });

wss.on("connection", ws => {
    console.log("🔔 Dashboard Client connected to Real-time Hub");
});

global.broadcastNewOrder = (order) => {
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: "NEW_ORDER", order }));
        }
    });
};
