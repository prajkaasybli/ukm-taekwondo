// ============================================
// MIDDLEWARE AUTHENTICATION
// ============================================

// ✅ Middleware untuk Admin
exports.checkAuth = (req, res, next) => {
  if (req.session && req.session.adminLoggedIn) {
    return next();
  }
  req.flash('error_msg', 'Silakan login untuk mengakses halaman ini');
  return res.redirect('/admin/login'); // ✅ TAMBAHKAN return
};

// ✅ Middleware untuk Admin (jika sudah login, redirect ke dashboard)
exports.checkNotAuth = (req, res, next) => {
  if (req.session && !req.session.adminLoggedIn) {
    return next();
  }
  return res.redirect('/admin/dashboard'); // ✅ TAMBAHKAN return
};

// ✅ Middleware untuk Anggota/Member
exports.checkMemberAuth = (req, res, next) => {
  if (req.session && req.session.isLoggedIn) {
    return next();
  }
  req.flash('error_msg', 'Silakan login sebagai anggota untuk mengakses halaman ini');
  return res.redirect('/anggota/login'); // ✅ TAMBAHKAN return
};

// ✅ Middleware untuk Anggota (jika sudah login, redirect)
exports.checkNotMemberAuth = (req, res, next) => {
  if (req.session && !req.session.isLoggedIn) {
    return next();
  }
  return res.redirect('/prestasi/my-submissions'); // ✅ TAMBAHKAN return
};