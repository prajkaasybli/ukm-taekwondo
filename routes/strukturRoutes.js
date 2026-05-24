const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs'); // ✅ Pindahkan ke atas
const strukturController = require('../controllers/strukturController');
const { checkAuth } = require('../middleware/auth');

// ✅ Auto-create folder upload (dijalankan sekali saat server start)
const uploadDir = path.join(__dirname, '../public/uploads/struktur');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ✅ Konfigurasi Upload Foto yang Diperbaiki
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Gunakan path yang sudah didefinisikan di atas (lebih aman)
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // 1. Ambil ekstensi asli file (misal: .jpg, .png)
    const ext = path.extname(file.originalname).toLowerCase();
    
    // 2. Bersihkan nama file: lowercase, ganti spasi dengan -, hapus karakter aneh
    let name = path.basename(file.originalname, ext)
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9\-_.]/g, '');
    
    // 3. Cegah nama file kosong
    if (!name) name = 'foto-pengurus';
    
    // 4. Gabungkan: timestamp + nama_bersih + ekstensi_asli
    // Hasil: 1775570695755-kayla-aqila-zahwa.jpeg (bukan .jpeg.jpeg)
    cb(null, `${Date.now()}-${name}${ext}`);
  }
});

const upload = multer({ 
  storage, 
  limits: { fileSize: 2 * 1024 * 1024 }, // Max 2MB
  fileFilter: (req, file, cb) => {
    // Validasi mimetype lebih ketat
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Hanya file gambar (jpg, jpeg, png, gif) yang diperbolehkan!'));
    }
  }
});

// Public
router.get('/', strukturController.getStrukturPublic);

// Admin
router.get('/admin', checkAuth, strukturController.getStrukturAdmin);
router.get('/admin/tambah', checkAuth, strukturController.showAddForm);
router.post('/admin/tambah', checkAuth, upload.single('foto'), strukturController.addStruktur);
router.get('/admin/edit/:id', checkAuth, strukturController.showEditForm);
router.post('/admin/edit/:id', checkAuth, upload.single('foto'), strukturController.updateStruktur);
router.get('/admin/hapus/:id', checkAuth, strukturController.deleteStruktur);

module.exports = router;