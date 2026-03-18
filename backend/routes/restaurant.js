const express = require("express");
const router = express.Router();
const db = require("../db");
const bcrypt = require("bcrypt");

/**
 * 🍽️ RESTAURANT CONFIGURATION
 */
router.post("/restaurant/setup", async (req, res) => {
  try {
    const { userId, name, gst, address, phone } = req.body;
    const [result] = await db.query(
      "INSERT INTO restaurants (owner_id, name, gst_number, address, phone) VALUES (?, ?, ?, ?, ?)",
      [userId, name, gst, address, phone]
    );
    res.json({ success: true, restaurantId: result.insertId });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get("/restaurant/:userId", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM restaurants WHERE owner_id = ?", [req.params.userId]);
    res.json(rows[0] || null);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

/**
 * 🪑 TABLE MANAGEMENT
 */
router.post("/restaurant/tables", async (req, res) => {
  try {
    const { restaurantId, tableNumber, capacity } = req.body;
    await db.query(
      "INSERT INTO rest_tables (restaurant_id, table_number, capacity, status) VALUES (?, ?, ?, 'available')",
      [restaurantId, tableNumber, capacity]
    );
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get("/restaurant/:id/tables", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM rest_tables WHERE restaurant_id = ? ORDER BY table_number", [req.params.id]);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

/**
 * 📜 MENU MANAGEMENT
 */
router.post("/restaurant/menu/category", async (req, res) => {
  try {
    const { restaurantId, name } = req.body;
    await db.query("INSERT INTO rest_categories (restaurant_id, name) VALUES (?, ?)", [restaurantId, name]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get("/restaurant/:id/menu", async (req, res) => {
  try {
    const [items] = await db.query(`
      SELECT m.*, c.name as category_name 
      FROM rest_menu_items m 
      JOIN rest_categories c ON m.category_id = c.id 
      WHERE m.restaurant_id = ?`, [req.params.id]);
    res.json(items);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

/**
 * 📝 ORDER ENGINE (QR & POS)
 */
router.post("/restaurant/order", async (req, res) => {
  try {
    const { restaurantId, tableId, type, items, total, gst, customerId } = req.body;
    
    // 1. Create Order
    const [order] = await db.query(
      `INSERT INTO rest_orders 
      (restaurant_id, table_id, customer_id, type, status, total_amount, gst_amount) 
      VALUES (?, ?, ?, ?, 'pending', ?, ?)`,
      [restaurantId, tableId, customerId || null, type, total, gst]
    );

    const orderId = order.insertId;

    // 2. Add Items
    for (const item of items) {
      await db.query(
        "INSERT INTO rest_order_items (order_id, item_id, quantity, price) VALUES (?, ?, ?, ?)",
        [orderId, item.id, item.quantity, item.price]
      );
    }

    // 3. Update Table Status if Dine-in
    if (type === 'dine-in' && tableId) {
      await db.query("UPDATE rest_tables SET status='ordered' WHERE id=?", [tableId]);
    }

    // Broadcast via Global WebSocket (if implemented)
    if (global.broadcastNewOrder) {
       global.broadcastNewOrder({ orderId, restaurantId, type });
    }

    res.json({ success: true, orderId });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

/**
 * 🧑‍🍳 KITCHEN DISPLAY SYSTEM (KDS)
 */
router.get("/restaurant/:id/active-orders", async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT o.*, t.table_number 
       FROM rest_orders o 
       LEFT JOIN rest_tables t ON o.table_id = t.id 
       WHERE o.restaurant_id = ? AND o.status IN ('pending', 'preparing', 'ready')
       ORDER BY o.created_at ASC`, [req.params.id]
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post("/restaurant/order/update-status", async (req, res) => {
  try {
    const { orderId, status } = req.body;
    await db.query("UPDATE rest_orders SET status=? WHERE id=?", [status, orderId]);
    
    // If completed, free the table
    if (status === 'completed') {
      const [order] = await db.query("SELECT table_id FROM rest_orders WHERE id=?", [orderId]);
      if (order[0].table_id) {
        await db.query("UPDATE rest_tables SET status='available' WHERE id=?", [order[0].table_id]);
      }
    }
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
