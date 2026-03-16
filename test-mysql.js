import mysql from 'mysql2/promise';

// --- CONFIGURATION ---
const dbConfig = {
  host: 'srv1449576.hstgr.cloud', 
  user: 'bobo_admin',
  password: 'BoboPass2026!', 
  database: 'bobo_analytics',
  port: 3306
};

async function testConnection() {
  console.log('--- Database Connection Test ---');
  console.log(`Connecting to: ${dbConfig.host}...`);

  try {
    const connection = await mysql.createConnection(dbConfig);
    console.log('✅ SUCCESS: Connected to Hostinger MySQL!');

    const [rows] = await connection.query('SELECT VERSION() as version');
    console.log(`Server version: ${rows[0].version}`);

    await connection.end();
    console.log('Connection closed.');
  } catch (err) {
    console.error('❌ FAILED: Could not connect to the database.');
    console.error('Error details:', err.message);

    if (err.message.includes('ECONNREFUSED')) {
      console.log('\nTip: Check if the MySQL port (3306) is open in the Hostinger firewall.');
    } else if (err.message.includes('ER_ACCESS_DENIED_ERROR')) {
      console.log('\nTip: Check if the username and password are correct and have remote access granted.');
    }
  }
}

testConnection();
