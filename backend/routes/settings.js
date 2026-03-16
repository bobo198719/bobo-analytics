const express = require("express");
const router = express.Router();
const db = require("../db");

// Get settings for a tenant
router.get("/settings/:tenantId", async (req, res) => {
  const { tenantId } = req.params;
  try {
    const [rows] = await db.query("SELECT settings FROM site_settings WHERE tenant_id = ?", [tenantId]);
    if (rows.length > 0) {
      res.json(rows[0].settings);
    } else {
      res.status(404).json({ message: "Settings not found" });
    }
  } catch (err) {
    console.error("Get Settings Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Save settings for a tenant (UPSERT)
router.post("/settings", async (req, res) => {
  const { tenantId, settings } = req.body;
  if (!tenantId) return res.status(400).json({ message: "TenantId required" });

  try {
    await db.query(
      "INSERT INTO site_settings (tenant_id, settings) VALUES (?, ?) ON DUPLICATE KEY UPDATE settings = ?",
      [tenantId, JSON.stringify(settings), JSON.stringify(settings)]
    );
    res.json({ success: true, message: "Settings saved successfully" });
  } catch (err) {
    console.error("Save Settings Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
