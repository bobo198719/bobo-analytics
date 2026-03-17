const express = require("express");
const db = require("../db");
const router = express.Router();

// Create Table if not exists
const initDb = async () => {
    try {
        await db.query(`
            CREATE TABLE IF NOT EXISTS recipe_portfolio (
                id INT AUTO_INCREMENT PRIMARY KEY,
                recipe_name VARCHAR(255),
                ingredients JSON,
                production_cost INT,
                selling_price INT,
                profit INT,
                margin INT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log("✅ Recipe Portfolio Table Checked/Created");
    } catch (err) {
        console.error("❌ Recipe Table Init Error:", err);
    }
};
initDb();

router.post("/save", async (req, res) => {
    try {
        const {
            recipeName,
            ingredients,
            productionCost,
            sellingPrice,
            profit,
            margin
        } = req.body;

        if (!recipeName) {
            return res.status(400).json({ error: "Recipe name required" });
        }

        await db.query(
            `INSERT INTO recipe_portfolio 
            (recipe_name, ingredients, production_cost, selling_price, profit, margin) 
            VALUES (?, ?, ?, ?, ?, ?)`,
            [
                recipeName,
                JSON.stringify(ingredients),
                Number(productionCost),
                Number(sellingPrice),
                Number(profit),
                Number(margin)
            ]
        );

        res.json({ success: true });
    } catch (err) {
        console.error("Recipe Save Error:", err);
        res.status(500).json({ error: "DB ERROR" });
    }
});

router.get("/", async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM recipe_portfolio ORDER BY created_at DESC");
        // Parse ingredients JSON
        const parsedRows = rows.map(r => ({
            ...r,
            ingredients: typeof r.ingredients === 'string' ? JSON.parse(r.ingredients) : r.ingredients
        }));
        res.json(parsedRows);
    } catch (err) {
        console.error("Recipe Fetch Error:", err);
        res.json([]);
    }
});

module.exports = router;
