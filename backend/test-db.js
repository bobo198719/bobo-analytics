const db = require('./mysql_db');

async function test() {
    try {
        console.log("Testing connection...");
        const [rows] = await db.rawPool.execute('SELECT * FROM restaurant_orders LIMIT 1');
        console.log("Connection successful! Tables exist.");
        process.exit(0);
    } catch (e) {
        console.error("DB Error:", e.message);
        process.exit(1);
    }
}

test();
