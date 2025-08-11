const mysql = require('mysql2/promise');

// Configuración de base de datos
const dbConfig = {
  host: process.env.DB_HOST || 'mysql',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'rmp_user',
  password: process.env.DB_PASSWORD || 'rmp_password123',
  database: process.env.DB_NAME || 'rmp_db'
};

const pool = mysql.createPool(dbConfig);

module.exports = pool;