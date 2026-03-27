const express = require("express");
const router = express.Router();
const db = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "bobo-master-secure-v58-key";

/**
 * 🔐 LOGIN WITH ENTERPRISE TRACKING (JWT ENABLED)
 */
router.post("/login", async (req, res) => {
  const { username, email, password, industry } = req.body;
  const loginIdentifier = username || email;
  
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || "0.0.0.0";
  const device = req.headers['user-agent'] || "Unknown Device";

  try {
    // 1. Check saas_users (Support both Username and Email)
    const [rows] = await db.query(
      "SELECT * FROM saas_users WHERE username = ? OR email = ?",
      [loginIdentifier, loginIdentifier]
    );

    let user = rows[0];

    if (!user) {
      // 2. Fallback: Check admin_users (Master Access Hub)
      const [adminRows] = await db.query(
        "SELECT * FROM admin_users WHERE username = ?",
        [loginIdentifier]
      );
      user = adminRows[0];
    }

    if (!user) {
      // Log failure (User Not Found)
      await db.query(
        "INSERT INTO login_logs (username, ip_address, device, status) VALUES (?, ?, ?, ?)",
        [loginIdentifier, ip, device, "failed"]
      );
      return res.status(401).json({ success: false, message: "Credential identity not found in secure node." });
    }

    // 3. Verify Password (bcrypt)
    const valid = await bcrypt.compare(password, user.password_hash);

    if (!valid) {
      // Log failure (Wrong Password)
      await db.query(
        "INSERT INTO login_logs (username, ip_address, device, status) VALUES (?, ?, ?, ?)",
        [loginIdentifier, ip, device, "failed_password"]
      );
      return res.status(401).json({ success: false, message: "Invalid key fragment. Access denied." });
    }

    // 4. Industry Portal Verification (Optional check if provided)
    if (industry && user.industry && user.industry.toLowerCase() !== industry.toLowerCase()) {
        await db.query(
            "INSERT INTO login_logs (username, ip_address, device, status) VALUES (?, ?, ?, 'portal_denied')",
            [loginIdentifier, ip, device]
        );
        return res.status(403).json({ success: false, message: `Access denied for the ${industry} portal.` });
    }

    // 5. Generate Secure Session Token
    const token = jwt.sign(
      { 
        id: user.id, 
        username: user.username, 
        industry: user.industry,
        role: user.role || 'user'
      }, 
      JWT_SECRET, 
      { expiresIn: "24h" }
    );

    // 6. Success Log
    await db.query(
      "INSERT INTO login_logs (username, ip_address, device, status) VALUES (?, ?, ?, ?)",
      [loginIdentifier, ip, device, "success"]
    );

    res.json({
      success: true,
      token: token,
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
    res.status(500).json({ success: false, message: "Secure Node Connectivity Failure." });
  }
});

module.exports = router;

