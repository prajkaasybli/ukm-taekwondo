const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development', // ✅ Enable log saat dev
    pool: {
      max: 10,        // ✅ Naikkan ke 10 untuk antisipasi banyak query paralel
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    dialectOptions: {
      connectTimeout: 60000 // ✅ Tambah timeout koneksi 60 detik
    }
  }
);

// ❌ HAPUS/KOMENTARI BARIS INI (tidak perlu dipanggil di level modul):
// sequelize.authenticate()...

// ✅ Fungsi test koneksi opsional (panggil manual jika perlu)
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');
    return true;
  } catch (err) {
    console.error('❌ Unable to connect to database:', err);
    return false;
  }
};

module.exports = sequelize;
// module.exports = { sequelize, testConnection }; // Jika butuh test manual