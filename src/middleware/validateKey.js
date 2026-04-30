const { validateActivationKey } = require('../database');

function validateKey(req, res, next) {
  const key = req.headers['x-activation-key'];
  if (!key) {
    return res.status(401).json({ success: false, error: 'Activation key required' });
  }
  if (validateActivationKey(key)) {
    next();
  } else {
    return res.status(403).json({ success: false, error: 'Invalid or inactive activation key' });
  }
}

module.exports = validateKey;