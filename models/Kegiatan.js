const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Kegiatan = sequelize.define('Kegiatan', {
  id_kegiatan: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nama_kegiatan: {
    type: DataTypes.STRING(150),
    allowNull: false
  },
  jenis: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  tanggal: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  lokasi: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  deskripsi: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  // ✅ TAMBAHKAN KOLOM-KOLOM INI:
  foto: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  file_penjelasan: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  ada_pendaftaran: {
    type: DataTypes.TINYINT,
    defaultValue: 0
  },
  link_pendaftaran: {
    type: DataTypes.STRING(500),
    allowNull: true
  }
}, {
  tableName: 'Kegiatan',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Kegiatan;