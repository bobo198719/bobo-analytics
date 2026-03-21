// seed_now.js — Run on VPS: node seed_now.js
const mysql = require('mysql2/promise');

(async () => {
    let conn;
    try {
        // Use Unix socket — same auth method as `mysql -u root` from shell
        conn = await mysql.createConnection({
            socketPath: '/run/mysqld/mysqld.sock',
            user: 'root',
            password: '',
            database: 'bobo_analytics'
        });
        console.log('✅ Connected to MySQL!');

        // Create table if missing
        await conn.execute(`
            CREATE TABLE IF NOT EXISTS menu_items (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255),
                category VARCHAR(100),
                type VARCHAR(50) DEFAULT 'veg',
                price DECIMAL(10,2),
                gst_percent DECIMAL(5,2) DEFAULT 5,
                image_url TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        const adj = ['Truffle-Infused','Wood-Fired','Aged','Artisanal','Crispy','Braised','Aromatic','Charred','Glazed','Herb-Crusted'];
        const pro = ['Wagyu Beef','Salmon','Pork Belly','Chicken','Duck','Ribeye','Lobster','Prawns','Tofu','Mushroom Risotto'];
        const sty = ['Risotto','Medallion','Chop','Breast','Fillet','Skewer','Tartare','Tail'];
        const sid = ['with Asparagus','over Polenta','with Mash','in Red Wine Jus','with Carrots','and Caviar','in Citrus Reduction'];
        const des = ['Lava Cake','Tiramisu','Cheesecake','Panna Cotta','Souffle','Brownie','Creme Brulee'];
        const bev = ['Mojito','Martini','Margarita','Craft Beer','Aged Wine','Matcha Latte','Cold Brew'];
        const cats = ['Starters','Mains','Desserts','Beverages','Chef Specials'];
        const r = a => a[Math.floor(Math.random() * a.length)];

        const rows = [];
        for (let i = 0; i < 500; i++) {
            let cat = r(cats), name = '', type = 'veg';
            if (cat === 'Desserts') name = `${r(adj)} ${r(des)}`;
            else if (cat === 'Beverages') name = `${r(adj)} ${r(bev)}`;
            else {
                name = `${r(adj)} ${r(pro)} ${r(sty)} ${r(sid)}`;
                if (/Beef|Chicken|Pork|Duck/.test(name)) type = 'non-veg';
            }
            rows.push([
                `${name} (#${1000 + i})`,
                cat, type,
                Math.floor(Math.random() * 40) * 5 + 100,
                5,
                'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400'
            ]);
        }

        await conn.query('INSERT INTO menu_items (name,category,type,price,gst_percent,image_url) VALUES ?', [rows]);
        console.log('🎉 SUCCESS: 500 Premium Menu Items inserted into MySQL!');

    } catch (e) {
        console.error('❌ ERROR:', e.message);
        process.exit(1);
    } finally {
        if (conn) await conn.end();
        process.exit(0);
    }
})();
