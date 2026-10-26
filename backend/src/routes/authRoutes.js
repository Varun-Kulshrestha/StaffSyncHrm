const express = require('express');
const router = express.Router();
const { login, getMe, logout } = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware');

// Public route: Login
router.post('/login', login);

// Protected route: Current user context
router.get('/me', verifyToken, getMe);

// Protected route: Logout
router.post('/logout', verifyToken, logout);

module.exports = router;
