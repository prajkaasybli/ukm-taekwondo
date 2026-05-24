const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const anggotaController = require('../controllers/anggotaController');
const { checkAuth } = require('../middleware/auth');

// Konfigurasi Upload Foto Anggota
const anggotaUploadDir = path.join(__dirname, '../public/uploads/anggota');
if (!fs.existsSync(anggotaUploadDir)) {
  fs.mkdirSync(anggotaUploadDir, { recursive: true });
}

const anggotaStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, anggotaUploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const name = path.basename(file.originalname, ext)
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9\-_.]/g, '');
    cb(null, `${Date.now()}-${name}${ext}`);
  }
});

const anggotaUpload = multer({ 
  storage: anggotaStorage, 
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png/;
    if (allowed.test(path.extname(file.originalname).toLowerCase()) && 
        allowed.test(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Hanya file gambar (jpg, jpeg, png) yang diperbolehkan!'));
    }
  }
});

// Public
router.get('/', anggotaController.getAnggotaPublic);

// Admin
router.get('/admin', checkAuth, anggotaController.getAnggotaAdmin);
router.post('/admin/tambah', checkAuth, anggotaUpload.single('foto'), anggotaController.addAnggota);
router.post('/admin/edit/:id', checkAuth, anggotaUpload.single('foto'), anggotaController.updateAnggota);
router.get('/admin/hapus/:id', checkAuth, anggotaController.deleteAnggota);

module.exports = router;