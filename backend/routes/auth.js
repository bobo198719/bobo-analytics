const express = require("express");
const router = express.Router();
const db = require("../db");
const bcrypt = require("bcrypt");

/**
 * 🔐 LOGIN WITH ENTERPRISE TRACKING
 */
router.post("/login", async (req, res) => {
  const { username, password, industry } = req.body;
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || "0.0.0.0";
  const device = req.headers['user-agent'] || "Unknown Device";

  try {
    // 1. Check saas_users (Primary Tenants)
    const [rows] = await db.query(
      "SELECT * FROM saas_users WHERE username = ?",
      [username]
    );

    let user = rows[0];
    let status = "failed";

    if (!user) {
      // Log failure (User Not Found)
      await db.query(
        "INSERT INTO login_logs (username, ip_address, device, status) VALUES (?, ?, ?, ?)",
        [username, ip, device, "failed"]
      );
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    // 2. Verify Password (bcrypt)
    const valid = await bcrypt.compare(password, user.password_hash);

    if (!valid) {
      // Log failure (Wrong Password)
      await db.query(
        "INSERT INTO login_logs (username, ip_address, device, status) VALUES (?, ?, ?, ?)",
        [username, ip, device, "failed"]
      );
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    // 3. Industry Portal Verification
    if (user.industry.toLowerCase() !== industry.toLowerCase()) {
        await db.query(
            "INSERT INTO login_logs (username, ip_address, device, status) VALUES (?, ?, ?, 'portal_denied')",
            [username, ip, device]
        );
        return res.status(403).json({ success: false, message: `Access denied for the ${industry} portal.` });
    }

    // 4. Success Log & Response
    await db.query(
      "INSERT INTO login_logs (username, ip_address, device, status) VALUES (?, ?, ?, ?)",
      [username, ip, device, "success"]
    );

    res.json({
      success: true,
      user: {
        id: user.id,
        business_name: user.business_name,
        industry: user.industry,
        plan: user.plan_type,
        status: user.status
      }
    });

  } catch (err) {
    console.error("Login Security Exception:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
