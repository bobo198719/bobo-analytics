/**
 * WhatsApp Alert Service
 */

function sendWhatsAppAlert(phone, businessName) {
  const formatted = phone.replace(/\D/g, "");
  const msg = encodeURIComponent(
    `🎉 New Signup!\n\nBusiness: ${businessName}\nWelcome to BoboAnalytics 🚀`
  );
  const url = `https://wa.me/91${formatted}?text=${msg}`;

  console.log("Send WhatsApp:", url);
  // Integration with actual WhatsApp API would go here, e.g., Twilio
}

module.exports = { sendWhatsAppAlert };
