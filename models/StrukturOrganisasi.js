const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const StrukturOrganisasi = sequelize.define('StrukturOrganisasi', {
  id_struktur: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  id_anggota: { type: DataTypes.INTEGER, allowNull: true }, // Biarkan null jika belum ada
  jabatan: { type: DataTypes.STRING(100), allowNull: false },
  periode: { type: DataTypes.STRING(20), allowNull: false },
  foto: { type: DataTypes.STRING(255), defaultValue: 'default.png' }
}, {
  tableName: 'Struktur_Organisasi',
  timestamps: false
});

// ✅ HAPUS require('./Anggota') dan baris belongTo dari sini

module.exports = StrukturOrganisasi;