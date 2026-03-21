import pg from '../../pg_db';

export async function GET() {
    try {
        console.log("BOBO SEED: Commencing floor initialization...");
        
        // 1. Ensure Table Table exists
        await pg.query(`
            CREATE TABLE IF NOT EXISTS tables (
                id SERIAL PRIMARY KEY,
                table_number VARCHAR(50) UNIQUE NOT NULL,
                status VARCHAR(20) DEFAULT 'available'
            )
        `);

        // 2. Insert 5 Default Tables if empty
        const { rows: count } = await pg.query('SELECT COUNT(*) FROM tables');
        if (parseInt(count[0].count) === 0) {
            await pg.query(`
                INSERT INTO tables (table_number, status) VALUES 
                ('01', 'available'),
                ('02', 'available'),
                ('03', 'available'),
                ('04', 'available'),
                ('05', 'available')
            `);
            return new Response(JSON.stringify({ success: true, message: "5 Nodes Provisioned" }), { status: 200 });
        }

        return new Response(JSON.stringify({ success: true, message: "Floor already active" }), { status: 200 });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}
