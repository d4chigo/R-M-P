const mysql = require('mysql2/promise');

// Configuración de base de datos
const dbConfig = {
  host: process.env.DB_HOST || 'mysql',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'rmp_user',
  password: process.env.DB_PASSWORD || 'rmp_password123',
  database: process.env.DB_NAME || 'rmp_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
};

const pool = mysql.createPool(dbConfig);

// Verificar conexión
pool.getConnection()
  .then(connection => {
    console.log('✅ Conexión a la base de datos establecida');
    connection.release();
  })
  .catch(error => {
    console.error('❌ Error conectando a la base de datos:', error.message);
    console.error('Configuración actual:', {
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      database: dbConfig.database
    });
  });

module.exports = pool;