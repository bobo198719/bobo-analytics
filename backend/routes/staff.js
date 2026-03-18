const express = require("express");
const router = express.Router();
const db = require("../db");
const bcrypt = require("bcrypt");

/**
 * 2️⃣ STAFF MANAGEMENT (CREATE)
 */
router.post("/create", async (req, res) => {
  try {
    const { businessId, name, email, password, role } = req.body;
    
    // In a real app, businessId would come from req.user (middleware)
    // For this implementation, we assume it's passed or handled via authentication.
    
    const hash = await bcrypt.hash(password, 10);

    await db.query(
      `INSERT INTO staff_users 
      (business_id, name, email, password_hash, role)
      VALUES (?, ?, ?, ?, ?)`,
      [businessId, name, email, hash, role || "staff"]
    );

    res.json({ message: "Staff Added Successfully", success: true });
  } catch (err) {
    console.error("Staff Creation Error:", err);
    res.status(500).json({ message: "Failed to add staff", error: err.message });
  }
});

/**
 * 3️⃣ STAFF LOGIN
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const [users] = await db.query(
      "SELECT * FROM staff_users WHERE email=?",
      [email]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: "Staff user not found" });
    }

    const user = users[0];
    const valid = await bcrypt.compare(password, user.password_hash);

    if (!valid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Omit password hash from response
    delete user.password_hash;
    res.json({ message: "Login Successful", success: true, user });
  } catch (err) {
    res.status(500).json({ message: "Login failed", error: err.message });
  }
});

module.exports = router;
