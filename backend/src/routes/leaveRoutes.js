const express = require('express');
const router = express.Router();
const leaveController = require('../controllers/leaveController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleGuard = require('../middlewares/roleGuard');

// All leave routes require authenticated session
router.use(authMiddleware);

// Employee & all roles: Balance inquiry, application, personal history
router.get('/balances', leaveController.getBalances);
router.post('/apply', leaveController.applyLeave);
router.get('/my-history', leaveController.getMyHistory);

// Admin & HR: Review queue and approval/rejection decision
router.get('/pending', roleGuard(['ADMIN', 'HR']), leaveController.getPendingQueue);
router.patch('/:id/status', roleGuard(['ADMIN', 'HR']), leaveController.updateLeaveStatus);

module.exports = router;
