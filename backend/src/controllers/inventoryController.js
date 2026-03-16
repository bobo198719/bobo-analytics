const db = require("../../db");

exports.getInventory = async (req, res) => {
  const { pharmacyId } = req.params;

  try {
    const [rows] = await db.query(
      "SELECT * FROM inventory WHERE pharmacyId = ?",
      [pharmacyId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addMedicine = async (req, res) => {
  const { pharmacyId, medicine, stock, expiry } = req.body;

  try {
    const [result] = await db.query(
      "INSERT INTO inventory (pharmacyId, product_name, stock_qty, expiry_date) VALUES (?, ?, ?, ?)",
      [pharmacyId, medicine, stock, expiry]
    );

    res.json({
      message: "Medicine added",
      item: {
        id: result.insertId,
        pharmacyId,
        medicine,
        stock,
        expiry
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
