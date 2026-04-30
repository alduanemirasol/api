const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

let pool;

function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env. DATABASE_URL,
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

function saveDb() {
  // Not needed for PostgreSQL - data persists automatically
}

function validateActivationKey(key) {
  return new Promise((resolve) => {
    if (!key) return resolve(false);
    const db = getPool();
    db.query('SELECT id FROM activation_keys WHERE key = $1 AND active = true', [key], (err, res) => {
      resolve(!err && res.rows.length > 0);
    });
  });
}

module.exports = { initDb, saveDb, getPool, validateActivationKey };