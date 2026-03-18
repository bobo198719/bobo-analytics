const express = require("express");
const router = express.Router();

/**
 * 5️⃣ SEND WHATSAPP FUNCTION
 */
function sendWhatsApp(phone, message) {
  const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  console.log("🚀 Webhook Response [WhatsApp]:", url);
  // Real implementation: API call to a WhatsApp provider (e.g., Twilio)
}

/**
 * 4️⃣ WHATSAPP AUTO BOT (WEBHOOK)
 */
router.post("/webhook", async (req, res) => {
  try {
    const { message, phone } = req.body;
    if (!message || !phone) return res.status(400).send("Message and Phone are required");

    let reply = "";
    const msgLower = message.toLowerCase();

    if (msgLower.includes("menu")) {
      reply = "🍽️ View Menu: https://boboanalytics.com/shop";
    } else if (msgLower.includes("order")) {
      reply = "🛒 Place your order here: https://boboanalytics.com/shop";
    } else if (msgLower.includes("payment") || msgLower.includes("upgrade")) {
      reply = "💳 Pay/Upgrade here: https://boboanalytics.com/upgrade";
    } else {
      reply = "👋 Hi there! Type 'menu' for our latest offerings or 'order' to buy now! 🚀";
    }

    sendWhatsApp(phone, reply);
    res.json({ message: "Webhook processed", reply });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * 8️⃣ PAYMENT LINK BOT
 */
router.post("/send-payment-link", (req, res) => {
  const { phone } = req.body;
  const message = "🎯 Upgrade your BoboAnalytics plan for PRO features:\nhttps://boboanalytics.com/upgrade 🚀";
  sendWhatsApp(phone, message);
  res.json({ success: true, message: "Payment link sent" });
});

module.exports = router;
