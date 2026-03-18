const db = require("../db");

function startExpiryCron() {
  console.log("🕒 Subscription Expiry Cron Job Started");
  
  // Run every 1 hour
  setInterval(async () => {
    try {
      console.log("🔍 Checking for expired subscriptions...");
      const [result] = await db.query(
        "UPDATE saas_users SET status='expired' WHERE expiry_date < CURDATE() AND status='active'"
      );
      if (result.affectedRows > 0) {
        console.log(`✅ Marked ${result.affectedRows} users as expired`);
      }
    } catch (err) {
      console.error("❌ Expiry Cron Error:", err);
    }
  }, 1000 * 60 * 60);
}

module.exports = { startExpiryCron };
