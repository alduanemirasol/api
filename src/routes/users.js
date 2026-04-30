const express = require('express');
const router = express.Router();

const users = [
  { id: 1, name: 'Alice', email: 'alice@example.com' },
  { id: 2, name: 'Bob', email: 'bob@example.com' }
];

let nextUserId = 3;

router.get('/', (req, res) => {
  res.json({ success: true, data: users });
});

router.get('/:id', (req, res) => {
  const user = users.find(u => u.id === parseInt(req.params.id));
  if (!user) return res.status(404).json({ success: false, error: 'User not found' });
  res.json({ success: true, data: user });
});

router.post('/', (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) {
    return res.status(400).json({ success: false, error: 'Name and email required' });
  }
  const newUser = { id: nextUserId++, name, email };
  users.push(newUser);
  res.status(201).json({ success: true, data: newUser });
});

module.exports = router;