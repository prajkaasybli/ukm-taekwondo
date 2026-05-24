const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const Anggota = require('../models/Anggota');

// GET /anggota/login
router.get('/login', (req, res) => {
  res.render('public/anggota-login', { 
    title: 'Login Anggota',
    user: req.session
  });
});

// POST /anggota/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Cek apakah email terdaftar
    const anggota = await Anggota.findOne({ where: { email } });
    
    if (!anggota) {
      req.flash('error_msg', '❌ Email tidak terdaftar. Anda bukan anggota UKM Taekwondo.');
      return res.redirect('/anggota/login');
    }
    
    // Cek password
    const isMatch = await bcrypt.compare(password, anggota.password);
    
    if (!isMatch) {
      req.flash('error_msg', '❌ Password salah!');
      return res.redirect('/anggota/login');
    }
    
    // Set session
    req.session.anggotaId = anggota.id_anggota;
    req.session.anggotaNama = anggota.nama;
    req.session.anggotaEmail = anggota.email;
    req.session.isLoggedIn = true;
    
    req.flash('success_msg', `✅ Selamat datang, ${anggota.nama}!`);
    res.redirect('/');
    
  } catch (err) {
    console.error('Login error:', err);
    req.flash('error_msg', '❌ Terjadi kesalahan server');
    res.redirect('/anggota/login');
  }
});

// GET /anggota/register
router.get('/register', (req, res) => {
  res.render('public/anggota-register', { 
    title: 'Registrasi Akun Anggota',
    user: req.session
  });
});

// POST /anggota/register
router.post('/register', async (req, res) => {
  try {
    const { nim, email, password, confirmPassword } = req.body;
    
    // Validasi
    if (password !== confirmPassword) {
      req.flash('error_msg', '❌ Password tidak cocok!');
      return res.redirect('/anggota/register');
    }
    
    // Cek apakah NIM terdaftar di database anggota
    const anggota = await Anggota.findOne({ where: { nim } });
    
    if (!anggota) {
      req.flash('error_msg', '❌ NIM tidak terdaftar. Anda bukan anggota UKM Taekwondo.');
      return res.redirect('/anggota/register');
    }
    
    // Cek apakah email sudah digunakan
    if (anggota.email) {
      req.flash('error_msg', '❌ Anggota dengan NIM ini sudah memiliki akun. Silakan login.');
      return res.redirect('/anggota/login');
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Update data anggota dengan email & password
    await anggota.update({
      email,
      password: hashedPassword
    });
    
    req.flash('success_msg', '✅ Registrasi berhasil! Silakan login.');
    res.redirect('/anggota/login');
    
  } catch (err) {
    console.error('Register error:', err);
    req.flash('error_msg', '❌ Terjadi kesalahan server');
    res.redirect('/anggota/register');
  }
});

// GET /anggota/logout
router.get('/logout', (req, res) => {
  // Hapus sesi terlebih dahulu
  req.session.destroy((err) => {
    if (err) console.error('Logout error:', err);
    
    // Opsional: hapus cookie sesi di browser
    res.clearCookie('connect.sid');
    
    // Redirect langsung tanpa req.flash() untuk menghindari error
    res.redirect('/');
  });
});

module.exports = router;