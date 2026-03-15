import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
    id: { type: String, unique: true },
    name: String,
    description: String,
    desc: String,
    price: Number,
    category: String,
    cat: String,
    image_url: String,
    image_path: String,
    thumbnail_url: String,
    medium_url: String,
    high_res_url: String,
    status: { type: String, default: "approved" },
    prep: { type: String, default: "4h" },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

// Avoid re-compilation error in Astro dev mode
const Product = mongoose.models.Product || mongoose.model("Product", ProductSchema);
export default Product;
