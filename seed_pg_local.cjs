const { Pool } = require('pg');

const pool = new Pool({
    host: 'srv1449576.hstgr.cloud',
    user: 'bobo',
    password: 'Princy@20201987',
    database: 'restaurant_crm',
    port: 5432,
    ssl: { rejectUnauthorized: false }
});

const categories = ['Starters', 'Mains', 'Desserts', 'Beverages', 'Chef Specials'];
const types = ['veg', 'non-veg'];
const adjectives = ['Truffle-Infused', 'Wood-Fired', 'Aged', 'Artisanal', 'Crispy', 'Braised'];
const proteins = ['Wagyu Beef', 'Salmon', 'Pork Belly', 'Chicken', 'Duck', 'Mushroom', 'Ribeye'];
const styles = ['Risotto', 'Medallion', 'Chop', 'Tail', 'Breast', 'Fillet', 'Skewer'];
const sides = ['with Asparagus', 'over Polenta', 'with Garlic Mash', 'in Red Wine Jus', 'with Heirloom Carrots'];
const desserts = ['Lava Cake', 'Tiramisu', 'Cheesecake', 'Panna Cotta', 'Creme Brulee'];
const bevs = ['Mojito', 'Martini', 'Margarita', 'Craft Beer', 'Aged Wine'];

function r(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

async function run() {
    try {
        await pool.query('SELECT 1'); // test connection
        console.log("Connected to DB successfully.");
        
        console.log("Seeding 500 menu items...");
        
        let query = 'INSERT INTO menu_items (name, category, type, price, gst_percent, image_url) VALUES ';
        let values = [];
        let params = [];
        
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
        
        await pool.query(query, params);
        console.log("Successfully inserted 500 items!");
    } catch(e) {
        console.error(e);
    } finally {
        pool.end();
    }
}
run();
