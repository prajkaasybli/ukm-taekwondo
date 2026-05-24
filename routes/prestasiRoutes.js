const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const prestasiController = require('../controllers/prestasiController');

// ✅ GABUNGKAN SEMUA MIDDLEWARE DI SINI
const { checkAuth, checkMemberAuth } = require('../middleware/auth');

// ============================================
// KONFIGURASI UPLOAD FOTO
// ============================================
const uploadDir = path.join(__dirname, '../public/uploads/prestasi');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const name = path.basename(file.originalname, ext)
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9\-_.]/g, '');
    cb(null, `prestasi-${Date.now()}-${name}${ext}`);
  }
});

// ✅ NAMA VARIABLE: 'upload' (bukan prestasiUpload)
const upload = multer({ 
  storage, 
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (/jpeg|jpg|png/.test(file.mimetype)) cb(null, true);
    else cb(new Error('Hanya gambar JPG/PNG!'));
  }
});

// ============================================
// PUBLIC ROUTES
// ============================================
router.get('/', prestasiController.getPrestasiPublic);

// ============================================
// MEMBER ROUTES (Anggota Login)
// ============================================
router.get('/submit', checkMemberAuth, prestasiController.showMemberSubmitForm);

// ✅ PERBAIKAN: pakai 'upload' bukan 'prestasiUpload'
router.post('/submit', checkMemberAuth, upload.single('foto'), prestasiController.submitPrestasiMember);

router.get('/my-submissions', checkMemberAuth, prestasiController.getMySubmissions);

// ============================================
// ADMIN ROUTES
// ============================================
router.get('/admin', checkAuth, prestasiController.getPrestasiAdmin);
router.get('/admin/tambah', checkAuth, prestasiController.showAddForm);
router.post('/admin/tambah', checkAuth, upload.single('foto'), prestasiController.addPrestasi);
router.get('/admin/edit/:id', checkAuth, prestasiController.showEditForm);
router.post('/admin/edit/:id', checkAuth, upload.single('foto'), prestasiController.updatePrestasi);
router.get('/admin/hapus/:id', checkAuth, prestasiController.deletePrestasi);

// Admin Approval Routes
router.get('/admin/pending', checkAuth, prestasiController.getPendingPrestasi);
router.post('/admin/approve/:id', checkAuth, prestasiController.approvePrestasi);
router.post('/admin/reject/:id', checkAuth, prestasiController.rejectPrestasi);

module.exports = router;