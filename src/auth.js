const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

function generateToken(user) {
  const payload = { id: user.id, role: user.role, email: user.email };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });
}

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

// Middleware for AdminJS to validate JWT cookie
function adminJwtMiddleware(req, res, next) {
  const token = req.cookies[process.env.ADMIN_COOKIE_NAME || 'adminToken'];
  if (!token) return next();
  const user = verifyToken(token);
  if (user) req.session.adminUser = user;
  next();
}

module.exports = { generateToken, verifyToken, adminJwtMiddleware };
