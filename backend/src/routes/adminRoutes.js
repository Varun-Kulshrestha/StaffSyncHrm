const express = require('express');
const router = express.Router();
const { getAdminStats } = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');

// =========================================================================
// INTENTIONAL SEEDED DEFECT-003:
// /api/v1/admin/stats validates presence of a valid JWT token via authMiddleware,
// but omits the roleGuard(['ADMIN']) check! This allows an EMPLOYEE or HR
// token to access confidential administrative statistics metrics.
// Expected fix: router.get('/stats', authMiddleware, roleGuard(['ADMIN']), getAdminStats);
// =========================================================================
router.get('/stats', authMiddleware, getAdminStats);

module.exports = router;
