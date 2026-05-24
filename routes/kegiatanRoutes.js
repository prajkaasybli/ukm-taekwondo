const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const kegiatanController = require('../controllers/kegiatanController');
const { checkAuth } = require('../middleware/auth');

// Folder upload
const fotoDir = path.join(__dirname, '../public/uploads/kegiatan/foto');
const fileDir = path.join(__dirname, '../public/uploads/kegiatan/file');
if (!fs.existsSync(fotoDir)) fs.mkdirSync(fotoDir, { recursive: true });
if (!fs.existsSync(fileDir)) fs.mkdirSync(fileDir, { recursive: true });

// Upload config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dest = file.fieldname === 'foto' ? fotoDir : fileDir;
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const name = path.basename(file.originalname, ext)
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9\-_.]/g, '');
    const prefix = file.fieldname === 'foto' ? 'foto' : 'file';
    cb(null, `${prefix}-${Date.now()}-${name}${ext}`);
  }
});

const upload = multer({ 
  storage, 
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (file.fieldname === 'foto') {
      /jpeg|jpg|png/.test(ext) ? cb(null, true) : cb(new Error('Hanya gambar!'));
    } else {
      const allowed = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx'];
      allowed.includes(ext) ? cb(null, true) : cb(new Error('Hanya file dokumen!'));
    }
  }
});

// Routes
router.get('/', kegiatanController.getKegiatanPublic);
router.get('/detail/:id', kegiatanController.getKegiatanDetail);
router.post('/daftar/:id', kegiatanController.daftarKegiatan);

router.get('/admin', checkAuth, kegiatanController.getKegiatanAdmin);
router.get('/admin/tambah', checkAuth, kegiatanController.showAddForm);
router.post('/admin/tambah', checkAuth, upload.fields([
  { name: 'foto', maxCount: 1 },
  { name: 'file_penjelasan', maxCount: 1 }
]), kegiatanController.addKegiatan);

router.get('/admin/edit/:id', checkAuth, kegiatanController.showEditForm);
router.post('/admin/edit/:id', checkAuth, upload.fields([
  { name: 'foto', maxCount: 1 },
  { name: 'file_penjelasan', maxCount: 1 }
]), kegiatanController.updateKegiatan);

router.get('/admin/hapus/:id', checkAuth, kegiatanController.deleteKegiatan);
router.get('/admin/pendaftaran/:id', checkAuth, kegiatanController.getPendaftaranKegiatan);

module.exports = router;