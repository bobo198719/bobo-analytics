const express = require("express");
const router = express.Router();
const db = require("../db");

/**
 * 6️⃣ AI BUSINESS INSIGHTS
 */
router.get("/insights/:businessId", async (req, res) => {
  try {
    const { businessId } = req.params;

    // fetch total sales (adjusting according to your actual 'orders' schema)
    // assuming orders has 'business_id' or 'tenant_id'
    const [salesResult] = await db.query(
      "SELECT SUM(amount) as total FROM orders WHERE customer_name IS NOT NULL", // Placeholder filter if businessId is missing in early schema
      // [businessId] // Re-enable once 'orders' has business_id or tenant_id
    );

    const totalSales = salesResult[0].total || 0;
    let insight = "";
    let type = "sales";

    if (totalSales > 50000) {
      insight = "🔥 Your sales are growing fast! Consider increasing stock levels and running loyalty programs. 🚀";
    } else if (totalSales > 10000) {
      insight = "📈 Steady growth! Offer limited-time discounts to push to the next milestone. 💪";
    } else {
      insight = "⚠️ Sales are slow. Boost engagement with promotional offers and social media campaigns. 📢";
    }

    // save history
    await db.query(
      `INSERT INTO ai_insights 
      (business_id, insight, type)
      VALUES (?, ?, ?)`,
      [businessId, insight, type]
    );

    res.json({ insight, totalSales });
  } catch (err) {
    console.error("AI Insights Error:", err);
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
