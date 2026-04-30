const express = require('express');
const router = express. Router();
const { v4: uuidv4 } = require('uuid');
const { getPool } = require('../database');
const ADMIN_KEY = process.env.ADMIN_KEY || 'admin-secret';

function requireAdmin(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (authHeader !== `Bearer ${ADMIN_KEY}`) {
    return res. status(403).json({ success: false, error: 'Unauthorized' });
  }
  next();
}

router.post('/generate- key', requireAdmin, async (req, res) => {
  try {
    const { description } = req.body;
    const key = uuidv4().replace(/-/g, '').toUpperCase().slice(0, 24);
    const formattedKey = key. match(/.{1,6}/g).join('-');

    const db = getPool();
    await db.query('INSERT INTO activation_ keys (key, description) VALUES ($1, $2)', [formattedKey, description || 'App key']);
    
    res. json({ success: true, key: formattedKey, description: description || 'App key' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to generate key' });
  }
});

router.post('/deactivate-key', requireAdmin, async (req, res) => {
  try {
    const { key } = req.body;
    const db = getPool();
    await db.query('UPDATE activation_ keys SET active = false WHERE key = $1', [key]);
    res.json({ success: true, message: 'Key deactivated' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to deactivate key' });
  }
});

router.get('/keys', requireAdmin, async (req, res) => {
  try {
    const db = getPool();
    const result = await db.query('SELECT * FROM activation_ keys ORDER BY created_at DESC');
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch keys' });
  }
});

module. exports = router;