const Pendaftaran = require('../models/Pendaftaran');
const Anggota = require('../models/Anggota');

// Public: GET /daftar/form
exports.getFormPendaftaran = (req, res) => {
  res.render('public/daftar', { title: 'Pendaftaran Anggota Baru' });
};

// Public: POST /daftar/submit
exports.submitPendaftaran = async (req, res) => {
  try {
    const { nama, nim, jurusan, angkatan, sabuk, no_hp } = req.body;
    await Pendaftaran.create({
      nama, nim, jurusan, angkatan, sabuk, no_hp,
      tanggal_daftar: new Date().toISOString().split('T')[0]
    });
    req.flash('success_msg', '✅ Pendaftaran berhasil! Tunggu verifikasi admin.');
    res.redirect('/');
  } catch (err) {
    console.error('Submit pendaftaran error:', err);
    req.flash('error_msg', '❌ NIM sudah terdaftar atau gagal mengirim data');
    res.redirect('back');
  }
};

// Admin: GET /daftar/admin
exports.getPendaftaranAdmin = async (req, res) => {
  try {
    const filter = req.query.filter || 'Pending';
    const where = filter === 'all' ? {} : { status: filter };
    const pendaftaran = await Pendaftaran.findAll({
      where,
      order: [['tanggal_daftar', 'DESC']]
    });
    res.render('admin/pendaftaran/index', {
      title: 'Verifikasi Pendaftaran',
      pendaftaran,
      filter,
      user: req.session
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

// Admin: GET /daftar/admin/verify/:id/:action ✅
exports.verifyPendaftaran = async (req, res) => {
  try {
    const { id, action } = req.params;
    const pendaftar = await Pendaftaran.findByPk(id);
    
    if (!pendaftar) {
      req.flash('error_msg', '❌ Pendaftar tidak ditemukan');
      return res.redirect('/daftar/admin'); // 🔑 FIX
    }

    if (action === 'approve') {
      // Pindahkan ke tabel Anggota
      await Anggota.create({
        nama: pendaftar.nama,
        nim: pendaftar.nim,
        jurusan: pendaftar.jurusan,
        angkatan: pendaftar.angkatan,
        sabuk: pendaftar.sabuk,
        status: 'Aktif'
      });
      await pendaftar.update({ status: 'Approved' });
      req.flash('success_msg', '✅ Pendaftar di-approve & masuk ke daftar anggota!');
    } else {
      await pendaftar.update({ status: 'Rejected' });
      req.flash('success_msg', '✅ Pendaftar di-reject');
    }
    res.redirect('/daftar/admin'); // 🔑 FIX
  } catch (err) {
    console.error('Verify pendaftaran error:', err);
    req.flash('error_msg', '❌ Gagal verifikasi');
    res.redirect('/daftar/admin');
  }
};