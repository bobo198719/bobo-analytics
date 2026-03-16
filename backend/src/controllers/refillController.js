const db = require("../../db");

exports.checkRefillAlerts = async (req, res) => {
  try {
    const [customers] = await db.query("SELECT * FROM customers");
    
    const alerts = customers.map(c => ({
      name: c.customer_name,
      phone: c.phone,
      medicine: "Metformin", // Placeholder logic
      message: "Your refill is due"
    }));

    res.json(alerts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};