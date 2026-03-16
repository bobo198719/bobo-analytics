const db = require("../../db");

exports.expiryPrediction = async (req, res) => {
  try {
    const [inventory] = await db.query("SELECT * FROM inventory");
    const today = new Date();
    const alerts = [];

    inventory.forEach(item => {
      const expiryDate = new Date(item.expiry_date);
      const diffDays = (expiryDate - today) / (1000 * 60 * 60 * 24);

      if (diffDays < 30) {
        alerts.push({
          medicine: item.product_name,
          expiry: item.expiry_date,
          stock: item.stock_qty,
          message: "Expiring soon"
        });
      }

      if (item.stock_qty < 20) {
        alerts.push({
          medicine: item.product_name,
          stock: item.stock_qty,
          message: "Low stock reorder needed"
        });
      }
    });

    res.json(alerts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

