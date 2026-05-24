const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Pendaftaran = sequelize.define('Pendaftaran', {
  id_pendaftaran: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nama: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  nim: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  jurusan: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  angkatan: {
    type: DataTypes.STRING(10),
    allowNull: false
  },
  sabuk: {
    type: DataTypes.STRING(30),
    defaultValue: 'Belum Ada'
  },
  no_hp: {
    type: DataTypes.STRING(15),
    allowNull: false
  },
  tanggal_daftar: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  status: {
    type: DataTypes.STRING(20),
    defaultValue: 'Pending'
  }
}, {
  tableName: 'Pendaftaran_anggota',
  timestamps: false
});

module.exports = Pendaftaran;