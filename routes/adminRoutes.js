const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { checkAuth } = require('../middleware/auth');

// ✅ Dashboard & Logout: Harus login
// Route /admin/login sudah dihapus - gunakan /login universal
router.get('/dashboard', checkAuth, adminController.getDashboard);
router.get('/logout', checkAuth, adminController.logout);

module.exports = router;