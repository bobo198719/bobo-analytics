const express = require("express");
const Product = require("../models/Product");
const router = express.Router();

// GET all products
router.get("/", async (req, res) => {
    try {
        const products = await Product.find().sort({ created_at: -1 });
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST to create or update product (Upsert)
router.post("/", async (req, res) => {
    try {
        const body = req.body;
        const productId = body.id || `P-${Math.floor(100000 + Math.random() * 900000)}`;
        
        const updateData = {
            ...body,
            id: productId,
            updated_at: Date.now()
        };

        const product = await Product.findOneAndUpdate(
            { id: productId },
            { $set: updateData },
            { upsert: true, new: true }
        );

        res.status(200).json({ success: true, product });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE product
router.delete("/:id", async (req, res) => {
    try {
        const result = await Product.deleteOne({ id: req.params.id });
        if (result.deletedCount === 0) {
            return res.status(404).json({ error: "Product not found" });
        }
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
