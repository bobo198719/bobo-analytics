import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';

const DB_FILE = path.join(process.cwd(), '.bobo_staff_fallback.json');

const getConn = async () => mysql.createConnection({
    host: 'srv1449576.hstgr.cloud',
    user: 'bobo_admin',
    password: 'BoboPass2026!',
    database: 'bobo_analytics',
    connectTimeout: 25000
});

export async function GET() {
    try {
        const db = await getConn();
        await db.query(`
            CREATE TABLE IF NOT EXISTS restaurant_staff (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                password VARCHAR(100) NOT NULL,
                role ENUM('manager', 'chef', 'waiter') NOT NULL,
                permission ENUM('entire', 'limited') DEFAULT 'limited',
                modules TEXT,
                status VARCHAR(20) DEFAULT 'active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        // Safely add column if the table already existed without it
        try { await db.query("ALTER TABLE restaurant_staff ADD COLUMN modules TEXT"); } catch(e){}

        const [staff] = await db.query("SELECT * FROM restaurant_staff ORDER BY created_at DESC");
        await db.end();
        
        const parsedStaff = staff.map(s => {
            let mods = [];
            if (s.modules) {
               try { mods = typeof s.modules === 'string' ? JSON.parse(s.modules) : s.modules; } catch(e) {}
            }
            return { ...s, modules: mods };
        });
        
        // Sync local cache
        fs.writeFileSync(DB_FILE, JSON.stringify(parsedStaff));
        
        return new Response(JSON.stringify(parsedStaff), { status: 200 });
    } catch (err) {
        console.warn('MySQL Staff Offline - Using local JSON fallback');
        let fallback = [];
        try { if(fs.existsSync(DB_FILE)) fallback = JSON.parse(fs.readFileSync(DB_FILE, 'utf8')); } catch(e) {}
        return new Response(JSON.stringify(fallback), { status: 200 });
    }
}

export async function POST({ request }) {
    try {
        const payload = await request.json();
        const { username, password, role, permission, modules } = payload;
        const modulesStr = JSON.stringify(modules || []);
        
        try {
            const db = await getConn();
            try { await db.query("ALTER TABLE restaurant_staff ADD COLUMN modules TEXT"); } catch(e){}
            
            await db.query(
                "INSERT INTO restaurant_staff (username, password, role, permission, modules) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE password = ?, role = ?, permission = ?, modules = ?",
                [username, password, role, permission || 'limited', modulesStr, password, role, permission || 'limited', modulesStr]
            );
            await db.end();
        } catch (dbErr) {
            console.warn('MySQL Staff Upload Offline - Writing to local cache');
            let fallback = [];
            try { if(fs.existsSync(DB_FILE)) fallback = JSON.parse(fs.readFileSync(DB_FILE, 'utf8')); } catch(e) {}
            
            payload.modules = modules || [];
            const idx = fallback.findIndex(s => s.username === username);
            if(idx > -1) fallback[idx] = payload; else fallback.push(payload);
            
            fs.writeFileSync(DB_FILE, JSON.stringify(fallback));
        }

        return new Response(JSON.stringify({ success: true }), { status: 200 });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}
