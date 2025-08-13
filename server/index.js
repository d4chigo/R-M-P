require("dotenv").config();
const express = require("express");
const cors = require("cors");

// Importar rutas
const authRoutes = require("./routes/auth.route");
const vehiculoRoutes = require("./routes/vehiculo.route");
const carretaRoutes = require("./routes/carreta.route");
const rutaRoutes = require("./routes/ruta.route");
const tipoClienteRoutes = require("./routes/tipo_cliente.route");
const zonaRoutes = require("./routes/zona.route");
const clienteRoutes = require("./routes/cliente.route");
const usuarioRoutes = require("./routes/usuario.route");
const viajeRoutes = require("./routes/viaje.route");
const visitaRoutes = require("./routes/visita.route");

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Importar middleware de autenticación
const { authenticateToken } = require("./middleware/auth.middleware");

// Ruta de salud del servidor
app.get("/", (req, res) => {
  res.json({
    message: "🚛 Servidor R-M-P funcionando correctamente",
    status: "OK",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});

// Endpoint de prueba para verificar conectividad con la base de datos
app.get("/api/test", async (req, res) => {
  try {
    console.log("🔍 Probando conectividad con la base de datos...");
    const db = require("./config/db");

    // Probar conexión básica
    await db.query("SELECT 1 as test");

    // Probar que las tablas existen
    const [tables] = await db.query("SHOW TABLES");

    // Contar registros en cada tabla
    const tableCounts = {};
    for (const table of tables) {
      const tableName = Object.values(table)[0];
      try {
        const [count] = await db.query(
          `SELECT COUNT(*) as count FROM ${tableName}`,
        );
        tableCounts[tableName] = count[0].count;
      } catch (err) {
        tableCounts[tableName] = `Error: ${err.message}`;
      }
    }

    console.log("✅ Conectividad con BD exitosa");
    res.json({
      success: true,
      message: "Conectividad con base de datos exitosa",
      database: process.env.DB_NAME || "rmp_db",
      host: process.env.DB_HOST || "mysql",
      tables: tables.map((t) => Object.values(t)[0]),
      tableCounts,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Error de conectividad con BD:", error);
    res.status(500).json({
      success: false,
      message: "Error de conectividad con base de datos",
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// Registrar rutas públicas
app.use("/api/auth", authRoutes);

// Registrar rutas protegidas (requieren autenticación)
app.use("/api/vehiculos", authenticateToken, vehiculoRoutes);
app.use("/api/carretas", authenticateToken, carretaRoutes);
app.use("/api/rutas", authenticateToken, rutaRoutes);
app.use("/api/tipos-cliente", authenticateToken, tipoClienteRoutes);
app.use("/api/zonas", authenticateToken, zonaRoutes);
app.use("/api/clientes", authenticateToken, clienteRoutes);
app.use("/api/usuarios", authenticateToken, usuarioRoutes);
app.use("/api/viajes", authenticateToken, viajeRoutes);
app.use("/api/visitas", authenticateToken, visitaRoutes);

// Ruta para manejar rutas no encontradas
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Ruta no encontrada",
    availableRoutes: [
      "GET /",
      "POST /api/auth/login",
      "POST /api/auth/logout",
      "GET /api/auth/me",
      "GET /api/vehiculos (Auth required)",
      "GET /api/vehiculos/:id (Auth required)",
      "GET /api/carretas (Auth required)",
      "GET /api/rutas (Auth required)",
      "GET /api/tipos-cliente (Auth required)",
      "GET /api/zonas (Auth required)",
      "GET /api/clientes (Auth required)",
      "GET /api/usuarios (Auth required)",
      "GET /api/viajes (Auth required)",
      "GET /api/visitas (Auth required)",
    ],
  });
});

// Manejo global de errores
app.use((error, req, res, next) => {
  console.error("❌ Error:", error);
  res.status(500).json({
    success: false,
    message: "Error interno del servidor",
    error:
      process.env.NODE_ENV === "development" ? error.message : "Error interno",
  });
});

// Iniciar servidor
async function startServer() {
  try {
    app.listen(PORT, "0.0.0.0", () => {
      console.log("\n🚀 ===================================");
      console.log(`🚛 Servidor R-M-P iniciado exitosamente`);
      console.log(`📡 Puerto: ${PORT}`);
      console.log(`🌐 URL: http://localhost:${PORT}`);
      console.log(`💾 Base de datos: ${process.env.DB_NAME || "rmp_db"}`);
      console.log(`🕒 Timestamp: ${new Date().toISOString()}`);
      console.log("🚀 ===================================\n");

      console.log("📋 Rutas disponibles:");
      console.log("   GET  / - Estado del servidor");
      console.log("   POST /api/auth/login - Iniciar sesión");
      console.log("   POST /api/auth/logout - Cerrar sesión");
      console.log("   GET  /api/auth/me - Usuario actual");
      console.log("   GET  /api/vehiculos - Lista de vehículos (Auth)");
      console.log("   GET  /api/carretas - Lista de carretas (Auth)");
      console.log("   GET  /api/rutas - Lista de rutas (Auth)");
      console.log("   GET  /api/tipos-cliente - Tipos de cliente (Auth)");
      console.log("   GET  /api/zonas - Zonas (Auth)");
      console.log("   GET  /api/clientes - Lista de clientes (Auth)");
      console.log("   GET  /api/usuarios - Lista de usuarios (Auth)");
      console.log("   GET  /api/viajes - Lista de viajes (Auth)");
      console.log("   GET  /api/visitas - Lista de visitas (Auth)");
      console.log("");
    });
  } catch (error) {
    console.error("❌ Error al iniciar el servidor:", error);
    process.exit(1);
  }
}

// Manejar cierre graceful
process.on("SIGINT", async () => {
  console.log("\n⏹️  Cerrando servidor...");
  const pool = require("./config/db"); // Importar el pool para cerrar la conexión
  await pool.end();
  console.log("✅ Conexión a BD cerrada");
  process.exit(0);
});

// Iniciar la aplicación
startServer();
