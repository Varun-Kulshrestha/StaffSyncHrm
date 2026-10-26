const jwt = require('jsonwebtoken');
const { findUserById } = require('../data/users');

const JWT_SECRET = process.env.JWT_SECRET || 'staffsync_super_secret_jwt_key_2026';

/**
 * Middleware to verify JWT token in Authorization header
 */
function verifyToken(req, res, next) {
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
      message: 'Authorization header format must be Bearer <token>'
    });
  }

  const token = parts[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = findUserById(decoded.id);

    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid token: user not found'
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

/**
 * RBAC Middleware to restrict access to specific roles
 */
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: '403 Forbidden - Access Denied: Insufficient role permissions'
      });
    }

    next();
  };
}

module.exports = {
  JWT_SECRET,
  verifyToken,
  requireRole
};
