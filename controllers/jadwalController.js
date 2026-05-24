const JadwalLatihan = require('../models/JadwalLatihan');

// Public: GET /jadwal
exports.getJadwalPublic = async (req, res) => {
  try {
    const jadwal = await JadwalLatihan.findAll({ order: [['hari', 'ASC']] });
    res.render('public/jadwal', { title: 'Jadwal Latihan', jadwal });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
};

// Admin: GET /jadwal/admin
exports.getAllJadwal = async (req, res) => {
  try {
    const jadwal = await JadwalLatihan.findAll({ order: [['hari', 'ASC']] });
    res.render('admin/jadwal/index', { title: 'Kelola Jadwal', jadwal, user: req.session });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
};

// Admin: GET /jadwal/admin/tambah
exports.showAddForm = (req, res) => {
  res.render('admin/jadwal/tambah', { title: 'Tambah Jadwal', user: req.session });
};

// Admin: POST /jadwal/admin/tambah ✅
exports.addJadwal = async (req, res) => {
  try {
    await JadwalLatihan.create(req.body);
    req.flash('success_msg', '✅ Jadwal berhasil ditambahkan!');
    res.redirect('/jadwal/admin'); // 🔑 FIX
  } catch (error) {
    console.error('Add jadwal error:', error);
    req.flash('error_msg', '❌ Gagal menyimpan data');
    res.redirect('/jadwal/admin/tambah');
  }
};

// Admin: GET /jadwal/admin/edit/:id
exports.showEditForm = async (req, res) => {
  try {
    const jadwal = await JadwalLatihan.findByPk(req.params.id);
    if (!jadwal) {
      req.flash('error_msg', '❌ Jadwal tidak ditemukan');
      return res.redirect('/jadwal/admin');
    }
    res.render('admin/jadwal/edit', { title: 'Edit Jadwal', jadwal, user: req.session });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
};

// Admin: POST /jadwal/admin/edit/:id ✅
exports.updateJadwal = async (req, res) => {
  try {
    const jadwal = await JadwalLatihan.findByPk(req.params.id);
    if (!jadwal) {
      req.flash('error_msg', '❌ Jadwal tidak ditemukan');
      return res.redirect('/jadwal/admin');
    }
    await jadwal.update(req.body);
    req.flash('success_msg', '✅ Jadwal berhasil diperbarui!');
    res.redirect('/jadwal/admin'); // 🔑 FIX
  } catch (error) {
    console.error('Update jadwal error:', error);
    req.flash('error_msg', '❌ Gagal memperbarui data');
    res.redirect(`/jadwal/admin/edit/${req.params.id}`);
  }
};

// Admin: GET /jadwal/admin/hapus/:id ✅
exports.deleteJadwal = async (req, res) => {
  try {
    await JadwalLatihan.destroy({ where: { id_jadwal: req.params.id } });
    req.flash('success_msg', '✅ Jadwal berhasil dihapus!');
    res.redirect('/jadwal/admin'); // 🔑 FIX
  } catch (error) {
    console.error('Delete jadwal error:', error);
    req.flash('error_msg', '❌ Gagal menghapus data');
    res.redirect('/jadwal/admin');
  }
};