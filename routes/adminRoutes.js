const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { checkAuth, checkNotAuth } = require('../middleware/auth');

// ✅ GET: Cek belum login
router.get('/login', checkNotAuth, adminController.getLogin);

// ✅ POST: Langsung proses, tanpa middleware (lebih aman)
router.post('/login', adminController.postLogin);

// ✅ Dashboard & Logout: Harus login
router.get('/dashboard', checkAuth, adminController.getDashboard);
router.get('/logout', checkAuth, adminController.logout);

module.exports = router;