const express = require('express');
const router = express.Router();
const jadwalController = require('../controllers/jadwalController');
const { checkAuth, checkNotAuth } = require('../middleware/auth');

// Public routes
router.get('/', jadwalController.getJadwalPublic);

// Admin routes
router.get('/admin', checkAuth, jadwalController.getAllJadwal);
router.get('/admin/tambah', checkAuth, jadwalController.showAddForm);
router.post('/admin/tambah', checkAuth, jadwalController.addJadwal);
router.get('/admin/edit/:id', checkAuth, jadwalController.showEditForm);
router.post('/admin/edit/:id', checkAuth, jadwalController.updateJadwal);
router.get('/admin/hapus/:id', checkAuth, jadwalController.deleteJadwal);

module.exports = router;