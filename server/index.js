const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Configuración de base de datos
const dbConfig = {
  host: process.env.DB_HOST || 'mysql',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'rmp_user',
  password: process.env.DB_PASSWORD || 'REMOVED_SECRET',
  database: process.env.DB_NAME || 'rmp_db'
};

// Variable para la conexión de BD
let connection;

// Función para conectar a la base de datos
async function connectToDatabase() {
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Conexión exitosa a MySQL');
    
    // Probar la conexión
    const [rows] = await connection.execute('SELECT 1 + 1 AS result');
    console.log('✅ Test de conexión exitoso:', rows[0].result);
    
    return true;
  } catch (error) {
    console.error('❌ Error conectando a MySQL:', error.message);
    return false;
  }
}

// ==========================================
// RUTAS DE LA API
// ==========================================

// Ruta de salud del servidor
app.get('/', (req, res) => {
  res.json({
    message: '🚛 Servidor R-M-P funcionando correctamente',
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Ruta de estado de la base de datos
app.get('/api/health', async (req, res) => {
  try {
    if (!connection) {
      return res.status(503).json({
        status: 'ERROR',
        message: 'No hay conexión a la base de datos'
      });
    }
    
    const [rows] = await connection.execute('SELECT COUNT(*) as count FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ?', [dbConfig.database]);
    
    res.json({
      status: 'OK',
      message: 'Base de datos conectada',
      database: dbConfig.database,
      tablas: rows[0].count,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: error.message
    });
  }
});

// ==========================================
// RUTAS DE VEHÍCULOS
// ==========================================

// Obtener todos los vehículos
app.get('/api/vehiculos', async (req, res) => {
  try {
    const [rows] = await connection.execute('SELECT * FROM VEHICULO ORDER BY id DESC');
    res.json({
      success: true,
      data: rows,
      count: rows.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Obtener vehículo por ID
app.get('/api/vehiculos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await connection.execute('SELECT * FROM VEHICULO WHERE id = ?', [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Vehículo no encontrado'
      });
    }
    
    res.json({
      success: true,
      data: rows[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ==========================================
// RUTAS DE CLIENTES
// ==========================================

// Obtener todos los clientes
app.get('/api/clientes', async (req, res) => {
  try {
    const [rows] = await connection.execute(`
      SELECT c.*, tc.nombre as tipo_cliente_nombre 
      FROM CLIENTE c 
      LEFT JOIN TIPO_CLIENTE tc ON c.id_tipo_cliente = tc.id 
      ORDER BY c.id DESC
    `);
    res.json({
      success: true,
      data: rows,
      count: rows.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ==========================================
// RUTAS DE RUTAS
// ==========================================

// Obtener todas las rutas
app.get('/api/rutas', async (req, res) => {
  try {
    const [rows] = await connection.execute('SELECT * FROM RUTA ORDER BY id DESC');
    res.json({
      success: true,
      data: rows,
      count: rows.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ==========================================
// RUTAS DE VIAJES
// ==========================================

// Obtener todos los viajes con información relacionada
app.get('/api/viajes', async (req, res) => {
  try {
    const [rows] = await connection.execute(`
      SELECT 
        v.*,
        r.nombre as ruta_nombre,
        r.origen,
        r.destino,
        vh.placa as vehiculo_placa,
        vh.marca,
        vh.modelo
      FROM VIAJE v
      LEFT JOIN RUTA r ON v.id_ruta = r.id
      LEFT JOIN VEHICULO vh ON v.id_vehiculo = vh.id
      ORDER BY v.fecha DESC, v.id DESC
    `);
    res.json({
      success: true,
      data: rows,
      count: rows.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ==========================================
// RUTAS DE TIPOS DE CLIENTE
// ==========================================

// Obtener todos los tipos de cliente
app.get('/api/tipos-cliente', async (req, res) => {
  try {
    const [rows] = await connection.execute('SELECT * FROM TIPO_CLIENTE ORDER BY nombre');
    res.json({
      success: true,
      data: rows,
      count: rows.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ==========================================
// RUTAS DE CARRETAS
// ==========================================

// Obtener todas las carretas
app.get('/api/carretas', async (req, res) => {
  try {
    const [rows] = await connection.execute('SELECT * FROM CARRETA ORDER BY id DESC');
    res.json({
      success: true,
      data: rows,
      count: rows.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ==========================================
// RUTAS DE VISITAS
// ==========================================

// Obtener todas las visitas con información relacionada
app.get('/api/visitas', async (req, res) => {
  try {
    const [rows] = await connection.execute(`
      SELECT 
        vis.*,
        v.fecha as viaje_fecha,
        c.nombre as cliente_nombre,
        c.ciudad as cliente_ciudad,
        r.nombre as ruta_nombre
      FROM VISITA vis
      LEFT JOIN VIAJE v ON vis.id_viaje = v.id
      LEFT JOIN CLIENTE c ON vis.id_cliente = c.id
      LEFT JOIN RUTA r ON v.id_ruta = r.id
      ORDER BY v.fecha DESC, vis.llega ASC
    `);
    res.json({
      success: true,
      data: rows,
      count: rows.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ==========================================
// MANEJO DE ERRORES
// ==========================================

// Ruta para manejar rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada',
    availableRoutes: [
      'GET /',
      'GET /api/health',
      'GET /api/vehiculos',
      'GET /api/vehiculos/:id',
      'GET /api/clientes',
      'GET /api/rutas',
      'GET /api/viajes',
      'GET /api/tipos-cliente',
      'GET /api/carretas',
      'GET /api/visitas'
    ]
  });
});

// Manejo global de errores
app.use((error, req, res, next) => {
  console.error('❌ Error:', error);
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
  });
});

// ==========================================
// INICIAR SERVIDOR
// ==========================================

async function startServer() {
  try {
    // Conectar a la base de datos
    const dbConnected = await connectToDatabase();
    
    if (!dbConnected) {
      console.log('⚠️  Iniciando servidor sin conexión a BD (reintentará automáticamente)');
    }
    
    // Iniciar servidor
    app.listen(PORT, '0.0.0.0', () => {
      console.log('\n🚀 ===================================');
      console.log(`🚛 Servidor R-M-P iniciado exitosamente`);
      console.log(`📡 Puerto: ${PORT}`);
      console.log(`🌐 URL: http://localhost:${PORT}`);
      console.log(`💾 Base de datos: ${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`);
      console.log(`🕒 Timestamp: ${new Date().toISOString()}`);
      console.log('🚀 ===================================\n');
      
      console.log('📋 Rutas disponibles:');
      console.log('   GET  / - Estado del servidor');
      console.log('   GET  /api/health - Estado de la BD');
      console.log('   GET  /api/vehiculos - Lista de vehículos');
      console.log('   GET  /api/clientes - Lista de clientes');
      console.log('   GET  /api/rutas - Lista de rutas');
      console.log('   GET  /api/viajes - Lista de viajes');
      console.log('   GET  /api/visitas - Lista de visitas');
      console.log('   GET  /api/carretas - Lista de carretas');
      console.log('   GET  /api/tipos-cliente - Tipos de cliente');
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
}

// Manejar cierre graceful
process.on('SIGINT', async () => {
  console.log('\n⏹️  Cerrando servidor...');
  if (connection) {
    await connection.end();
    console.log('✅ Conexión a BD cerrada');
  }
  process.exit(0);
});

// Iniciar la aplicación
startServer();
