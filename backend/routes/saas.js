const express = require("express");
const router = express.Router();
const db = require("../db");
const bcrypt = require("bcrypt");
const { sendWhatsAppAlert } = require("../services/alerts");

/**
 * 2️⃣ SIGNUP (SAVE USER IN MASTER TABLE)
 */
router.post("/signup", async (req, res) => {
  try {
    const {
      industry,
      businessName,
      ownerName,
      email,
      phone,
      username,
      password,
      plan
    } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    // Initial expiry = 30 days
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 30);

    await db.query(
      `INSERT INTO saas_users 
      (industry, business_name, owner_name, email, phone, username, password_hash, plan, expiry_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        industry,
        businessName,
        ownerName,
        email,
        phone,
        username,
        hashedPassword,
        plan,
        expiry
      ]
    );

    // WhatsApp Alert
    sendWhatsAppAlert(phone, businessName);

    res.json({ message: "User Created", success: true });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Failed to create user", error: err.message });
  }
});

/**
 * 3️⃣ ADMIN USERS API
 */
router.get("/admin/users", async (req, res) => {
  try {
    const [users] = await db.query(
      "SELECT id, industry, business_name, owner_name, email, phone, username, plan, expiry_date, status, created_at FROM saas_users ORDER BY created_at DESC"
    );
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Error fetching users", error: err.message });
  }
});

/**
 * 4️⃣ ADMIN DASHBOARD (SUPER POWERFUL)
 */
router.get("/admin/dashboard", async (req, res) => {
  try {
    // These queries return [rows, fields]
    const [[totalResult]] = await db.query("SELECT COUNT(*) as total FROM saas_users");
    const [[activeResult]] = await db.query("SELECT COUNT(*) as active FROM saas_users WHERE status='active'");
    const [[expiredResult]] = await db.query("SELECT COUNT(*) as expired FROM saas_users WHERE expiry_date < CURDATE()");
    const [[revenueResult]] = await db.query("SELECT COUNT(*) * 499 as revenue FROM saas_users WHERE status='active'");

    res.json({
      totalUsers: totalResult.total,
      activeUsers: activeResult.active,
      expiredUsers: expiredResult.expired,
      revenue: revenueResult.revenue
    });
  } catch (err) {
    res.status(500).json({ message: "Error loading dashboard", error: err.message });
  }
});

/**
 * 6️⃣ PASSWORD RESET (ADMIN CONTROL)
 */
router.post("/admin/reset-password", async (req, res) => {
  try {
    const { userId, newPassword } = req.body;
    const hash = await bcrypt.hash(newPassword, 10);

    await db.query(
      "UPDATE saas_users SET password_hash=? WHERE id=?",
      [hash, userId]
    );

    res.json({ message: "Password Updated", success: true });
  } catch (err) {
    res.status(500).json({ message: "Failed to reset password", error: err.message });
  }
});

module.exports = router;
