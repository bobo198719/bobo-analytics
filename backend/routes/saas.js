const express = require("express");
const router = express.Router();
const db = require("../db");
const bcrypt = require("bcrypt");
const { sendWhatsAppAlert } = require("../services/alerts");

/**
 * 1️⃣ ADMIN: CREATE USER (PROVISIONING)
 */
router.post("/admin/create-user", async (req, res) => {
  try {
    const { businessName, username, password, industry, planType } = req.body;
    const hash = await bcrypt.hash(password, 10);
    
    // 1. Create Tenant — also store plain_password for admin visibility
    const [result] = await db.query(
      `INSERT INTO saas_users 
      (business_name, username, password_hash, plain_password, industry, plan_type, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, 'active', NOW())`,
      [businessName, username, hash, password, industry, planType]
    );

    // 2. Mirror in Admin Tracking System
    await db.query(
      `INSERT INTO admin_users 
      (username, password_hash, industry, role, status)
      VALUES (?, ?, ?, ?, 'active')`,
      [username, hash, industry, 'owner']
    );

    res.json({ success: true, userId: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * 2️⃣ ADMIN: FETCH USERS
 */
router.get("/admin/users", async (req, res) => {
  try {
    const [users] = await db.query(
      `SELECT id, business_name, username, plain_password, email, industry, plan_type, status, created_at 
      FROM saas_users 
      ORDER BY created_at DESC`
    );
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * 🔧 MIGRATION: Add plain_password column if missing, back-fill from Chrome saved list
 */
router.post("/admin/add-plain-password", async (req, res) => {
  try {
    // Add column if it doesn't exist
    await db.query(`ALTER TABLE saas_users ADD COLUMN IF NOT EXISTS plain_password VARCHAR(255) DEFAULT NULL`).catch(() => {});
    // Accept bulk updates: [{ username, password }]
    const { updates } = req.body; // array of { username, password }
    const results = [];
    for (const u of (updates || [])) {
      const [r] = await db.query(
        "UPDATE saas_users SET plain_password = ? WHERE username = ? OR email = ?",
        [u.password, u.username, u.username]
      );
      results.push({ username: u.username, updated: r.affectedRows });
    }
    res.json({ success: true, results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * 3️⃣ SUBSCRIPTION PLANS
 */
router.post("/admin/create-plan", async (req, res) => {
  try {
    const { name, price, duration, features } = req.body;
    await db.query(
      `INSERT INTO plans (name, price, duration, features)
      VALUES (?, ?, ?, ?)`,
      [name, price, duration, JSON.stringify(features)]
    );
    res.json({ success: true, message: "Plan Created" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/admin/plans", async (req, res) => {
  try {
    const [plans] = await db.query("SELECT * FROM plans");
    res.json(plans);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * 4️⃣ REVENUE & PAYMENTS
 */
router.post("/payment/manual", async (req, res) => {
  try {
    const { userId, amount, method } = req.body;
    await db.query(
      `INSERT INTO payments (user_id, amount, method, status)
      VALUES (?, ?, ?, 'success')`,
      [userId, amount, method]
    );
    await db.query(
      `UPDATE saas_users SET amount_paid = amount_paid + ? WHERE id=?`,
      [amount, userId]
    );
    res.json({ success: true, message: "Payment recorded" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/admin/revenue", async (req, res) => {
  try {
    const [[revenue]] = await db.query("SELECT SUM(amount) as total FROM payments");
    const [records] = await db.query(
      `SELECT p.*, u.business_name, u.plan_type 
      FROM payments p
      JOIN saas_users u ON p.user_id=u.id
      ORDER BY p.created_at DESC`
    );
    res.json({ total: revenue.total || 0, records });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * 5️⃣ REGISTRATION QUEUE (LEADS)
 */
router.post("/public/signup", async (req, res) => {
  try {
    const { name, phone, industry } = req.body;
    await db.query(
      `INSERT INTO leads (name, phone, industry, status)
      VALUES (?, ?, ?, 'pending')`,
      [name, phone, industry]
    );
    res.json({ success: true, message: "Lead added" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/admin/leads", async (req, res) => {
  try {
    const [leads] = await db.query("SELECT * FROM leads ORDER BY created_at DESC");
    res.json(leads);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * 6️⃣ EXISTING SAAS ROUTES (SYNCED)
 */
router.get("/admin/dashboard", async (req, res) => {
  try {
    const [[totalResult]] = await db.query("SELECT COUNT(*) as total FROM saas_users");
    const [[activeResult]] = await db.query("SELECT COUNT(*) as active FROM saas_users WHERE status='active'");
    const [[revResult]] = await db.query("SELECT SUM(amount) as revenue FROM payments");
    res.json({
      total: totalResult.total,
      active: activeResult.active,
      revenue: revResult.revenue || 0
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post("/admin/update-status", async (req, res) => {
  try {
    const { userId, status } = req.body;
    await db.query("UPDATE saas_users SET status=? WHERE id=?", [status, userId]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post("/admin/update-plan", async (req, res) => {
  try {
    const { userId, planType } = req.body;
    const validPlans = ['trial', 'pro', 'enterprise'];
    if (!validPlans.includes(planType)) return res.status(400).json({ error: 'Invalid plan type' });
    await db.query("UPDATE saas_users SET plan_type=? WHERE id=?", [planType, userId]);
    res.json({ success: true, message: `Plan updated to ${planType}` });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post("/admin/delete-user", async (req, res) => {
  try {
    const { userId } = req.body;
    await db.query("DELETE FROM saas_users WHERE id=?", [userId]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post("/admin/send-promo", async (req, res) => {
  try {
    const { targetType, targetValue, channels, message } = req.body;
    // Real-world: integrate with Twilio/SendGrid/WhatsApp here.
    console.log(`[PROMO] Channels: [${channels.join(', ')}]`);
    console.log(`[PROMO] Target: ${targetType} -> ${targetValue}`);
    console.log(`[PROMO] Message: "${message}"`);
    
    let userQuery = "";
    let params = [];
    if (targetType === 'user') {
      userQuery = "SELECT id, email, username FROM saas_users WHERE id = ?";
      params = [targetValue];
    } else if (targetType === 'industry') {
      userQuery = "SELECT id, email, username FROM saas_users WHERE industry = ?";
      params = [targetValue];
    } else {
      userQuery = "SELECT id, email, username FROM saas_users";
    }
    
    const [users] = await db.query(userQuery, params);
    
    res.json({ success: true, message: `Promo broadcasted to ${users.length} users successfully.` });
  } catch (err) { res.status(500).json({ error: err.message }); }
});


/**
 * 🔑 ADMIN: RESET USER PASSWORD
 */
router.post("/admin/reset-password", async (req, res) => {
  try {
    const { userId, newPassword } = req.body;
    if (!userId || !newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: "userId and newPassword (min 6 chars) are required." });
    }
    const hash = await bcrypt.hash(newPassword, 10);

    // Update saas_users — also save plaintext for admin view
    await db.query("UPDATE saas_users SET password_hash = ?, plain_password = ? WHERE id = ?", [hash, newPassword, userId]);

    // Also update admin_users mirror
    const [[user]] = await db.query("SELECT username FROM saas_users WHERE id = ?", [userId]);
    if (user) {
      await db.query("UPDATE admin_users SET password_hash = ? WHERE username = ?", [hash, user.username]);
    }

    res.json({ success: true, message: `Password reset for user #${userId}` });
  } catch (err) {
    console.error("Reset Password Error:", err);
    res.status(500).json({ error: err.message });
  }
});

router.get("/admin/logins", async (req, res) => {
  try {
    const [users] = await db.query(
      `SELECT id, username, industry, role, status, created_at 
      FROM admin_users 
      ORDER BY created_at DESC`
    );
    res.json(users);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post("/admin/suspend-user", async (req, res) => {
  try {
    const { id } = req.body;
    await db.query("UPDATE admin_users SET status='suspended' WHERE id=?", [id]);
    res.json({ success: true, message: "User Suspended" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post("/admin/delete-master-user", async (req, res) => {
  try {
    const { id } = req.body;
    await db.query("DELETE FROM admin_users WHERE id=?", [id]);
    res.json({ success: true, message: "Credential Entry Removed" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get("/admin/user-history", async (req, res) => {
  try {
    const [history] = await db.query("SELECT * FROM saas_user_history ORDER BY timestamp DESC");
    res.json(history);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post("/signup", async (req, res) => {
    try {
        const { industry, businessName, ownerName, email, phone, username, password, plan } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const [result] = await db.query(
            "INSERT INTO saas_users (industry, business_name, owner_name, email, phone, username, password_hash, plain_password, plan_type) VALUES (?,?,?,?,?,?,?,?,?)",
            [industry, businessName, ownerName, email, phone, username, hashedPassword, password, plan || 'trial']
        );
        res.json({ success: true, userId: result.insertId });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

/**
 * 7️⃣ FRONTEND COMPATIBILITY ALIASES
 */
router.get("/stats", async (req, res) => {
    try {
        const [[totalResult]] = await db.query("SELECT COUNT(*) as total FROM saas_users");
        const [[activeResult]] = await db.query("SELECT COUNT(*) as active FROM saas_users WHERE status='active'");
        const [[revResult]] = await db.query("SELECT SUM(amount) as revenue FROM payments");
        res.json({
            users: totalResult.total,
            active: activeResult.active,
            revenue: revResult.revenue || 0
        });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get("/tenants", async (req, res) => {
    try {
        const [users] = await db.query(
            `SELECT business_name as name, industry, status, amount_paid as revenue 
            FROM saas_users 
            ORDER BY created_at DESC`
        );
        res.json(users);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
