const express = require("express");
const router = express.Router();
const db = require("../db");
const bcrypt = require("bcrypt");
const { sendWhatsAppAlert } = require("../services/alerts");

/**
 * WhatsApp Alert for Admin
 */
function notifyAdmin(user) {
  const adminPhone = "91XXXXXXXXXX"; // Replace with your phone number
  const msg = encodeURIComponent(
    `🚀 New Signup Alert!\n\nBusiness: ${user.businessName}\nIndustry: ${user.industry}\nPlan: ${user.plan || 'trial'}\nOwner: ${user.ownerName}`
  );
  const url = `https://wa.me/${adminPhone}?text=${msg}`;
  console.log("Admin WhatsApp Alert:", url);
}

/**
 * 2️⃣ SIGNUP (SAVE USER + NOTIFY ADMIN)
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
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 30);

    const [result] = await db.query(
      `INSERT INTO saas_users 
      (industry, business_name, owner_name, email, phone, username, password_hash, plan_type, expiry_date, amount_paid)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [industry, businessName, ownerName, email, phone, username, hashedPassword, plan || "trial", expiry, 0]
    );

    const newUserId = result.insertId;

    // Save History
    await db.query(
      `INSERT INTO saas_user_history 
      (user_id, industry, business_name, username, plan_type, status, action)
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [newUserId, industry, businessName, username, plan || "trial", "active", "created"]
    );

    // Alerts
    sendWhatsAppAlert(phone, businessName);
    notifyAdmin({ businessName, industry, plan, ownerName });

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
      "SELECT id, industry, business_name, owner_name, email, phone, username, plan_type, expiry_date, status, amount_paid, created_at FROM saas_users ORDER BY created_at DESC"
    );
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Error fetching users", error: err.message });
  }
});

/**
 * 4️⃣ ACTIVATE PLAN (UPGRADE USER)
 */
router.post("/admin/activate-plan", async (req, res) => {
  try {
    const { userId, plan, amount } = req.body;

    await db.query(
      `UPDATE saas_users 
      SET plan_type=?, status='active', amount_paid=amount_paid + ?, expiry_date=DATE_ADD(NOW(), INTERVAL 30 DAY)
      WHERE id=?`,
      [plan, amount, userId]
    );

    // Save history
    await db.query(
      `INSERT INTO saas_user_history 
      (user_id, plan_type, status, action)
      VALUES (?, ?, ?, ?)`,
      [userId, plan, "active", "plan_activated"]
    );

    res.json({ message: "Plan Activated", success: true });
  } catch (err) {
    res.status(500).json({ message: "Activation failed", error: err.message });
  }
});

/**
 * 5️⃣ ADMIN DASHBOARD (PRO ANALYTICS)
 */
router.get("/admin/dashboard", async (req, res) => {
  try {
    const [[totalResult]] = await db.query("SELECT COUNT(*) as total FROM saas_users");
    const [[activeResult]] = await db.query("SELECT COUNT(*) as active FROM saas_users WHERE status='active'");
    const [[trialResult]] = await db.query("SELECT COUNT(*) as trial FROM saas_users WHERE plan_type='trial'");
    const [[revenueResult]] = await db.query("SELECT SUM(amount_paid) as revenue FROM saas_users");

    res.json({
      total: totalResult.total,
      active: activeResult.active,
      trial: trialResult.total,
      revenue: revenueResult.revenue || 0
    });
  } catch (err) {
    res.status(500).json({ message: "Dashboard error", error: err.message });
  }
});

/**
 * 6️⃣ INDUSTRY ANALYTICS
 */
router.get("/api/admin/industry-stats", async (req, res) => {
  try {
    const [data] = await db.query(
      "SELECT industry, COUNT(*) as total FROM saas_users GROUP BY industry"
    );
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * 7️⃣ DAILY SIGNUPS
 */
router.get("/admin/daily-signups", async (req, res) => {
  try {
    const [data] = await db.query(
      `SELECT DATE(created_at) as date, COUNT(*) as count 
      FROM saas_users 
      GROUP BY DATE(created_at)
      ORDER BY date DESC LIMIT 14`
    );
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * 8️⃣ CONVERSION RATE
 */
router.get("/admin/conversion", async (req, res) => {
  try {
    const [[trial]] = await db.query("SELECT COUNT(*) as total FROM saas_users WHERE plan_type='trial'");
    const [[paid]] = await db.query("SELECT COUNT(*) as total FROM saas_users WHERE plan_type != 'trial'");

    const conversion = trial.total > 0 ? ((paid.total / (trial.total + paid.total)) * 100).toFixed(2) : "0.00";

    res.json({
      trial: trial.total,
      paid: paid.total,
      conversion: conversion
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Reuse existing status and delete routes (updated for plan_type)
router.post("/admin/update-status", async (req, res) => {
  try {
    const { userId, status } = req.body;
    await db.query("UPDATE saas_users SET status=? WHERE id=?", [status, userId]);
    const [[user]] = await db.query("SELECT * FROM saas_users WHERE id=?", [userId]);
    await db.query(
      `INSERT INTO saas_user_history (user_id, industry, business_name, username, plan_type, status, action)
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userId, user.industry, user.business_name, user.username, user.plan_type, status, "status_updated"]
    );
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post("/admin/delete-user", async (req, res) => {
  try {
    const { userId } = req.body;
    const [[user]] = await db.query("SELECT * FROM saas_users WHERE id=?", [userId]);
    if (!user) return res.status(404).json({ message: "Not found" });
    await db.query(
      `INSERT INTO saas_user_history (user_id, industry, business_name, username, plan_type, status, action)
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userId, user.industry, user.business_name, user.username, user.plan_type, "deleted", "deleted"]
    );
    await db.query("DELETE FROM saas_users WHERE id=?", [userId]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get("/admin/user-history", async (req, res) => {
  try {
    const [history] = await db.query("SELECT * FROM saas_user_history ORDER BY timestamp DESC");
    res.json(history);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post("/admin/reset-password", async (req, res) => {
  try {
    const { userId, newPassword } = req.body;
    const hash = await bcrypt.hash(newPassword, 10);
    await db.query("UPDATE saas_users SET password_hash=? WHERE id=?", [hash, userId]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
