import mysql from 'mysql2/promise';

export async function GET({ url }) {
    try {
        const connection = await mysql.createConnection({
            host: 'srv1449576.hstgr.cloud',
            user: 'bobo_admin',
            password: 'BoboPass2026!',
            database: 'bobo_analytics'
        });

        const [tables] = await connection.query("SHOW TABLES");
        const results = {};

        for (const t of tables) {
            const tableName = Object.values(t)[0];
            const [count] = await connection.query(`SELECT COUNT(*) as cnt FROM \`${tableName}\``);
            results[tableName] = count[0].cnt;
        }

        await connection.end();
        return new Response(JSON.stringify(results), { status: 200 });

    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}
