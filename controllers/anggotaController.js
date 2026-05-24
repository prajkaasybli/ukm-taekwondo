const Anggota = require('../models/Anggota');
const StrukturOrganisasi = require('../models/StrukturOrganisasi');
const fs = require('fs');
const path = require('path');

// ============================================
// PUBLIC ROUTES
// ============================================

// Public: GET /anggota
exports.getAnggotaPublic = async (req, res) => {
  try {
    const anggota = await Anggota.findAll({ 
      where: { status: 'Aktif' },
      include: [{
        model: StrukturOrganisasi,
        as: 'jabatan', 
        attributes: ['foto', 'jabatan', 'periode'],
        required: false 
      }],
      order: [['nama', 'ASC']]
    });
    
    // Pisahkan pengurus dan anggota biasa
    const pengurus = [];
    const anggotaBiasa = [];
    
    anggota.forEach(a => {
      const data = a.toJSON();
      const strukturData = data.jabatan;
      
      const anggotaData = {
        ...data,
        foto: strukturData ? strukturData.foto : (data.foto || 'default.png'),
        jabatan: strukturData ? strukturData.jabatan : null,
        periode: strukturData ? strukturData.periode : null
      };
      
      if (strukturData && strukturData.jabatan) {
        pengurus.push(anggotaData);
      } else {
        anggotaBiasa.push(anggotaData);
      }
    });
    
    res.render('public/anggota', { 
      title: 'Direktori Anggota', 
      pengurus,
      anggotaBiasa
    });
  } catch (err) {
    console.error('❌ Error getAnggotaPublic:', err);
    res.status(500).send('Server Error');
  }
};

// ============================================
// ADMIN ROUTES
// ============================================

// Admin: GET /anggota/admin
exports.getAnggotaAdmin = async (req, res) => {
  try {
    const anggota = await Anggota.findAll({ order: [['created_at', 'DESC']] });
    res.render('admin/anggota/index', { 
      title: 'Kelola Anggota', 
      anggota, 
      user: req.session 
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

// Admin: POST /anggota/admin/tambah
exports.addAnggota = async (req, res) => {
  try {
    const { nama, nim, jurusan, angkatan, sabuk, status } = req.body;
    const foto = req.file ? req.file.filename : 'default.png';
    
    await Anggota.create({
      nama, nim, jurusan, angkatan, sabuk, foto,
      status: status || 'Aktif'
    });
    
    req.flash('success_msg', '✅ Anggota berhasil ditambahkan!');
    res.redirect('/anggota/admin');
  } catch (err) {
    console.error('Add anggota error:', err);
    req.flash('error_msg', '❌ NIM sudah terdaftar atau data tidak valid');
    res.redirect('/anggota/admin/tambah');
  }
};

// Admin: POST /anggota/admin/edit/:id
exports.updateAnggota = async (req, res) => {
  try {
    const anggota = await Anggota.findByPk(req.params.id);
    if (!anggota) {
      req.flash('error_msg', '❌ Anggota tidak ditemukan');
      return res.redirect('/anggota/admin');
    }
    
    const { nama, nim, jurusan, angkatan, sabuk, status } = req.body;
    const updateData = { nama, nim, jurusan, angkatan, sabuk, status };
    
    if (req.file) {
      if (anggota.foto !== 'default.png') {
        const oldPhotoPath = path.join(__dirname, '../public/uploads/anggota', anggota.foto);
        if (fs.existsSync(oldPhotoPath)) fs.unlinkSync(oldPhotoPath);
      }
      updateData.foto = req.file.filename;
    }
    
    await anggota.update(updateData);
    req.flash('success_msg', '✅ Data anggota berhasil diupdate!');
    res.redirect('/anggota/admin');
  } catch (err) {
    console.error('Update anggota error:', err);
    req.flash('error_msg', '❌ Gagal update data');
    res.redirect(`/anggota/admin/edit/${req.params.id}`);
  }
};

// Admin: GET /anggota/admin/hapus/:id
exports.deleteAnggota = async (req, res) => {
  try {
    const anggota = await Anggota.findByPk(req.params.id);
    if (anggota) {
      if (anggota.foto !== 'default.png') {
        const photoPath = path.join(__dirname, '../public/uploads/anggota', anggota.foto);
        if (fs.existsSync(photoPath)) fs.unlinkSync(photoPath);
      }
      await anggota.destroy();
    }
    req.flash('success_msg', '✅ Anggota berhasil dihapus!');
    res.redirect('/anggota/admin');
  } catch (err) {
    console.error('Delete anggota error:', err);
    req.flash('error_msg', '❌ Gagal menghapus data');
    res.redirect('/anggota/admin');
  }
};