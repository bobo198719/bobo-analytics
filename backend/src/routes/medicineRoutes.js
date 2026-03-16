const express = require("express");
const db = require("../../db");

const router = express.Router();

router.get("/medicine/:barcode", async (req, res) => {
  const barcode = req.params.barcode;

  try {
    const [rows] = await db.query(
      "SELECT * FROM medicine_master WHERE barcode = ?",
      [barcode]
    );

    if (rows.length === 0) {
      return res.json({
        status: "not_found"
      });
    }

    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;