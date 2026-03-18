const express = require("express");
const router = express.Router();
const db = require("../db");

/**
 * 3️⃣ FETCH LOGIN HISTORY
 */
router.get("/login-logs", async (req, res) => {
  try {
    const [logs] = await db.query(
      "SELECT * FROM login_logs ORDER BY created_at DESC LIMIT 100"
    );
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * 6️⃣ DETECT SUSPICIOUS ACTIVITY (ALERTS)
 */
router.get("/security-alerts", async (req, res) => {
  try {
    const [alerts] = await db.query(
      `SELECT username, COUNT(*) as attempts 
       FROM login_logs 
       WHERE status = 'failed' 
       AND created_at > NOW() - INTERVAL 1 HOUR
       GROUP BY username
       HAVING attempts > 5`
    );
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * 7️⃣ AUTO BLOCK USER
 */
router.post("/block-user", async (req, res) => {
  try {
    const { username } = req.body;
    await db.query(
      "UPDATE saas_users SET status = 'blocked' WHERE username = ?",
      [username]
    );
    res.json({ success: true, message: `User ${username} has been blocked.` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * 8️⃣ SESSION CONTROL (PLACEHOLDER)
 */
router.post("/logout-all", (req, res) => {
  const { username } = req.body;
  // logic to invalidate JWTs or wipe sessions table
  res.json({ message: "All sessions terminated for user: " + username });
});

module.exports = router;
