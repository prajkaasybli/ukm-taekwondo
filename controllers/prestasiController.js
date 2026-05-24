const Prestasi = require('../models/Prestasi');
const Anggota = require('../models/Anggota');
const fs = require('fs');
const path = require('path');

// ============================================
// PUBLIC ROUTES
// ============================================
exports.getPrestasiPublic = async (req, res) => {
  try {
    const prestasi = await Prestasi.findAll({ 
      where: { status: 'approved' },
      include: [{ model: Anggota, as: 'anggotaDataPrestasi', attributes: ['nama', 'sabuk', 'angkatan'] }],
      order: [['tahun', 'DESC'], ['id_prestasi', 'DESC']]
    });
    const prestasiByYear = {};
    prestasi.forEach(p => {
      const data = p.toJSON();
      const tahun = data.tahun;
      if (!prestasiByYear[tahun]) prestasiByYear[tahun] = [];
      prestasiByYear[tahun].push(data);
    });
    res.render('public/prestasi', { title: 'Prestasi', prestasiByYear, totalPrestasi: prestasi.length });
  } catch (err) {
    console.error('❌ Error getPrestasiPublic:', err);
    res.status(500).send('Server Error');
  }
};

// ============================================
// ADMIN ROUTES
// ============================================
exports.getPrestasiAdmin = async (req, res) => {
  try {
    const [prestasi, pendingCount] = await Promise.all([
      Prestasi.findAll({ 
        order: [['tahun', 'DESC']],
        include: [{ 
          model: Anggota, 
          as: 'anggotaDataPrestasi', 
          attributes: ['nama', 'nim'] 
        }]
      }),
      Prestasi.count({ where: { status: 'pending' } })
    ]);
    
    res.render('admin/prestasi/index', { 
      title: 'Kelola Prestasi', 
      prestasi, 
      pendingCount,
      user: req.session 
    });
  } catch (err) { 
    console.error('❌ Error getPrestasiAdmin:', err); 
    res.status(500).send('Server Error'); 
  }
};

exports.showAddForm = async (req, res) => {
  try {
    const anggotaList = await Anggota.findAll({
      where: { status: 'Aktif' },
      attributes: ['id_anggota', 'nama', 'nim', 'jurusan', 'angkatan'],
      order: [['nama', 'ASC']]
    });
    
    res.render('admin/prestasi/tambah', { 
      title: 'Tambah Prestasi', 
      user: req.session,
      anggotaList
    });
  } catch (err) {
    console.error('❌ Error showAddForm:', err);
    res.status(500).send('Server Error');
  }
};

exports.addPrestasi = async (req, res) => {
  try {
    const { nama_kejuaraan, tingkat, tahun, juara, deskripsi, id_anggota } = req.body;
    const data = { 
      nama_kejuaraan, 
      tingkat, 
      tahun, 
      juara, 
      deskripsi, 
      id_anggota: id_anggota || null, 
      status: 'approved'
    };
    if (req.file) data.foto = req.file.filename;
    await Prestasi.create(data);
    req.flash('success_msg', '✅ Prestasi berhasil ditambahkan!');
    res.redirect('/prestasi/admin');
  } catch (err) {
    console.error('Add prestasi error:', err);
    req.flash('error_msg', '❌ Gagal menambah prestasi');
    res.redirect('/prestasi/admin/tambah');
  }
};

exports.showEditForm = async (req, res) => {
  try {
    const [prestasi, anggotaList] = await Promise.all([
      Prestasi.findByPk(req.params.id),
      Anggota.findAll({
        where: { status: 'Aktif' },
        attributes: ['id_anggota', 'nama', 'nim', 'jurusan', 'angkatan'],
        order: [['nama', 'ASC']]
      })
    ]);
    
    if (!prestasi) { 
      req.flash('error_msg', '❌ Prestasi tidak ditemukan'); 
      return res.redirect('/prestasi/admin'); 
    }
    
    res.render('admin/prestasi/edit', { 
      title: 'Edit Prestasi', 
      prestasi, 
      user: req.session,
      anggotaList
    });
  } catch (err) { 
    console.error('❌ Error showEditForm:', err); 
    res.status(500).send('Server Error'); 
  }
};

exports.updatePrestasi = async (req, res) => {
  try {
    const prestasi = await Prestasi.findByPk(req.params.id);
    if (!prestasi) return res.redirect('/prestasi/admin');
    const { nama_kejuaraan, tingkat, tahun, juara, deskripsi, id_anggota } = req.body;
    const updateData = { nama_kejuaraan, tingkat, tahun, juara, deskripsi };
    if (id_anggota) updateData.id_anggota = id_anggota;
    if (req.file) {
      if (prestasi.foto && fs.existsSync(path.join(__dirname, '../public/uploads/prestasi', prestasi.foto))) {
        fs.unlinkSync(path.join(__dirname, '../public/uploads/prestasi', prestasi.foto));
      }
      updateData.foto = req.file.filename;
    }
    await prestasi.update(updateData);
    req.flash('success_msg', '✅ Prestasi berhasil diupdate!');
    res.redirect('/prestasi/admin');
  } catch (err) {
    console.error('Update prestasi error:', err);
    req.flash('error_msg', '❌ Gagal update prestasi');
    res.redirect(`/prestasi/admin/edit/${req.params.id}`);
  }
};

exports.deletePrestasi = async (req, res) => {
  try {
    const prestasi = await Prestasi.findByPk(req.params.id);
    if (!prestasi) return res.redirect('/prestasi/admin');
    if (prestasi.foto && fs.existsSync(path.join(__dirname, '../public/uploads/prestasi', prestasi.foto))) {
      fs.unlinkSync(path.join(__dirname, '../public/uploads/prestasi', prestasi.foto));
    }
    await prestasi.destroy();
    req.flash('success_msg', '✅ Prestasi berhasil dihapus!');
    res.redirect('/prestasi/admin');
  } catch (err) { console.error('Delete prestasi error:', err); res.redirect('/prestasi/admin'); }
};

// ============================================
// MEMBER ROUTES
// ============================================
exports.showMemberSubmitForm = (req, res) => {
  res.render('member/prestasi/submit', { title: 'Submit Prestasi', user: req.session });
};

exports.submitPrestasiMember = async (req, res) => {
  try {
    const { nama_kejuaraan, tingkat, tahun, juara, deskripsi } = req.body;
    const data = { 
      nama_kejuaraan, 
      tingkat, 
      tahun, 
      juara, 
      deskripsi, 
      id_anggota: req.session.anggotaId, 
      submitted_by: req.session.anggotaId, 
      status: 'pending' 
    };
    if (req.file) data.foto = req.file.filename;
    await Prestasi.create(data);
    req.flash('success_msg', '✅ Prestasi berhasil disubmit! Menunggu persetujuan admin.');
    res.redirect('/prestasi/my-submissions');
  } catch (err) {
    console.error('Submit prestasi error:', err);
    req.flash('error_msg', '❌ Gagal submit prestasi');
    res.redirect('/prestasi/submit');
  }
};

exports.getMySubmissions = async (req, res) => {
  try {
    const submissions = await Prestasi.findAll({ 
      where: { submitted_by: req.session.anggotaId }, 
      order: [['id_prestasi', 'DESC']] 
    });
    res.render('member/prestasi/my-submissions', { 
      title: 'Riwayat Submit Prestasi', 
      submissions, 
      user: req.session 
    });
  } catch (err) { 
    console.error('getMySubmissions error:', err); 
    res.status(500).send('Server Error'); 
  }
};

// ============================================
// ADMIN APPROVAL ROUTES
// ============================================
exports.getPendingPrestasi = async (req, res) => {
  try {
    const pending = await Prestasi.findAll({
      where: { status: 'pending' },
      include: [{ model: Anggota, as: 'anggotaDataPrestasi', attributes: ['nama', 'nim'] }],
      order: [['id_prestasi', 'DESC']]
    });
    res.render('admin/prestasi/pending', { 
      title: 'Prestasi Menunggu Persetujuan', 
      pending, 
      user: req.session 
    });
  } catch (err) { 
    console.error('getPendingPrestasi error:', err); 
    res.status(500).send('Server Error'); 
  }
};

exports.approvePrestasi = async (req, res) => {
  try {
    await Prestasi.update({ status: 'approved' }, { where: { id_prestasi: req.params.id } });
    req.flash('success_msg', '✅ Prestasi disetujui & sekarang tampil di publik!');
    res.redirect('/prestasi/admin/pending');
  } catch (err) { 
    console.error('approvePrestasi error:', err); 
    req.flash('error_msg', '❌ Gagal menyetujui prestasi'); 
    res.redirect('/prestasi/admin/pending'); 
  }
};

exports.rejectPrestasi = async (req, res) => {
  try {
    await Prestasi.update({ status: 'rejected' }, { where: { id_prestasi: req.params.id } });
    req.flash('success_msg', '❌ Prestasi ditolak');
    res.redirect('/prestasi/admin/pending');
  } catch (err) { 
    console.error('rejectPrestasi error:', err); 
    req.flash('error_msg', '❌ Gagal menolak prestasi'); 
    res.redirect('/prestasi/admin/pending'); 
  }
};