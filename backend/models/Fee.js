const mongoose = require("../mongo");

const FeeSchema = new mongoose.Schema({
    name: String, // e.g. "ISO Processing Fee", "Late Night Surcharge"
    type: { type: String, default: "percentage" }, // percentage, flat
    value: Number, 
    applies_to: { type: String, default: "order" }, // order, product, payment_method
    target_payment_method: String, // e.g., 'card' for ISO processing fees
    is_active: { type: Boolean, default: true },
    created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Fee", FeeSchema);
