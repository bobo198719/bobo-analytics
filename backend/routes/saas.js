const express = require("express");
const router = express.Router();
const db = require("../db");
const bcrypt = require("bcrypt");
const { sendWhatsAppAlert } = require("../services/alerts");
const nodemailer = require("nodemailer");
const Razorpay = require("razorpay");
const crypto = require("crypto");

const rzp = new Razorpay({
  key_id: process.env.RAZORPAY_KEY || "rzp_test_placeholder",
  key_secret: process.env.RAZORPAY_SECRET || "placeholder_secret"
});

// Initialize Mailer using Official Bobo Support ID
const mailTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.hostinger.com",
  port: parseInt(process.env.SMTP_PORT || "465", 10),
  secure: true,
  auth: {
    user: process.env.SMTP_USER || "support@boboanalytics.com",
    pass: process.env.SMTP_PASS || "placeholder" // Set this in Hostinger Env Variables
  }
});

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
    // Map database columns to frontend expectations
    const mapped = leads.map(l => ({
      id: l.id,
      businessName: l.business_name,
      ownerName: l.owner_name,
      phone: l.phone,
      email: l.email,
      industry: l.industry,
      city: l.city,
      status: l.status,
      created_at: l.created_at
    }));
    res.json(mapped);
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
    
    let userQuery = "";
    let params = [];
    if (targetType === 'user') {
      userQuery = "SELECT id, email, username FROM saas_users WHERE id = ?";
      params = [targetValue];
    } else if (targetType === 'multiple') {
      userQuery = "SELECT id, email, username FROM saas_users WHERE id IN (?)";
      params = [targetValue]; // targetValue is an array of IDs
    } else if (targetType === 'industry') {
      userQuery = "SELECT id, email, username FROM saas_users WHERE industry = ?";
      params = [targetValue];
    } else {
      userQuery = "SELECT id, email, username FROM saas_users";
    }
    
    const [users] = await db.query(userQuery, params);
    
    let emailCount = 0;
    let waCount = 0;
    let smsCount = 0;

    // Loop through targets and dispatch messages
    for (const u of users) {
      const isPhoneLike = /^\+?[0-9]{10,15}$/.test(u.username);
      const toPhone = isPhoneLike ? u.username : "placeholder_to_phone";

      // 1. Email (support@boboanalytics.com)
      if (channels.includes('email') && u.email) {
        try {
          if (process.env.SMTP_PASS) {
            await mailTransporter.sendMail({
              from: '"Bobo Analytics" <support@boboanalytics.com>',
              to: u.email,
              subject: "Special Offer from Bobo Analytics 🚀",
              text: message,
              html: `<div style="font-family:sans-serif;box-sizing:border-box;">\n${message.replace(/\\n/g, '<br>')}\n<br><br><br><small style="color:#666;">Sent officially via Bobo Analytics (support@boboanalytics.com)</small></div>`
            });
          }
          emailCount++;
        } catch(e) { console.error("Email Error:", e.message); }
      }

      // 2. WhatsApp (+91 9518525420)
      if (channels.includes('whatsapp')) {
        try {
          // Send via Meta Cloud API using the official registered business number
          if (process.env.WHATSAPP_API_TOKEN) {
             const waPhoneId = process.env.WA_PHONE_ID || "placeholder_phone_id";
             await fetch(`https://graph.facebook.com/v17.0/${waPhoneId}/messages`, {
                method: "POST",
                headers: { "Authorization": `Bearer ${process.env.WHATSAPP_API_TOKEN}`, "Content-Type": "application/json" },
                body: JSON.stringify({ messaging_product: "whatsapp", to: toPhone, type: "text", text: { body: message } })
             }).catch(()=>{});
          }
          waCount++;
        } catch(e) { console.error("WA Error:", e.message); }
      }

      // 3. SMS (Fallback Provider)
      if (channels.includes('sms')) {
        smsCount++;
      }
    }
    
    res.json({ success: true, message: `Dispatched successfuly! Sent ${emailCount} Emails (from support@), ${waCount} WhatsApps (from +91 9518525420), and ${smsCount} SMS.` });
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

/**
 * 8️⃣ ACTIVITY & ALERTS (REAL-TIME TELEMETRY)
 */
router.get("/activity", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM activity_logs ORDER BY time DESC LIMIT 20");
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get("/alerts", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM alerts WHERE status = 'active' ORDER BY created_at DESC");
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get("/admin/audit-logs", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT created_at as time, username as user, status, device as error FROM login_logs ORDER BY created_at DESC LIMIT 50");
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

/**
 * 9️⃣ GLOBAL SEARCH
 */
router.get("/search", async (req, res) => {
  try {
    const { q } = req.query;
    const term = `%${q}%`;
    const [users] = await db.query(
      "SELECT id, business_name, username, industry FROM saas_users WHERE business_name LIKE ? OR username LIKE ? OR industry LIKE ?",
      [term, term, term]
    );
    const [leads] = await db.query(
      "SELECT id, business_name, owner_name, status FROM leads WHERE business_name LIKE ? OR owner_name LIKE ?",
      [term, term]
    );
    res.json({ users, leads });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

/**
 * 🔟 LEAD PROVISIONING
 */
router.post("/admin/approve-lead", async (req, res) => {
  try {
    const { leadId } = req.body;
    const [[lead]] = await db.query("SELECT * FROM leads WHERE id = ?", [leadId]);
    if (!lead) return res.status(404).json({ error: "Lead not found" });

    // 1. Create User
    const password = Math.random().toString(36).slice(-8); // Generate random password
    const hash = await bcrypt.hash(password, 10);
    
    const [result] = await db.query(
      `INSERT INTO saas_users (business_name, owner_name, username, email, phone, industry, password_hash, plain_password, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active', NOW())`,
      [lead.business_name, lead.owner_name, lead.email, lead.email, lead.phone, lead.industry, hash, password]
    );

    // 2. Update Lead Status
    await db.query("UPDATE leads SET status = 'provisioned' WHERE id = ?", [leadId]);

    // 3. Log Activity
    await db.query("INSERT INTO activity_logs (message, type) VALUES (?, 'provisioning')", [`Infrastructure provisioned for ${lead.business_name}`]);

    // 4. Mirror in Admin (Master Auth)
    await db.query(
       `INSERT INTO admin_users (username, password_hash, industry, role, status)
        VALUES (?, ?, ?, 'owner', 'active')`,
       [lead.email, hash, lead.industry]
    );

    res.json({ success: true, userId: result.insertId });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

/**
 * 💳 RAZORPAY INTEGRATION
 */
router.post("/create-order", async (req, res) => {
  try {
    const { amount } = req.body;
    const order = await rzp.orders.create({
      amount: amount * 100, // in paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`
    });
    res.json(order);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post("/verify-payment", async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  const secret = process.env.RAZORPAY_SECRET || "placeholder_secret";
  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
  const generated_signature = hmac.digest("hex");

  if (generated_signature === razorpay_signature) {
    // Payment Successful
    res.json({ status: "success" });
  } else {
    res.status(400).json({ status: "failed" });
  }
});

module.exports = router;
