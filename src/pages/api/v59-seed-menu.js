import { Pool } from 'pg';

export async function GET({ request }) {
    const connectionString = "postgresql://bobo:Princy%4020201987@srv1449576.hstgr.cloud:5432/restaurant_crm?sslmode=no-verify";

    const pool = new Pool({
        connectionString,
        min: 0,
        max: 5,
        idleTimeoutMillis: 10000
    });

    const categories = ['Starters', 'Mains', 'Desserts', 'Beverages', 'Chef Specials'];
    const types = ['veg', 'non-veg'];
    const adjectives = ['Truffle-Infused', 'Wood-Fired', 'Aged', 'Artisanal', 'Crispy', 'Braised', 'Aromatic', 'Charred', 'Glazed', 'Herb-Crusted'];
    const proteins = ['Wagyu Beef', 'Salmon', 'Pork Belly', 'Chicken', 'Duck', 'Mushroom Risotto', 'Ribeye', 'Lobster', 'Prawns', 'Tofu'];
    const styles = ['Risotto', 'Medallion', 'Chop', 'Tail', 'Breast', 'Fillet', 'Skewer', 'Tartare'];
    const sides = ['with Asparagus', 'over Polenta', 'with Mash', 'in Red Wine Jus', 'with Carrots', 'and Caviar', 'in Citrus Reduction'];
    const desserts = ['Lava Cake', 'Tiramisu', 'Cheesecake', 'Panna Cotta', 'Souffle'];
    const bevs = ['Mojito', 'Martini', 'Margarita', 'Craft Beer', 'Aged Wine', 'Matcha'];

    function r(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

    try {
        await pool.query('CREATE TABLE IF NOT EXISTS menu_items (id SERIAL PRIMARY KEY, name VARCHAR(255), category VARCHAR(100), type VARCHAR(50), price DECIMAL(10,2), gst_percent DECIMAL(5,2), image_url TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)');

        let query = 'INSERT INTO menu_items (name, category, type, price, gst_percent, image_url) VALUES ';
        let params = [];
        let values = [];

        for (let i = 0; i < 500; i++) {
            let cat = r(categories);
            let name = '';
            let type = 'veg';
            
            if (cat === 'Desserts') name = `${r(adjectives)} ${r(desserts)}`;
            else if (cat === 'Beverages') name = `${r(adjectives)} ${r(bevs)}`;
            else { 
                name = `${r(adjectives)} ${r(proteins)} ${r(styles)} ${r(sides)}`;
                if(name.includes('Beef')||name.includes('Chicken')||name.includes('Pork')||name.includes('Duck')) type='non-veg';
            }
            name += ` (#${1000 + i})`;
            let price = Math.floor(Math.random() * 40) * 5 + 100;

            params.push(name, cat, type, price, 5, 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400');
            
            let offset = i * 6;
            values.push(`($${offset+1}, $${offset+2}, $${offset+3}, $${offset+4}, $${offset+5}, $${offset+6})`);
        }
        
        query += values.join(', ');
        
        const res = await pool.query(query, params);

        return new Response(JSON.stringify({ success: true, count: 500, message: "500 Premium Items Seeded successfully." }), { status: 200 });

    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    } finally {
        pool.end();
    }
}
