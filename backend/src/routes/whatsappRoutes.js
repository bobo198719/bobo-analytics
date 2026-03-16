const express = require("express");
const db = require("../../db");

const router = express.Router();

router.post("/send-bill", async (req, res) => {
  const { pharmacyId, customerPhone, items, total } = req.body;

  try {
    const [rows] = await db.query(
      "SELECT * FROM pharmacies WHERE pharmacyId = ?",
      [pharmacyId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        error: "Pharmacy not found"
      });
    }

    const pharmacy = rows[0];

    let billText = `${pharmacy.pharmacy}
Phone: ${pharmacy.phone}

Invoice

`;

    items.forEach(item => {
      billText += `${item.name} x${item.qty} ₹${item.price}\n`;
    });

    billText += `
Total: ₹${total}

Thank you for visiting ${pharmacy.pharmacy}
Powered by Bobo Analytics`;

    console.log("Sending WhatsApp bill to:", customerPhone);
    console.log(billText);

    res.json({
      status: "Bill sent",
      message: billText
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
