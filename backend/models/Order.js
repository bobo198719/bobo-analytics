const mongoose = require("../mongo");

const OrderItemSchema = new mongoose.Schema({
    product_id: String,
    name: String,
    price: Number, // Base cash price applied
    price_card: Number, // Base card price applied
    quantity: { type: Number, default: 1 },
    seat_num: { type: Number, default: 1 }, // Used for splitting by seat
    modifiers: Array, // Customizations
    notes: String,
    status: { type: String, default: "pending_kitchen" } // pending_kitchen, cooking, ready, served
});

const SeatPaymentSchema = new mongoose.Schema({
    seat_num: Number,
    amount: Number,
    subtotal: Number,
    tax_amount: Number,
    fee_amount: Number,
    payment_method: String, // cash, card, upi
    payment_status: { type: String, default: "pending" }
});

const OrderSchema = new mongoose.Schema({
    order_id: { type: String, unique: true },
    customer_name: String,
    phone: String,
    table_num: String,
    
    // Line items with seat association
    items: [OrderItemSchema],
    
    // Splitting Logic
    split_type: { type: String, default: "none" }, // none, seat, fraction, custom
    split_payments: [SeatPaymentSchema], // Tracking payments per split
    
    // Totals
    amount: Number, // Cash total (Legacy fallback as well)
    amount_card: Number, // Card total
    subtotal: Number,
    tax_total: Number,
    fee_total: Number, // Surcharges etc.
    discount_total: Number,
    
    // Compatibility with old structure
    products: Array, // Retained temporarily for backward compatibility
    payment_method: String,
    payment_status: { type: String, default: "pending" }, // pending, partial, paid
    
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
