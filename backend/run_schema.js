const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function runSchema() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      multipleStatements: true // Allows executing multiple queries at once
    });

    const schemaPath = path.join(__dirname, 'db', 'schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');

    console.log('Running schema...');
    await connection.query(sql);
    console.log('Schema executed successfully. All tables created.');

  } catch (error) {
    console.error('Error running schema:', error);
  } finally {
    if (connection) await connection.end();
  }
}

runSchema();
