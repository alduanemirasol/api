const { Pool } = require('pg');

let pool;

function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });
  }
  return pool;
}

async function initDb() {
  const db = getPool();
  
  await db.query(`
    CREATE TABLE IF NOT EXISTS activation_keys (
      id SERIAL PRIMARY KEY,
      key VARCHAR(64) UNIQUE NOT NULL,
      description TEXT,
      active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      used_at TIMESTAMP
    )
  `);
}

function saveDb() {}

async function validateActivationKey(key) {
  if (!key) return false;
  const db = getPool();
  const result = await db.query('SELECT id FROM activation_keys WHERE key = $1 AND active = true', [key]);
  return result.rows.length > 0;
}

module.exports = { initDb, saveDb, getPool, validateActivationKey };