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
const restaurantRoutes = require("./routes/restaurant");
const restaurantV2Routes = require("./routes/restaurant_v2");
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

// 🛡️ Asset Delivery Service: Securely map /api/uploads to Production Storage
app.use("/api/uploads", (req, res, next) => {
    const STORAGE_DIR = "/var/www/storage/bakery/images";
    if (fs.existsSync(STORAGE_DIR)) {
        return express.static(STORAGE_DIR)(req, res, next);
    }
    express.static(path.join(__dirname, "uploads"))(req, res, next);
});

// Backward compatibility for /menu-images
app.use("/menu-images", (req, res, next) => {
    const STORAGE_DIR = "/var/www/storage/bakery/images";
    if (fs.existsSync(STORAGE_DIR)) {
        return express.static(STORAGE_DIR)(req, res, next);
    }
    express.static(uploadDir)(req, res, next);
});

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
app.use("/api/auth", authRoutes);
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
app.use("/api", restaurantRoutes);
app.use("/api/v2/restaurant", restaurantV2Routes);

const diagRoutes = require("./routes/diag");
const diagDbRoutes = require("./routes/diag-db");
app.use("/api/diag", diagRoutes);
app.use("/api/diag/db", diagDbRoutes);

app.get("/", (req, res) => {
    res.send(`
    <html>
    <head>
      <title>Bobo OS | Diagnostic Control</title>
      <style>
        body { background:#05081a; color:white; font-family:'Plus Jakarta Sans', sans-serif; text-align:center; padding:50px; }
        .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; max-width: 1000px; margin: 40px auto; }
        .card { background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); padding:30px; border-radius:32px; backdrop-blur:xl; }
        h1 { font-family: 'Italic', sans-serif; font-weight: 900; font-style: italic; text-transform: uppercase; letter-spacing: -1px; }
        h3 { color:rgba(255,255,255,0.3); text-transform: uppercase; font-size: 10px; letter-spacing: 2px; }
        h2 { font-size: 32px; color: #f97316; margin: 10px 0; }
        button { background:#ea580c; color:white; border:none; padding:15px 40px; border-radius:20px; font-weight:900; text-transform:uppercase; cursor:pointer; }
      </style>
    </head>
    <body>
      <h1>Bobo OS Intelligence Node</h1>
      <div class="grid">
        <div class="card"><h3>Revenue</h3><h2 id="rev">0</h2></div>
        <div class="card"><h3>Active Orders</h3><h2 id="ord">0</h2></div>
        <div class="card"><h3>Tables</h3><h2 id="tab">0</h2></div>
        <div class="card"><h3>Kitchen</h3><h2 id="kit">0</h2></div>
      </div>
      <button onclick="seed()">Execute Diagnostic Seed</button>
      <script>
        function loadData() {
          fetch('/api/v2/restaurant/dashboard').then(r=>r.json()).then(d=>{
            document.getElementById('rev').innerText = '₹' + d.total_revenue;
            document.getElementById('ord').innerText = d.orders_today;
            document.getElementById('tab').innerText = d.active_tables;
            document.getElementById('kit').innerText = d.kitchen_queue;
          });
        }
        function seed() { fetch('/api/v2/restaurant/seed').then(()=>loadData()); }
        loadData(); setInterval(loadData, 3000);
      </script>
    </body>
    </html>
    `);
});

app.get("/api/db-repair", async (req, res) => {
    try {
        const pg = require("./pg_db");
        await pg.pool.query('ALTER TABLE orders ADD COLUMN IF NOT EXISTS special_notes TEXT');
        res.json({ success: true, message: "Orders schema repaired. special_notes added." });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

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
    ws.on('message', (message) => {
        try {
            const parsed = JSON.parse(message);
            if (parsed.type === 'NEW_ORDER' || parsed.type === 'STATUS_CHANGE') {
                wss.clients.forEach(client => {
                    if (client !== ws && client.readyState === WebSocket.OPEN) {
                        client.send(message.toString());
                    }
                });
            }
        } catch(e) {}
    });
});

global.broadcastNewOrder = (order) => {
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: "NEW_ORDER", order }));
        }
    });
};
