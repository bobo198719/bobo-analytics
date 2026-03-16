const express = require("express");
const router = express.Router();
const db = require("../db");

// Login endpoint
router.post("/login", async (req, res) => {
  const { username, password, industry } = req.body;

  try {
    const [rows] = await db.query(
      "SELECT * FROM users WHERE username = ? AND password = ? AND industry = ?",
      [username, password, industry]
    );

    if (rows.length > 0) {
      const user = rows[0];
      res.json({
        success: true,
        user: {
          id: user.username,
          name: user.business_name,
          industry: user.industry,
          plan: user.plan
        }
      });
    } else {
      res.status(401).json({ success: false, message: "Invalid credentials or industry" });
    }
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Registration endpoint (for internal use/provisioning)
router.post("/register", async (req, res) => {
  const { username, password, business_name, industry, plan } = req.body;

  try {
    await db.query(
      "INSERT INTO users (username, password, business_name, industry, plan) VALUES (?, ?, ?, ?, ?)",
      [username, password, business_name, industry, plan || 'starter']
    );
    res.json({ success: true, message: "User created" });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ success: false, message: "Username already exists" });
    }
    console.error("Register Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
