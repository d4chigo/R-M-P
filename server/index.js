require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Importar rutas
const vehiculoRoutes = require('./routes/vehiculo.route');
const carretaRoutes = require('./routes/carreta.route');
const rutaRoutes = require('./routes/ruta.route');
const tipoClienteRoutes = require('./routes/tipo_cliente.route');
const zonaRoutes = require('./routes/zona.route');
const clienteRoutes = require('./routes/cliente.route');
const usuarioRoutes = require('./routes/usuario.route');
const viajeRoutes = require('./routes/viaje.route');
const visitaRoutes = require('./routes/visita.route');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Ruta de salud del servidor
app.get('/', (req, res) => {
  res.json({
    message: '🚛 Servidor R-M-P funcionando correctamente',
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Registrar rutas
app.use('/api/vehiculos', vehiculoRoutes);
app.use('/api/carretas', carretaRoutes);
app.use('/api/rutas', rutaRoutes);
app.use('/api/tipos-cliente', tipoClienteRoutes);
app.use('/api/zonas', zonaRoutes);
app.use('/api/clientes', clienteRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/viajes', viajeRoutes);
app.use('/api/visitas', visitaRoutes);

// Ruta para manejar rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada',
    availableRoutes: [
      'GET /',
      'GET /api/vehiculos',
      'GET /api/vehiculos/:id',
      'GET /api/carretas',
      'GET /api/rutas',
      'GET /api/tipos-cliente',
      'GET /api/zonas',
      'GET /api/clientes',
      'GET /api/usuarios',
      'GET /api/viajes',
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

// Iniciar servidor
async function startServer() {
  try {
    app.listen(PORT, '0.0.0.0', () => {
      console.log('\n🚀 ===================================');
      console.log(`🚛 Servidor R-M-P iniciado exitosamente`);
      console.log(`📡 Puerto: ${PORT}`);
      console.log(`🌐 URL: http://localhost:${PORT}`);
      console.log(`💾 Base de datos: ${process.env.DB_NAME || 'rmp_db'}`);
      console.log(`🕒 Timestamp: ${new Date().toISOString()}`);
      console.log('🚀 ===================================\n');
      
      console.log('📋 Rutas disponibles:');
      console.log('   GET  / - Estado del servidor');
      console.log('   GET  /api/vehiculos - Lista de vehículos');
      console.log('   GET  /api/carretas - Lista de carretas');
      console.log('   GET  /api/rutas - Lista de rutas');
      console.log('   GET  /api/tipos-cliente - Tipos de cliente');
      console.log('   GET  /api/zonas - Zonas');
      console.log('   GET  /api/clientes - Lista de clientes');
      console.log('   GET  /api/usuarios - Lista de usuarios');
      console.log('   GET  /api/viajes - Lista de viajes');
      console.log('   GET  /api/visitas - Lista de visitas');
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
  const pool = require('./config/db'); // Importar el pool para cerrar la conexión
  await pool.end();
  console.log('✅ Conexión a BD cerrada');
  process.exit(0);
});

// Iniciar la aplicación
startServer();