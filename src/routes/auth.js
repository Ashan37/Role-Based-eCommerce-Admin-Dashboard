const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { models } = require('../models');
const { generateToken } = require('../auth');

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await models.User.findOne({ where: { email } });
  if (!user) return res.status(401).json({ message: 'Invalid email or password' });

  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) return res.status(401).json({ message: 'Invalid email or password' });

  const token = generateToken(user);
  res.cookie(process.env.ADMIN_COOKIE_NAME || 'adminToken', token, { httpOnly: true });
  return res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});

module.exports = router;
