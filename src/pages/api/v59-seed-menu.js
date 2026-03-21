import mysql from 'mysql2/promise';

export async function GET({ request }) {
    const conn = await mysql.createConnection({
        host: 'srv1449576.hstgr.cloud',
        user: 'bobo_admin',
        password: 'Princy@202020',
        database: 'bobo_analytics',
        port: 3306,
        connectTimeout: 20000
    });

    const categories = ['Starters', 'Mains', 'Desserts', 'Beverages', 'Chef Specials'];
    const adjectives = ['Truffle-Infused', 'Wood-Fired', 'Aged', 'Artisanal', 'Crispy', 'Braised', 'Aromatic', 'Charred', 'Glazed', 'Herb-Crusted'];
    const proteins = ['Wagyu Beef', 'Salmon', 'Pork Belly', 'Chicken', 'Duck', 'Mushroom Risotto', 'Ribeye', 'Lobster', 'Prawns', 'Tofu'];
    const styles = ['Risotto', 'Medallion', 'Chop', 'Tail', 'Breast', 'Fillet', 'Skewer', 'Tartare'];
    const sides = ['with Asparagus', 'over Polenta', 'with Mash', 'in Red Wine Jus', 'with Carrots', 'and Caviar', 'in Citrus Reduction'];
    const desserts = ['Lava Cake', 'Tiramisu', 'Cheesecake', 'Panna Cotta', 'Souffle'];
    const bevs = ['Mojito', 'Martini', 'Margarita', 'Craft Beer', 'Aged Wine', 'Matcha'];

    function r(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

    try {
        // Create table if it doesn't exist (MySQL syntax)
        await conn.execute(`
            CREATE TABLE IF NOT EXISTS menu_items (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                category VARCHAR(100),
                type VARCHAR(50) DEFAULT 'veg',
                price DECIMAL(10,2),
                gst_percent DECIMAL(5,2) DEFAULT 5,
                image_url TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Build bulk insert rows
        const rows = [];
        for (let i = 0; i < 500; i++) {
            let cat = r(categories);
            let name = '';
            let type = 'veg';

            if (cat === 'Desserts') name = `${r(adjectives)} ${r(desserts)}`;
            else if (cat === 'Beverages') name = `${r(adjectives)} ${r(bevs)}`;
            else {
                name = `${r(adjectives)} ${r(proteins)} ${r(styles)} ${r(sides)}`;
                if (name.includes('Beef') || name.includes('Chicken') || name.includes('Pork') || name.includes('Duck')) type = 'non-veg';
            }
            name += ` (#${1000 + i})`;
            const price = Math.floor(Math.random() * 40) * 5 + 100;

            rows.push([name, cat, type, price, 5, 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400']);
        }

        // MySQL bulk insert with ? placeholders
        await conn.query(
            'INSERT INTO menu_items (name, category, type, price, gst_percent, image_url) VALUES ?',
            [rows]
        );

        return new Response(JSON.stringify({ success: true, count: 500, message: "500 Premium Menu Items Seeded Successfully! 🎉" }), { status: 200 });

    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    } finally {
        await conn.end();
    }
}
