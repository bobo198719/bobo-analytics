const express = require("express");
const router = express.Router();
const db = require("../db");

/**
 * 6️⃣ AI BUSINESS INSIGHTS
 */
router.get("/insights", async (req, res) => {
  try {
    const [[users]] = await db.query("SELECT COUNT(*) as total FROM saas_users");
    const [[revenue]] = await db.query("SELECT SUM(amount) as total FROM payments");

    let insight = "";

    if (users.total > 10) {
      insight = "🚀 Platform is growing fast. Consider multi-region expansion.";
    } else {
      insight = "⚠️ Growth is at early stage. Need more customer acquisition.";
    }

    if (revenue.total > 10000) {
      insight += " | 💰 Revenue is strong. Reinvest in AI tools.";
    }

    res.json({ insight, totalUsers: users.total, totalRevenue: revenue.total || 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * 7️⃣ FETCH RECENT INSIGHTS
 */
router.get("/history/:businessId", async (req, res) => {
  try {
    const { businessId } = req.params;
    const [history] = await db.query(
      "SELECT insight, type, created_at FROM ai_insights WHERE business_id=? ORDER BY created_at DESC LIMIT 5",
      [businessId]
    );
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
