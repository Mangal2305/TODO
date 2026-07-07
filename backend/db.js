const { Pool } = require('pg');

// Check if we are running on a live hosting platform like Render
const isProduction = process.env.NODE_ENV === 'production' || process.env.DB_HOST?.includes('render.com');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  // Ensure port is explicitly parsed as an integer number, not a string
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'tododb',
  // Enforce flexible SSL connection modes required by cloud database clusters
  ssl: isProduction || process.env.DB_SSL === 'true' 
    ? { rejectUnauthorized: false } 
    : false,
});

async function initDb() {
  // Debug Log: Helps you audit your deployment dashboard environment values instantly
  console.log(`[Database Connection Detail] Host target: ${process.env.DB_HOST || 'localhost (fallback)'}`);

  // Acquire a dedicated client connection runner from the pool cluster
  const client = await pool.connect();
  
  try {
    // 1. Create Users Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // 2. Create Todos Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS todos (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        completed BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    console.log('Database tables ready');
  } catch (error) {
    console.error('Database structure initialization failed:', error.message);
    throw error; // Escalate up to server.js wrapper lifecycle handler
  } finally {
    // Clean up and release the client back to the active pool
    client.release();
  }
}

module.exports = { pool, initDb };
