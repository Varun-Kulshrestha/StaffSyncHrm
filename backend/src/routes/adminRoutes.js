const express = require('express');
const router = express.Router();
const { getAdminStats } = require('../controllers/adminController');
const { verifyToken } = require('../middleware/authMiddleware');

// =========================================================================
// INTENTIONAL DEFECT 3: RBAC Privilege Leak
// The route validates token existence via verifyToken, but omits requireRole('ADMIN')!
// This allows any authenticated user (e.g. Employee or HR) to access Admin statistics.
// Expected fix: router.get('/stats', verifyToken, requireRole('ADMIN'), getAdminStats);
// =========================================================================
router.get('/stats', verifyToken, getAdminStats);

module.exports = router;
