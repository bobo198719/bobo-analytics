// ===============================
// BOBO ANALYTICS API SERVER
// Production Ready Server
// ===============================

const app = require("./app");

// -------------------------------
// PORT CONFIG
// -------------------------------
const PORT = process.env.PORT || 5000;

// ⭐ IMPORTANT FIX — LISTEN ON ALL NETWORKS
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

