const express = require("express");
const router = express.Router();
const db = require("../db");
const bcrypt = require("bcrypt");
const { sendWhatsAppAlert } = require("../services/alerts");

/**
 * 2️⃣ SIGNUP (SAVE USER IN MASTER TABLE + LOG HISTORY)
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

    const [result] = await db.query(
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

    const newUserId = result.insertId;

    // 2️⃣ SAVE HISTORY ON USER CREATION
    await db.query(
      `INSERT INTO saas_user_history 
      (user_id, industry, business_name, username, plan_type, status, action)
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        newUserId,
        industry,
        businessName,
        username,
        plan,
        "active",
        "created"
      ]
    );

    // WhatsApp Alert
    sendWhatsAppAlert(phone, businessName);

    res.json({ message: "User Created", success: true, userId: newUserId });
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
 * 5️⃣ TRACK STATUS CHANGE
 */
router.post("/admin/update-status", async (req, res) => {
  try {
    const { userId, status } = req.body;

    // update main table
    await db.query(
      "UPDATE saas_users SET status=? WHERE id=?",
      [status, userId]
    );

    // fetch user details
    const [[user]] = await db.query(
      "SELECT * FROM saas_users WHERE id=?",
      [userId]
    );

    if (!user) return res.status(404).json({ message: "User not found" });

    // save history
    await db.query(
      `INSERT INTO saas_user_history 
      (user_id, industry, business_name, username, plan_type, status, action)
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        user.industry,
        user.business_name,
        user.username,
        user.plan,
        status,
        "status_updated"
      ]
    );

    res.json({ message: "Status Updated", success: true });
  } catch (err) {
    res.status(500).json({ message: "Failed to update status", error: err.message });
  }
});

/**
 * 6️⃣ TRACK DELETE (VERY IMPORTANT)
 */
router.post("/admin/delete-user", async (req, res) => {
  try {
    const { userId } = req.body;

    // get user before deleting
    const [[user]] = await db.query(
      "SELECT * FROM saas_users WHERE id=?",
      [userId]
    );

    if (!user) return res.status(404).json({ message: "User not found" });

    // save history BEFORE delete
    await db.query(
      `INSERT INTO saas_user_history 
      (user_id, industry, business_name, username, plan_type, status, action)
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        user.industry,
        user.business_name,
        user.username,
        user.plan,
        "deleted",
        "deleted"
      ]
    );

    // delete user
    await db.query(
      "DELETE FROM saas_users WHERE id=?",
      [userId]
    );

    res.json({ message: "User Deleted", success: true });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete user", error: err.message });
  }
});

/**
 * 7️⃣ ADMIN API — FULL HISTORY
 */
router.get("/admin/user-history", async (req, res) => {
  try {
    const [history] = await db.query(
      "SELECT * FROM saas_user_history ORDER BY timestamp DESC"
    );
    res.json(history);
  } catch (err) {
    res.status(500).json({ message: "Error fetching history", error: err.message });
  }
});

/**
 * 8️⃣ PASSWORD RESET (ADMIN CONTROL)
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
