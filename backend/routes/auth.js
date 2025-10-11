// routes/auth.js
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { readData, writeData } = require('../data/storage');
const { SECRET } = require('../middleware/auth');

const router = express.Router();
const SALT_ROUNDS = 10;

// signup
router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body || {};
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'name, email and password required' });
  }

  const data = await readData();
  const existing = data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(400).json({ error: 'User already exists' });
  }

  const hash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = { id: uuidv4(), name, email: email.toLowerCase(), passwordHash: hash };
  data.users.push(user);
  await writeData(data);

  // create token
  const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
});

// signin
router.post('/signin', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'email and password required' });

  const data = await readData();
  const user = data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) return res.status(400).json({ error: 'Invalid credentials' });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(400).json({ error: 'Invalid credentials' });

  const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
});

module.exports = router;
