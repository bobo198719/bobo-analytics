const mysql = require('mysql2');
const conn = mysql.createConnection({
    host: 'srv1449576.hstgr.cloud',
    user: 'bobo_admin',
    password: 'BoboPass2026!',
    database: 'bobo_analytics',
    port: 3306
});

conn.connect(err => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log('✅ Connected to MySQL!');

    conn.query(`CREATE TABLE IF NOT EXISTS menu_matrix (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255),
        category VARCHAR(100),
        type VARCHAR(50),
        price INT,
        image_url VARCHAR(500)
    )`, (err) => {
        if (err) console.error(err);
        else console.log("✅ menu_matrix table ready.");
        
        process.exit(0);
    });
});
