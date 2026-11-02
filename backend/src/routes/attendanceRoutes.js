const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleGuard = require('../middlewares/roleGuard');

// All attendance routes require authenticated context
router.use(authMiddleware);

// Employee actions & personal logs
router.post('/clock-in', attendanceController.clockIn);
router.post('/clock-out', attendanceController.clockOut);
router.get('/today', attendanceController.getTodayStatus);
router.get('/history', attendanceController.getHistory);

// Admin & HR org-wide attendance report
router.get('/admin/daily-report', roleGuard(['ADMIN', 'HR']), attendanceController.getAdminDailyReport);

module.exports = router;
