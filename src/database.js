const initSqlJs = require('sql.js');
const path = require('path');
const fs = require('fs');

let db;

async function initDb() {
  const SQL = await initSqlJs();
  const dbPath = path.join(__dirname, '..', 'activation.db');
  
  if (fs.existsSync(dbPath)) {
    const buffer = fs.readFileSync(dbPath);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  db.run(`
    CREATE TABLE IF NOT EXISTS activation_keys (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT UNIQUE NOT NULL,
      description TEXT,
      active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      used_at DATETIME
    )
  `);

  saveDb();
}

function saveDb() {
  if (!db) return;
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(path.join(__dirname, '..', 'activation.db'), buffer);
}

function getDb() {
  return db;
}

function validateActivationKey(key) {
  if (!key) return false;
  const stmt = db.prepare('SELECT * FROM activation_keys WHERE key = ? AND active = 1');
  stmt.bind([key]);
  const valid = stmt.step();
  stmt.free();
  return valid;
}

module.exports = { initDb, saveDb, getDb, validateActivationKey };