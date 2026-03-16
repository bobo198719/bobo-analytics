const db = require("../../db");

exports.loginUser = async (req, res) => {
  const { pharmacyId, password } = req.body;

  try {
    const [rows] = await db.query(
      "SELECT * FROM pharmacies WHERE pharmacyId = ? AND password = ?",
      [pharmacyId, password]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: "Invalid login" });
    }

    res.json({
      message: "Login successful",
      pharmacy: rows[0].pharmacy
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createPharmacy = async (req, res) => {
  const { pharmacy, pharmacyId, password } = req.body;

  try {
    const [result] = await db.query(
      "INSERT INTO pharmacies (pharmacy, pharmacyId, password, plan, status) VALUES (?, ?, ?, ?, ?)",
      [pharmacy, pharmacyId, password, "999", "active"]
    );

    res.json({
      message: "Pharmacy created",
      pharmacy: {
        id: result.insertId,
        pharmacy,
        pharmacyId,
        password,
        plan: "999",
        status: "active"
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

