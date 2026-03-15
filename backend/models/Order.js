const mongoose = require("../mongo");

const OrderSchema = new mongoose.Schema({
    order_id: { type: String, unique: true },
    customer_name: String,
    phone: String,
    products: Array,
    amount: Number,
    payment_method: String,
    payment_status: { type: String, default: "pending" },
    status: {
        type: String,
        default: "pending"
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Order", OrderSchema);
