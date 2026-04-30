const express = require('express');
const router = express.Router();
const { validateActivationKey } = require('../database');

router.get('/verify', (req, res) => {
  const key = req.headers['x-activation-key'];
  if (!key) {
    return res.status(401).json({ success: false, error: 'Activation key required' });
  }
  if (validateActivationKey(key)) {
    res.json({ success: true, valid: true });
  } else {
    return res.status(403).json({ success: false, error: 'Invalid or inactive key' });
  }
});

module.exports = router;