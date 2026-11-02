const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../config/jwt');

/**
 * POST /api/v1/auth/login
 */
function login(req, res, next) {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed: Email and password are required.'
      });
    }

    // =========================================================================
    // INTENTIONAL SEEDED DEFECT-001:
    // Omit trimming and lowercasing on the incoming email.
    // Querying SQLite directly with raw email causes leading/trailing whitespace
    // or case differences to fail the lookup, returning 401 Unauthorized.
    // =========================================================================
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password'
      });
    }

    // Verify bcrypt password hash
    const isPasswordValid = bcrypt.compareSync(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password'
      });
    }

    // =========================================================================
    // INTENTIONAL SEEDED DEFECT-002:
    // When the user account is inactive (is_active = 0), throw an unhandled
    // exception instead of gracefully returning HTTP 403 Forbidden.
    // Global errorHandler catches this and returns HTTP 500 Internal Server Error.
    // =========================================================================
    if (!user.is_active) {
      throw new Error(`CRITICAL_ACCOUNT_DEACTIVATED_EXCEPTION: Account is inactive for ${user.email}`);
    }

    // Issue signed JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return res.status(200).json({
      status: 'success',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        is_active: Boolean(user.is_active)
      }
    });
  } catch (error) {
    next(error);
  }
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
      role: req.user.role,
      is_active: Boolean(req.user.is_active),
      created_at: req.user.created_at
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

/**
 * GET /api/v1/admin/stats
 * Admin operational metrics
 */
function getAdminStats(req, res) {
  const totalUsersRow = db.prepare('SELECT COUNT(*) as count FROM users').get();
  const activeUsersRow = db.prepare('SELECT COUNT(*) as count FROM users WHERE is_active = 1').get();
  const inactiveUsersRow = db.prepare('SELECT COUNT(*) as count FROM users WHERE is_active = 0').get();

  return res.status(200).json({
    status: 'success',
    data: {
      metrics: {
        totalUsers: totalUsersRow.count,
        activeUsers: activeUsersRow.count,
        inactiveUsers: inactiveUsersRow.count,
        systemHealth: 'OPERATIONAL',
        activeSessions: 18,
        serverUptimeHours: 196.4,
        securityCompliance: 'SOC2_TYPE2_COMPLIANT'
      },
      audit: {
        lastAuditRun: new Date().toISOString(),
        requestor: {
          id: req.user.id,
          email: req.user.email,
          role: req.user.role
        }
      }
    }
  });
}

module.exports = {
  login,
  getMe,
  logout,
  getAdminStats
};
