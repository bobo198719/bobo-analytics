const mongoose = require("../mongo");

const DiscountSchema = new mongoose.Schema({
    code: String, // e.g. "HAPPYHOUR", "STAFF20"
    description: String,
    type: { type: String, default: "percentage" }, // percentage, flat, bogo
    value: Number,
    applies_to: { type: String, default: "order" }, // order, category, product
    target_ids: Array, // Product IDs or Category names if applies_to is not "order"
    min_order_value: Number,
    is_active: { type: Boolean, default: true },
    valid_from: Date,
    valid_until: Date,
    created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Discount", DiscountSchema);
