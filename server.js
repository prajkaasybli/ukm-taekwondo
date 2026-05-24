const app = require('./app');
const sequelize = require('./config/database');
require('dotenv').config();

// 1. Import Semua Model
const Anggota = require('./models/Anggota');
const Prestasi = require('./models/Prestasi');
const StrukturOrganisasi = require('./models/StrukturOrganisasi');
const PendaftaranKegiatan = require('./models/PendaftaranKegiatan'); // ✅ Tambahkan ini
const Kegiatan = require('./models/Kegiatan');
// 2. DEFINISIKAN RELASI DI SINI
// =========================================

// // ============================================
// RELASI MODEL (PASTIKAN ALIAS UNIK!)
// ============================================

// 1. StrukturOrganisasi ↔ Anggota
StrukturOrganisasi.belongsTo(Anggota, { foreignKey: 'id_anggota', as: 'anggotaStruktur' });
Anggota.hasOne(StrukturOrganisasi, { foreignKey: 'id_anggota', as: 'jabatan' }); // ✅ WAJIB ADA INI!

// 2. Prestasi ↔ Anggota (PAKAI ALIAS INI SAJA)
Prestasi.belongsTo(Anggota, { foreignKey: 'id_anggota', as: 'anggotaDataPrestasi' });

// 3. PendaftaranKegiatan ↔ Anggota
PendaftaranKegiatan.belongsTo(Anggota, { foreignKey: 'id_anggota', as: 'anggotaDataPendaftar' });

// 4. PendaftaranKegiatan ↔ Kegiatan
PendaftaranKegiatan.belongsTo(Kegiatan, { foreignKey: 'id_kegiatan', as: 'kegiatanDetail' });


// 3. Jalankan Server
const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // Sinkronisasi database (alter: true hanya untuk development)
    await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
    console.log('✅ Database synchronized successfully');

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();