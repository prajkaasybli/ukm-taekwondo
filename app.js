require('dotenv').config();
const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const path = require('path');

const app = express();

// 1. View Engine Setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 2. Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));

// 3. Session & Flash Messages
app.use(session({
  secret: process.env.SESSION_SECRET || 'ukm_secret_key_2024',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 } // 24 jam
}));
app.use(flash());

// 4. Global Variables untuk Views
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.user = req.session; // Mengirim session ke semua view
  next();
});

// 5. Routes Registration
app.use('/', require('./routes/authRoutes')); // ✅ ROUTE LOGIN UNIVERSAL
app.use('/admin', require('./routes/adminRoutes'));
app.use('/anggota', require('./routes/anggotaRoutes'));
// app.use('/anggota', require('./routes/anggotaAuthRoutes')); // ❌ DINONAKTIFKAN - diganti dengan authRoutes
app.use('/jadwal', require('./routes/jadwalRoutes'));
app.use('/kegiatan', require('./routes/kegiatanRoutes'));
app.use('/prestasi', require('./routes/prestasiRoutes'));
app.use('/daftar', require('./routes/pendaftaranRoutes'));
app.use('/struktur', require('./routes/strukturRoutes'));
// 6. Home Route
// 6. Home Route
app.get('/', async (req, res) => {
    try {
      const Kegiatan = require('./models/Kegiatan');
      
      // Ambil 3 kegiatan terbaru (diurutkan dari tanggal terdekat)
      const kegiatanTerbaru = await Kegiatan.findAll({
        limit: 3,
        order: [['tanggal', 'ASC']], // Tampilkan yang paling dekat dulu
        where: {
          // Opsional: hanya tampilkan kegiatan yang belum lewat
          tanggal: { [require('sequelize').Op.gte]: new Date().toISOString().split('T')[0] }
        }
      });
  
      res.render('public/index', {
        title: 'Home - TAVEJA',
        kegiatanTerbaru,
        user: req.session
      });
    } catch (err) {
      console.error('Home route error:', err);
      // Jika error, tetap render halaman dengan data kosong agar tidak crash
      res.render('public/index', {
        title: 'Home - TAVEJA',
        kegiatanTerbaru: [],
        user: req.session
      });
    }
  });

// 7. Error & 404 Handlers
app.use((req, res) => {
  res.status(404).send('<h1 class="text-center mt-5">404 - Halaman Tidak Ditemukan</h1>');
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('<h1 class="text-center mt-5 text-danger">500 - Terjadi Kesalahan Server</h1>');
});

module.exports = app;