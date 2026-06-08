const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { checkAuth, checkNotAuth } = require('../middleware/auth');

// GET /login - Halaman login universal (belum login)
router.get('/login', checkNotAuth, authController.getLogin);

// POST /login - Proses login universal
router.post('/login', authController.postLogin);

// GET /logout - Logout universal
router.get('/logout', authController.logout);

module.exports = router;
