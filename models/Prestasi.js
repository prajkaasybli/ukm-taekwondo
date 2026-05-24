const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Anggota = require('./Anggota');

const Prestasi = sequelize.define('Prestasi', {
  id_prestasi: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  id_anggota: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  nama_kejuaraan: {
    type: DataTypes.STRING(150),
    allowNull: false
  },
  tingkat: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  juara: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  tahun: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  deskripsi: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  foto: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  // ✅ TAMBAHKAN FIELD STATUS (dengan koma di field sebelumnya)
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending',
    allowNull: false
  },
  submitted_by: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  tableName: 'Prestasi',
  timestamps: false, // Sesuaikan dengan struktur database kamu
  createdAt: false,
  updatedAt: false
});

// Relasi (Alias unik agar tidak bentrok)
//Prestasi.belongsTo(Anggota, { 
  //foreignKey: 'id_anggota', 
  //as: 'anggotaDataPrestasi' 
//});

module.exports = Prestasi;