const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const JadwalLatihan = sequelize.define('JadwalLatihan', {
  id_jadwal: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  hari: {
    type: DataTypes.STRING(15),
    allowNull: false
  },
  waktu: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  lokasi: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  keterangan: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'Jadwal_latihan',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = JadwalLatihan;