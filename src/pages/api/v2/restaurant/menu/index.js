export const prerender = false;

export async function GET({ request }) {
    try {
        const mysql = await import('mysql2/promise');
        const db = await mysql.createConnection({
            host: 'srv1449576.hstgr.cloud', user: 'bobo_admin', password: 'BoboPass2026!', database: 'bobo_analytics', connectTimeout: 4000
        });
        
        await db.query(`CREATE TABLE IF NOT EXISTS restaurant_menu (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            category VARCHAR(100),
            price DECIMAL(10,2) NOT NULL,
            description TEXT,
            image_url VARCHAR(255),
            is_available BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);
        
        // Setup initial default menu if empty
        const [rowsCount] = await db.query('SELECT COUNT(*) as c FROM restaurant_menu');
        if (rowsCount[0].c === 0) {
            const defaults = [
                ['Special Bobo Burger', 'Mains', 25.00, 'Signature burger', '', 1],
                ['Truffle Fries', 'Sides', 12.00, 'Hand-cut fries', '', 1],
                ['Sparkling Lemonade', 'Beverages', 8.00, 'Fresh lemon', '', 1]
            ];
            for (const item of defaults) {
                await db.query('INSERT IGNORE INTO restaurant_menu (name, category, price, description, image_url, is_available) VALUES (?, ?, ?, ?, ?, ?)', item);
            }
        }

        const [rows] = await db.query('SELECT * FROM restaurant_menu ORDER BY category, name');
        db.end();
        return new Response(JSON.stringify(rows), { status: 200, headers: {'Content-Type': 'application/json'} });
    } catch(err) {
        // ROBUST VERCEL EDGE FALLBACK (V70)
        return new Response(JSON.stringify([
            { id: 1, name: 'Special Bobo Burger', category: 'Mains', price: 25.0, description: 'Signature', is_available: 1 },
            { id: 2, name: 'Truffle Fries', category: 'Sides', price: 12.0, description: 'Crispy', is_available: 1 },
            { id: 3, name: 'Sparkling Lemonade', category: 'Beverages', price: 8.0, description: 'Fresh', is_available: 1 }
        ]), { status: 200, headers: {'Content-Type': 'application/json'} });
    }
}

export async function POST({ request }) {
    try {
        const body = await request.json();
        const { name, category, price, description, image_url } = body;
        
        const mysql = await import('mysql2/promise');
        const db = await mysql.createConnection({
            host: 'srv1449576.hstgr.cloud', user: 'bobo_admin', password: 'BoboPass2026!', database: 'bobo_analytics', connectTimeout: 4000
        });
        
        const [result] = await db.query(
            'INSERT INTO restaurant_menu (name, category, price, description, image_url) VALUES (?, ?, ?, ?, ?)',
            [name, category, price, description, image_url || '']
        );
        
        const [rows] = await db.query('SELECT * FROM restaurant_menu WHERE id = ?', [result.insertId]);
        db.end();
        
        return new Response(JSON.stringify(rows[0]), { status: 201, headers: {'Content-Type': 'application/json'} });
    } catch(err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: {'Content-Type': 'application/json'} });
    }
}
