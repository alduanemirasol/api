const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { getDb, saveDb } = require('../database');

const ADMIN_KEY = process.env.ADMIN_KEY || 'admin-secret';

function requireAdmin(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (authHeader !== `Bearer ${ADMIN_KEY}`) {
    return res.status(403).json({ success: false, error: 'Unauthorized' });
  }
  next();
}

router.post('/generate-key', requireAdmin, (req, res) => {
  const { description } = req.body;
  const key = uuidv4().replace(/-/g, '').toUpperCase().slice(0, 24);
  const formattedKey = key.match(/.{1,6}/g).join('-');

  const db = getDb();
  db.run('INSERT INTO activation_keys (key, description) VALUES (?, ?)', [formattedKey, description || 'App key']);
  saveDb();
  res.json({ success: true, key: formattedKey, description: description || 'App key' });
});

router.post('/deactivate-key', requireAdmin, (req, res) => {
  const { key } = req.body;
  const db = getDb();
  db.run('UPDATE activation_keys SET active = 0 WHERE key = ?', [key]);
  saveDb();
  res.json({ success: true, message: 'Key deactivated' });
});

router.get('/keys', requireAdmin, (req, res) => {
  const db = getDb();
  const results = [];
  const stmt = db.prepare('SELECT * FROM activation_keys ORDER BY created_at DESC');
  while (stmt.step()) {
    results.push(stmt.getAsObject());
  }
  stmt.free();
  res.json({ success: true, data: results });
});

module.exports = router;