const Admin = require('../models/Admin');
const Anggota = require('../models/Anggota');
const Kegiatan = require('../models/Kegiatan');
const Pendaftaran = require('../models/Pendaftaran');
const JadwalLatihan = require('../models/JadwalLatihan');
const Prestasi = require('../models/Prestasi');
const bcrypt = require('bcryptjs');

// GET /admin/login
exports.getLogin = (req, res) => {
  // Jika sudah login, langsung ke dashboard
  if (req.session && req.session.adminLoggedIn) {
    return res.redirect('/admin/dashboard');
  }
  res.render('admin/login', { title: 'Login Admin', user: req.session });
};

// POST /admin/login
exports.postLogin = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const admin = await Admin.findOne({ where: { username } });
    
    if (!admin) {
      req.flash('error_msg', '❌ Username atau password salah');
      return res.redirect('/admin/login');
    }
    
    const isMatch = await bcrypt.compare(password, admin.password);
    
    if (!isMatch) {
      req.flash('error_msg', '❌ Username atau password salah');
      return res.redirect('/admin/login');
    }
    
    // ✅ SET SESSION
    req.session.adminLoggedIn = true;
    req.session.adminId = admin.id_admin;
    req.session.adminUsername = admin.username;
    
    // ✅ SIMPAN SESSION SEBELUM REDIRECT (PENTING!)
    req.session.save((err) => {
      if (err) {
        console.error('Session save error:', err);
        req.flash('error_msg', '❌ Gagal menyimpan session');
        return res.redirect('/admin/login');
      }
      
      req.flash('success_msg', '✅ Login berhasil!');
      return res.redirect('/admin/dashboard');
    });
    
  } catch (error) {
    console.error('Login error:', error);
    req.flash('error_msg', '❌ Terjadi kesalahan server');
    res.redirect('/admin/login');
  }
};

// GET /admin/dashboard - VERSI TEST (TANPA QUERY)
exports.getDashboard = async (req, res) => {
  try {
    console.log('🔍 [DB] Mulai fetch data dashboard...');
    
    // ⏱️ Timeout manual agar tidak freeze selamanya
    const timeout = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('⏱️ Query timeout (10 detik)')), 10000)
    );

    const query = Promise.all([
      Anggota.count(),
      Kegiatan.count(),
      Pendaftaran.count({ where: { status: 'Pending' } }),
      JadwalLatihan.count(),
      Prestasi.count()
    ]);

    const [jumlahAnggota, jumlahKegiatan, jumlahPendaftaran, jumlahJadwal, jumlahPrestasi] = 
      await Promise.race([query, timeout]);

    console.log('✅ [DB] Data dashboard berhasil diambil');
    
    res.render('admin/dashboard', {
      title: 'Dashboard Admin',
      jumlahAnggota, jumlahKegiatan, jumlahPendaftaran,
      jumlahJadwal, jumlahPrestasi,
      user: req.session
    });
  } catch (error) {
    console.error('❌ [DB] Dashboard error:', error.message);
    // Fallback: render tanpa angka agar admin tetap bisa akses
    res.render('admin/dashboard', {
      title: 'Dashboard Admin',
      jumlahAnggota: '-', jumlahKegiatan: '-', 
      jumlahPendaftaran: '-', jumlahJadwal: '-', jumlahPrestasi: '-',
      user: req.session
    });
  }
};

// GET /admin/logout
exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) console.error('Logout error:', err);
    res.clearCookie('connect.sid'); // ✅ Clear cookie session
    res.redirect('/admin/login');   // ✅ Redirect ke login, bukan home
  });
};