const express = require('express');
const router = express.Router();
const pendaftaranController = require('../controllers/pendaftaranController');
const { checkAuth } = require('../middleware/auth');

// Public
router.get('/form', pendaftaranController.getFormPendaftaran);
router.post('/submit', pendaftaranController.submitPendaftaran);

// Admin
router.get('/admin', checkAuth, pendaftaranController.getPendaftaranAdmin);
router.get('/admin/verify/:id/:action', checkAuth, pendaftaranController.verifyPendaftaran);

module.exports = router;