const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { findUserByRawEmail } = require('../data/users');
const { JWT_SECRET } = require('../middleware/authMiddleware');

/**
 * POST /api/v1/auth/login
 */
function login(req, res) {
  const { email, password } = req.body || {};

  // Validate required fields
  if (!email || !password) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed: Email and password are required.'
    });
  }

  // =========================================================================
  // INTENTIONAL DEFECT 1: Input Sanitization Flaw
  // Frontend trims email, but backend directly checks raw input without
  // trimming or lowercasing. Untrimmed or uppercase emails will fail exact match.
  // Expected fix: const sanitizedEmail = email.trim().toLowerCase();
  // =========================================================================
  const user = findUserByRawEmail(email);

  if (!user) {
    return res.status(401).json({
      status: 'error',
      message: 'Invalid email or password'
    });
  }

  // Validate password
  const isMatch = bcrypt.compareSync(password, user.passwordHash);
  if (!isMatch) {
    return res.status(401).json({
      status: 'error',
      message: 'Invalid email or password'
    });
  }

  // =========================================================================
  // INTENTIONAL DEFECT 2: Status Code & Exception Leak
  // Instead of properly returning HTTP 403 Forbidden with:
  // res.status(403).json({ status: 'error', message: 'Account is deactivated. Please contact admin.' })
  // Backend throws an unhandled exception which triggers 500 Internal Server Error.
  // =========================================================================
  if (!user.is_active) {
    throw new Error(
      `CRITICAL_ACCOUNT_DEACTIVATED_EXCEPTION: User status is inactive for ${user.email}`
    );
  }

  // Generate JWT token
  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: '8h' }
  );

  return res.status(200).json({
    status: 'success',
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      is_active: user.is_active
    }
  });
}

/**
 * GET /api/v1/auth/me
 */
function getMe(req, res) {
  return res.status(200).json({
    status: 'success',
    user: {
      id: req.user.id,
      email: req.user.email,
      name: req.user.name,
      role: req.user.role,
      department: req.user.department,
      is_active: req.user.is_active
    }
  });
}

/**
 * POST /api/v1/auth/logout
 */
function logout(req, res) {
  return res.status(200).json({
    status: 'success',
    message: 'Logged out successfully'
  });
}

module.exports = {
  login,
  getMe,
  logout
};
