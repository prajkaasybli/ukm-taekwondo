const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
// const Kegiatan = require('./Kegiatan'); // Hapus require ini jika ada
// const Anggota = require('./Anggota');   // Hapus require ini jika ada

const PendaftaranKegiatan = sequelize.define('PendaftaranKegiatan', {
  id_pendaftaran_kegiatan: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  id_kegiatan: { type: DataTypes.INTEGER, allowNull: false },
  id_anggota: { type: DataTypes.INTEGER, allowNull: false },
  tanggal_daftar: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  status: { type: DataTypes.STRING(20), defaultValue: 'Terdaftar' }
}, {
  tableName: 'Pendaftaran_Kegiatan',
  timestamps: false
});


// ✅ JANGAN ADA RELASI DI SINI. PINDAHKAN SEMUA RELASI KE server.js

module.exports = PendaftaranKegiatan;