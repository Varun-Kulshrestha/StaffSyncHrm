const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/jwt');
const db = require('../config/db');

function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({
      status: 'error',
      message: 'Authorization header is required'
    });
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({
      status: 'error',
      message: 'Authorization format must be Bearer <token>'
    });
  }

  const token = parts[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = db.prepare('SELECT id, email, role, is_active, created_at FROM users WHERE id = ?').get(decoded.id);

    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid session token: user not found'
      });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({
      status: 'error',
      message: 'Invalid or expired token'
    });
  }
}

module.exports = authMiddleware;
