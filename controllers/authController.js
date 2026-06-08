const Admin = require('../models/Admin');
const Anggota = require('../models/Anggota');
const bcrypt = require('bcryptjs');

// GET /login - Halaman login universal
exports.getLogin = (req, res) => {
  // Jika sudah login sebagai admin, redirect ke dashboard admin
  if (req.session && req.session.adminLoggedIn) {
    return res.redirect('/admin/dashboard');
  }
  
  // Jika sudah login sebagai anggota, redirect ke home
  if (req.session && req.session.isLoggedIn) {
    return res.redirect('/');
  }
  
  res.render('public/login', { 
    title: 'Login - UKM Taekwondo UPNVJ',
    user: req.session 
  });
};

// POST /login - Proses login universal
exports.postLogin = async (req, res) => {
  try {
    const { identifier, password } = req.body;
    
    if (!identifier || !password) {
      req.flash('error_msg', '❌ Username/Email dan Password harus diisi!');
      return res.redirect('/login');
    }
    
    let admin = null;
    let anggota = null;
    let isMatch = false;
    
    // 🔍 CEK SEBAGAI ADMIN TERLEBIH DAHULU (berdasarkan username)
    try {
      admin = await Admin.findOne({ where: { username: identifier } });
    } catch (err) {
      console.error('Error checking admin:', err);
    }
    
    if (admin) {
      // Jika ditemukan sebagai admin, cek password
      isMatch = await bcrypt.compare(password, admin.password);
      
      if (isMatch) {
        // ✅ LOGIN BERHASIL SEBAGAI ADMIN
        req.session.adminLoggedIn = true;
        req.session.adminId = admin.id_admin;
        req.session.adminUsername = admin.username;
        
        req.session.save((err) => {
          if (err) {
            console.error('Session save error:', err);
            req.flash('error_msg', '❌ Gagal menyimpan session');
            return res.redirect('/login');
          }
          
          req.flash('success_msg', '✅ Login Admin berhasil! Selamat datang, ' + admin.username);
          return res.redirect('/admin/dashboard');
        });
        return; // Exit setelah login admin berhasil
      }
    }
    
    // 🔍 JIKA BUKAN ADMIN, CEK SEBAGAI ANGGOTA (berdasarkan email)
    try {
      anggota = await Anggota.findOne({ where: { email: identifier } });
    } catch (err) {
      console.error('Error checking anggota:', err);
    }
    
    if (anggota) {
      // Jika ditemukan sebagai anggota, cek password
      isMatch = await bcrypt.compare(password, anggota.password);
      
      if (isMatch) {
        // ✅ LOGIN BERHASIL SEBAGAI ANGGOTA
        req.session.anggotaId = anggota.id_anggota;
        req.session.anggotaNama = anggota.nama;
        req.session.anggotaEmail = anggota.email;
        req.session.isLoggedIn = true;
        
        req.session.save((err) => {
          if (err) {
            console.error('Session save error:', err);
            req.flash('error_msg', '❌ Gagal menyimpan session');
            return res.redirect('/login');
          }
          
          req.flash('success_msg', '✅ Login berhasil! Selamat datang, ' + anggota.nama);
          return res.redirect('/');
        });
        return; // Exit setelah login anggota berhasil
      } else {
        // Password salah untuk anggota
        req.flash('error_msg', '❌ Password salah!');
        return res.redirect('/login');
      }
    }
    
    // ❌ TIDAK DITEMUKAN SEBAGAI ADMIN MAUPUN ANGGOTA
    req.flash('error_msg', '❌ Username/Email tidak terdaftar!');
    return res.redirect('/login');
    
  } catch (error) {
    console.error('Login error:', error);
    req.flash('error_msg', '❌ Terjadi kesalahan server');
    return res.redirect('/login');
  }
};

// GET /logout - Logout universal
exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) console.error('Logout error:', err);
    res.clearCookie('connect.sid');
    res.redirect('/');
  });
};
