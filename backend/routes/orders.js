const express = require("express");
const Order = require("../models/Order");
const router = express.Router();

// GET all orders
router.get("/", async (req, res) => {
    try {
        const orders = await Order.find().sort({ created_at: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST new order
router.post("/", async (req, res) => {
    try {
        const orderId = `BOBO-ORD-${Math.floor(100000 + Math.random() * 900000)}`;
        const newOrder = new Order({
            ...req.body,
            order_id: orderId
        });
        await newOrder.save();
        res.status(201).json({ success: true, order: newOrder });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// UPDATE order status
router.patch("/:id", async (req, res) => {
    try {
        const order = await Order.findOneAndUpdate(
            { order_id: req.params.id },
            { $set: req.body },
            { new: true }
        );
        res.json({ success: true, order });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
