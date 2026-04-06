const mongoose = require("../mongo");

const ProductSchema = new mongoose.Schema({
    id: { type: String, unique: true },
    name: String,
    description: String,
    desc: String, // Supporting both templates
    price: Number, // Cash/Base price
    price_card: Number, // Dual pricing: Card price
    currency: { type: String, default: "USD" },
    category: String,
    cat: String, // Supporting both templates
    image_path: String,
    image_url: String, // Supporting both templates
    thumbnail_url: String,
    medium_url: String,
    high_res_url: String,
    status: { type: String, default: "approved" },
    prep: String,
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Product", ProductSchema);
