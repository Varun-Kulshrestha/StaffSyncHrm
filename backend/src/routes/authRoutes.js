const express = require('express');
const router = express.Router();
const { login, getMe, logout } = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/login', login);
router.get('/me', authMiddleware, getMe);
router.post('/logout', authMiddleware, logout);

module.exports = router;
