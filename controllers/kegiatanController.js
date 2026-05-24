const Kegiatan = require('../models/Kegiatan');
const Anggota = require('../models/Anggota');
const PendaftaranKegiatan = require('../models/PendaftaranKegiatan');
const fs = require('fs');
const path = require('path');

exports.getKegiatanPublic = async (req, res) => {
  try {
    const kegiatan = await Kegiatan.findAll({ order: [['tanggal', 'DESC']] });
    res.render('public/kegiatan', { title: 'Kegiatan', kegiatan });
  } catch (err) { res.status(500).send('Server Error'); }
};

exports.getKegiatanDetail = async (req, res) => {
  try {
    const kegiatan = await Kegiatan.findByPk(req.params.id);
    if (!kegiatan) return res.redirect('/kegiatan');
    
    let isAnggota = false, sudahDaftar = false;
    if (req.session.anggotaId) {
      isAnggota = true;
      const pendaftaran = await PendaftaranKegiatan.findOne({ where: { id_kegiatan: req.params.id, id_anggota: req.session.anggotaId } });
      sudahDaftar = !!pendaftaran;
    }
    res.render('public/kegiatan-detail', { title: kegiatan.nama_kegiatan, kegiatan, isAnggota, sudahDaftar });
  } catch (err) { res.status(500).send('Server Error'); }
};

exports.daftarKegiatan = async (req, res) => {
  try {
    const kegiatan = await Kegiatan.findByPk(req.params.id);
    if (!kegiatan || !kegiatan.ada_pendaftaran) return res.redirect('/kegiatan');
    if (!req.session.anggotaId) return res.redirect('/anggota/login');
    
    const sudahDaftar = await PendaftaranKegiatan.findOne({ where: { id_kegiatan: req.params.id, id_anggota: req.session.anggotaId } });
    if (sudahDaftar) return res.redirect(`/kegiatan/detail/${req.params.id}`);
    
    await PendaftaranKegiatan.create({ id_kegiatan: req.params.id, id_anggota: req.session.anggotaId });
    req.flash('success_msg', '✅ Berhasil mendaftar kegiatan!');
    res.redirect(`/kegiatan/detail/${req.params.id}`);
  } catch (err) {
    req.flash('error_msg', '❌ Gagal mendaftar');
    res.redirect(`/kegiatan/detail/${req.params.id}`);
  }
};

exports.getKegiatanAdmin = async (req, res) => {
  try {
    const kegiatan = await Kegiatan.findAll({ order: [['tanggal', 'DESC']] });
    res.render('admin/kegiatan/index', { title: 'Kelola Kegiatan', kegiatan, user: req.session });
  } catch (err) { res.status(500).send('Server Error'); }
};

exports.showAddForm = (req, res) => {
  res.render('admin/kegiatan/tambah', { title: 'Tambah Kegiatan', user: req.session });
};

exports.addKegiatan = async (req, res) => {
    try {
      console.log('📥 Request Body:', req.body);
      console.log('📁 Request Files:', req.files);
      
      const { nama_kegiatan, jenis, tanggal, lokasi, deskripsi, ada_pendaftaran, link_pendaftaran } = req.body;
      const data = { 
        nama_kegiatan, 
        jenis, 
        tanggal, 
        lokasi, 
        deskripsi, 
        ada_pendaftaran: ada_pendaftaran ? 1 : 0, 
        link_pendaftaran 
      };
      
      if (req.files) {
        if (req.files.foto) {
          data.foto = req.files.foto[0].filename;
          console.log('📸 Foto uploaded:', req.files.foto[0].filename);
        }
        if (req.files.file_penjelasan) {
          data.file_penjelasan = req.files.file_penjelasan[0].filename;
          console.log('📄 File uploaded:', req.files.file_penjelasan[0].filename);
        }
      }
      
      console.log('💾 Data yang akan disimpan:', data);
      
      const result = await Kegiatan.create(data);
      console.log('✅ Hasil insert:', result);
      
      req.flash('success_msg', '✅ Kegiatan berhasil ditambahkan!');
      res.redirect('/kegiatan/admin');
    } catch (err) {
      console.error('❌ Error addKegiatan:', err);
      req.flash('error_msg', '❌ Gagal menambah kegiatan');
      res.redirect('/kegiatan/admin/tambah');
    }
  };

exports.showEditForm = async (req, res) => {
  try {
    const kegiatan = await Kegiatan.findByPk(req.params.id);
    if (!kegiatan) return res.redirect('/kegiatan/admin');
    res.render('admin/kegiatan/edit', { title: 'Edit Kegiatan', kegiatan, user: req.session });
  } catch (err) { res.status(500).send('Server Error'); }
};

exports.updateKegiatan = async (req, res) => {
  try {
    const kegiatan = await Kegiatan.findByPk(req.params.id);
    if (!kegiatan) return res.redirect('/kegiatan/admin');
    const { nama_kegiatan, jenis, tanggal, lokasi, deskripsi, ada_pendaftaran, link_pendaftaran } = req.body;
    const updateData = { nama_kegiatan, jenis, tanggal, lokasi, deskripsi, ada_pendaftaran: ada_pendaftaran ? 1 : 0, link_pendaftaran };
    if (req.files) {
      if (req.files.foto) {
        if (kegiatan.foto) fs.unlinkSync(path.join(__dirname, '../public/uploads/kegiatan/foto', kegiatan.foto));
        updateData.foto = req.files.foto[0].filename;
      }
      if (req.files.file_penjelasan) {
        if (kegiatan.file_penjelasan) fs.unlinkSync(path.join(__dirname, '../public/uploads/kegiatan/file', kegiatan.file_penjelasan));
        updateData.file_penjelasan = req.files.file_penjelasan[0].filename;
      }
    }
    await kegiatan.update(updateData);
    req.flash('success_msg', '✅ Kegiatan berhasil diupdate!');
    res.redirect('/kegiatan/admin');
  } catch (err) {
    req.flash('error_msg', '❌ Gagal update kegiatan');
    res.redirect(`/kegiatan/admin/edit/${req.params.id}`);
  }
};

exports.deleteKegiatan = async (req, res) => {
  try {
    const kegiatan = await Kegiatan.findByPk(req.params.id);
    if (!kegiatan) return res.redirect('/kegiatan/admin');
    if (kegiatan.foto) fs.unlinkSync(path.join(__dirname, '../public/uploads/kegiatan/foto', kegiatan.foto));
    if (kegiatan.file_penjelasan) fs.unlinkSync(path.join(__dirname, '../public/uploads/kegiatan/file', kegiatan.file_penjelasan));
    await kegiatan.destroy();
    req.flash('success_msg', '✅ Kegiatan berhasil dihapus!');
    res.redirect('/kegiatan/admin');
  } catch (err) {
    req.flash('error_msg', '❌ Gagal menghapus kegiatan');
    res.redirect('/kegiatan/admin');
  }
};

// Admin: GET /kegiatan/admin/pendaftaran/:id
exports.getPendaftaranKegiatan = async (req, res) => {
    try {
      const pendaftar = await PendaftaranKegiatan.findAll({
        where: { id_kegiatan: req.params.id },
        include: [
          { 
            model: Anggota, 
            as: 'anggotaDataPendaftar', // ✅ Pastikan alias ini sama dengan di server.js
            attributes: ['nama', 'nim', 'jurusan', 'angkatan', 'no_hp'] 
          }
        ], // ✅ PENTING: KOMA DI SINI SETELAH TUTUP ARRAY include
        order: [['tanggal_daftar', 'DESC']]
      });
  
      const kegiatan = await Kegiatan.findByPk(req.params.id);
  
      res.render('admin/kegiatan/pendaftaran', {
        title: `Pendaftaran - ${kegiatan.nama_kejuaraan || kegiatan.nama_kegiatan}`,
        pendaftar,
        kegiatan,
        user: req.session
      });
    } catch (err) {
      console.error('Get pendaftaran error:', err);
      res.status(500).send('Server Error');
    }
  };