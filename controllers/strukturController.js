const StrukturOrganisasi = require('../models/StrukturOrganisasi');
const Anggota = require('../models/Anggota');
const fs = require('fs');
const path = require('path');

// Public View
exports.getStrukturPublic = async (req, res) => {
  try {
    const pengurus = await StrukturOrganisasi.findAll({
      include: [{ 
        model: Anggota, 
        as: 'anggotaStruktur', // ✅ GANTI DARI 'anggota' KE 'anggotaStruktur'
        attributes: ['id_anggota', 'nama', 'nim', 'jurusan', 'angkatan', 'sabuk'] 
      }],
      order: [['periode', 'DESC'], ['jabatan', 'ASC']]
    });
    res.render('public/struktur', { title: 'Struktur Organisasi', pengurus });
  } catch (err) {
    console.error('❌ Error getStrukturPublic:', err);
    res.status(500).send('Server Error');
  }
};

// Admin Views & CRUD
exports.getStrukturAdmin = async (req, res) => {
  try {
    const pengurus = await StrukturOrganisasi.findAll({
      include: [{ 
        model: Anggota, 
        as: 'anggotaStruktur', // ✅ GANTI DARI 'anggota' KE 'anggotaStruktur'
        attributes: ['nama', 'nim'] 
      }]
    });
    res.render('admin/struktur/index', { title: 'Kelola Pengurus', pengurus, user: req.session });
  } catch (err) { 
    console.error('❌ Error getStrukturAdmin:', err);
    res.status(500).send('Server Error'); 
  }
};

exports.showAddForm = async (req, res) => {
  const anggota = await Anggota.findAll({ 
    where: { status: 'Aktif' }, 
    order: [['nama', 'ASC']] 
  });
  res.render('admin/struktur/tambah', { title: 'Tambah Pengurus', anggota, user: req.session });
};

exports.addStruktur = async (req, res) => {
  try {
    const { id_anggota, jabatan, periode } = req.body;
    const foto = req.file ? req.file.filename : 'default.png';
    
    await StrukturOrganisasi.create({ id_anggota, jabatan, periode, foto });
    req.flash('success_msg', '✅ Pengurus berhasil ditambahkan!');
    res.redirect('/struktur/admin');
  } catch (err) {
    console.error('❌ Error addStruktur:', err);
    req.flash('error_msg', '❌ Gagal menambah data');
    res.redirect('back');
  }
};

exports.showEditForm = async (req, res) => {
  try {
    const [pengurus, anggota] = await Promise.all([
      StrukturOrganisasi.findByPk(req.params.id),
      Anggota.findAll({ where: { status: 'Aktif' }, order: [['nama', 'ASC']] })
    ]);
    if (!pengurus) return res.redirect('/struktur/admin');
    res.render('admin/struktur/edit', { title: 'Edit Pengurus', pengurus, anggota, user: req.session });
  } catch (err) { 
    console.error('❌ Error showEditForm:', err);
    res.status(500).send('Server Error'); 
  }
};

exports.updateStruktur = async (req, res) => {
  try {
    const pengurus = await StrukturOrganisasi.findByPk(req.params.id);
    if (!pengurus) return res.redirect('/struktur/admin');

    const { id_anggota, jabatan, periode } = req.body;
    const updateData = { id_anggota, jabatan, periode };

    // Handle upload foto baru & hapus foto lama
    if (req.file) {
      const oldFotoPath = path.join(__dirname, '../public/uploads/struktur', pengurus.foto);
      if (pengurus.foto !== 'default.png' && fs.existsSync(oldFotoPath)) {
        fs.unlinkSync(oldFotoPath);
      }
      updateData.foto = req.file.filename;
    }

    await pengurus.update(updateData);
    req.flash('success_msg', '✅ Data pengurus berhasil diupdate!');
    res.redirect('/struktur/admin');
  } catch (err) {
    console.error('❌ Error updateStruktur:', err);
    req.flash('error_msg', '❌ Gagal update data');
    res.redirect('back');
  }
};

exports.deleteStruktur = async (req, res) => {
  try {
    const pengurus = await StrukturOrganisasi.findByPk(req.params.id);
    if (!pengurus) return res.redirect('/struktur/admin');

    if (pengurus.foto !== 'default.png') {
      const fotoPath = path.join(__dirname, '../public/uploads/struktur', pengurus.foto);
      if (fs.existsSync(fotoPath)) {
        fs.unlinkSync(fotoPath);
      }
    }
    await pengurus.destroy();
    req.flash('success_msg', '✅ Pengurus berhasil dihapus!');
    res.redirect('/struktur/admin');
  } catch (err) {
    console.error('❌ Error deleteStruktur:', err);
    req.flash('error_msg', '❌ Gagal menghapus data');
    res.redirect('back');
  }
};