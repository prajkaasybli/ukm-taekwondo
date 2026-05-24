const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Anggota = sequelize.define('Anggota', {
  id_anggota: {
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
    allowNull: false,
    unique: true
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
    defaultValue: 'Putih'
  },
  foto: {
    type: DataTypes.STRING(255),
    defaultValue: 'default.png'
  },
  no_hp: {
    type: DataTypes.STRING(15),
    allowNull: true
  },
  status: {
    type: DataTypes.STRING(20),
    defaultValue: 'Aktif'
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: true,
    unique: true
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: true
  }
}, {
  tableName: 'Anggota',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Anggota;