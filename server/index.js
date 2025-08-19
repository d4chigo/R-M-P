require("dotenv").config();
// DEBUG SMTP ENV
console.log('DEBUG SMTP ENV:');
console.log('SMTP_USER:', process.env.SMTP_USER);
console.log('SMTP_PASS:', process.env.SMTP_PASS ? '***' : undefined);
console.log('SMTP_HOST:', process.env.SMTP_HOST);
console.log('SMTP_PORT:', process.env.SMTP_PORT);
const express = require("express");
const cors = require("cors");

// Importar rutas actualizadas
const authRoutes = require("./routes/auth.route");
const adminRoutes = require("./routes/admin.route");
const vehiculoRoutes = require("./routes/vehiculo.route");
const zonaRoutes = require("./routes/zona.route");
const clienteRoutes = require("./routes/cliente.route");
const repartidorRoutes = require("./routes/repartidor.route");
const viajeRoutes = require("./routes/viaje.route");
const visitaRoutes = require("./routes/visita.route");
const usuarioRoutes = require("./routes/usuario.route");
const reportesRoutes = require("./routes/reportes.route");

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(
  cors({
    origin: ["http://127.0.0.1:3000", "http://localhost:3000"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(express.json());

// Importar middleware de autenticación
const { authenticateToken } = require("./middleware/auth.middleware");

// Ruta de salud del servidor
app.get("/", (req, res) => {
  res.json({
    message: "🚛 Servidor R-M-P funcionando correctamente",
    status: "OK",
    timestamp: new Date().toISOString(),
    version: "2.0.0",
    database_schema: "02-init.sql",
    description: "Sistema de gestión de rutas y logística",
  });
});

// Endpoint de prueba para verificar conectividad con la base de datos
app.get("/api/test", async (req, res) => {
  try {
    console.log("🔍 Probando conectividad con la base de datos...");
    const db = require("./config/db");

    // Probar conexión básica
    await db.query("SELECT 1 as test");

    // Probar que las tablas principales existen
    const [tables] = await db.query("SHOW TABLES");

    // Tablas esperadas según el nuevo esquema
    const expectedTables = [
      "ZONA",
      "VEHICULO",
      "REPARTIDOR",
      "CLIENTE",
      "VIAJE",
      "VISITA",
    ];
    const existingTables = tables.map((t) => Object.values(t)[0]);
    const missingTables = expectedTables.filter(
      (table) => !existingTables.includes(table),
    );

    // Contar registros en cada tabla principal
    const tableCounts = {};
    for (const table of expectedTables) {
      if (existingTables.includes(table)) {
        try {
          const [count] = await db.query(
            `SELECT COUNT(*) as count FROM ${table}`,
          );
          tableCounts[table] = count[0].count;
        } catch (err) {
          tableCounts[table] = `Error: ${err.message}`;
        }
      } else {
        tableCounts[table] = "MISSING";
      }
    }

    // Verificar que la vista existe
    let vistaExists = false;
    try {
      await db.query("SELECT 1 FROM v_resumen_rutas LIMIT 1");
      vistaExists = true;
    } catch (err) {
      console.log("⚠️ Vista v_resumen_rutas no encontrada");
    }

    console.log("✅ Conectividad con BD exitosa");
    res.json({
      success: true,
      message: "Conectividad con base de datos exitosa",
      database: process.env.DB_NAME || "rmp_db",
      host: process.env.DB_HOST || "mysql",
      schema_version: "02-init.sql",
      tables: {
        existing: existingTables,
        expected: expectedTables,
        missing: missingTables,
        counts: tableCounts,
      },
      views: {
        v_resumen_rutas: vistaExists,
      },
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

// Endpoint para verificar el esquema de la base de datos
app.get("/api/schema", async (req, res) => {
  try {
    console.log("🔍 Verificando esquema de la base de datos...");
    const db = require("./config/db");

    // Obtener estructura de las tablas principales
    const tableStructures = {};
    const mainTables = [
      "ZONA",
      "VEHICULO",
      "REPARTIDOR",
      "CLIENTE",
      "VIAJE",
      "VISITA",
    ];

    for (const table of mainTables) {
      try {
        const [structure] = await db.query(`DESCRIBE ${table}`);
        tableStructures[table] = structure;
      } catch (err) {
        tableStructures[table] = { error: err.message };
      }
    }

    // Verificar índices
    const [indexes] = await db.query(`
      SELECT TABLE_NAME, INDEX_NAME, COLUMN_NAME
      FROM INFORMATION_SCHEMA.STATISTICS
      WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME IN ('ZONA', 'VEHICULO', 'REPARTIDOR', 'CLIENTE', 'VIAJE', 'VISITA')
      ORDER BY TABLE_NAME, INDEX_NAME, SEQ_IN_INDEX
    `);

    res.json({
      success: true,
      message: "Esquema de base de datos verificado",
      schema: {
        tables: tableStructures,
        indexes: indexes,
        version: "02-init.sql",
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Error al verificar esquema:", error);
    res.status(500).json({
      success: false,
      message: "Error al verificar esquema de base de datos",
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// Endpoint temporal para debug de estadísticas (SIN AUTENTICACIÓN)
// NOTA: Comentado para producción - descomentar solo para debugging
/*
app.get("/api/debug/zonas/estadisticas", async (req, res) => {
  try {
    console.log("🔍 Debug: Obteniendo zonas con estadísticas...");
    const db = require("./config/db");

    const [zonas] = await db.query(`
      SELECT
        z.id_zona,
        z.codigo,
        z.descripcion,
        z.latitud,
        z.longitud,
        COALESCE(stats.total_clientes, 0) as total_clientes,
        COALESCE(stats.clientes_activos, 0) as clientes_activos,
        z.created_at,
        z.updated_at
      FROM ZONA z
      LEFT JOIN (
        SELECT
          id_zona,
          COUNT(*) as total_clientes,
          SUM(CASE WHEN activo = TRUE THEN 1 ELSE 0 END) as clientes_activos
        FROM CLIENTE
        WHERE id_zona IS NOT NULL
        GROUP BY id_zona
      ) stats ON z.id_zona = stats.id_zona
      ORDER BY z.codigo ASC
    `);

    console.log(`✅ Debug: Se encontraron ${zonas.length} zonas con estadísticas`);

    res.json({
      success: true,
      data: zonas,
      count: zonas.length,
      message: "Debug: Zonas con estadísticas obtenidas exitosamente",
      debug: true
    });
  } catch (error) {
    console.error("❌ Debug Error:", error);
    res.status(500).json({
      success: false,
      message: "Debug: Error al obtener zonas con estadísticas",
      error: error.message,
      debug: true
    });
  }
});
*/

// Registrar rutas públicas
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);

// Registrar rutas protegidas (requieren autenticación)
app.use("/api/vehiculos", authenticateToken, vehiculoRoutes);
app.use("/api/zonas", authenticateToken, zonaRoutes);
app.use("/api/clientes", authenticateToken, clienteRoutes);
app.use("/api/repartidores", authenticateToken, repartidorRoutes);
app.use("/api/viajes", authenticateToken, viajeRoutes);
app.use("/api/visitas", authenticateToken, visitaRoutes);
app.use("/api/usuarios", usuarioRoutes);
app.use("/api/reportes", authenticateToken, reportesRoutes);

// Ruta para manejar rutas no encontradas
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Ruta no encontrada",
    availableRoutes: [
      "GET / - Estado del servidor",
      "GET /api/test - Test de conectividad BD",
      "GET /api/schema - Verificar esquema BD",
      "POST /api/auth/login - Iniciar sesión",
      "POST /api/auth/logout - Cerrar sesión",
      "GET /api/auth/me - Usuario actual",
      "POST /api/auth/forgot-password - Recuperar contraseña",
      "",
      "=== ADMINISTRACIÓN (requieren rol admin) ===",
      "GET /api/admin/check-users - Verificar usuarios",
      "POST /api/admin/first-admin - Crear primer admin",
      "GET /api/admin/usuarios - Lista usuarios",
      "POST /api/admin/usuarios - Crear usuario",
      "PUT /api/admin/usuarios/:id - Actualizar usuario",
      "DELETE /api/admin/usuarios/:id - Eliminar usuario",
      "POST /api/admin/usuarios/:id/reset-password - Reset contraseña",
      "PATCH /api/admin/usuarios/:id/toggle-active - Activar/desactivar",
      "GET /api/admin/roles - Lista roles",
      "POST /api/admin/reset-password-request - Solicitar reset",
      "",
      "=== RUTAS PROTEGIDAS (requieren autenticación) ===",
      "GET /api/vehiculos - Lista de vehículos",
      "GET /api/vehiculos/:id - Vehículo por ID",
      "POST /api/vehiculos - Crear vehículo",
      "PUT /api/vehiculos/:id - Actualizar vehículo",
      "DELETE /api/vehiculos/:id - Eliminar vehículo",
      "",
      "GET /api/zonas - Lista de zonas",
      "GET /api/zonas/:id - Zona por ID",
      "POST /api/zonas - Crear zona",
      "PUT /api/zonas/:id - Actualizar zona",
      "DELETE /api/zonas/:id - Eliminar zona",
      "",
      "GET /api/clientes - Lista de clientes",
      "GET /api/clientes/:id - Cliente por ID",
      "POST /api/clientes - Crear cliente",
      "PUT /api/clientes/:id - Actualizar cliente",
      "DELETE /api/clientes/:id - Eliminar cliente",
      "",
      "GET /api/repartidores - Lista de repartidores",
      "GET /api/repartidores/:id - Repartidor por ID",
      "POST /api/repartidores - Crear repartidor",
      "PUT /api/repartidores/:id - Actualizar repartidor",
      "DELETE /api/repartidores/:id - Eliminar repartidor",
      "",
      "GET /api/usuarios - Lista de usuarios",
      "GET /api/usuarios/:id - Usuario por ID",
      "POST /api/usuarios - Crear usuario",
      "PUT /api/usuarios/:id - Actualizar usuario",
      "DELETE /api/usuarios/:id - Eliminar usuario",
      "",
      "GET /api/viajes - Lista de viajes",
      "GET /api/viajes/:id - Viaje por ID",
      "POST /api/viajes - Crear viaje",
      "PUT /api/viajes/:id - Actualizar viaje",
      "DELETE /api/viajes/:id - Eliminar viaje",
      "",
      "GET /api/visitas - Lista de visitas",
      "GET /api/visitas/:id - Visita por ID",
      "POST /api/visitas - Crear visita",
      "PUT /api/visitas/:id - Actualizar visita",
      "DELETE /api/visitas/:id - Eliminar visita",
      "",
      "=== REPORTES ===",
      "GET /api/reportes/resumen-rutas - Resumen de rutas",
      "GET /api/reportes/resumen-rutas/rango - Resumen por rango",
      "GET /api/reportes/metricas-diarias - Métricas diarias",
      "GET /api/reportes/performance/vehiculos - Performance vehículos",
      "GET /api/reportes/performance/repartidores - Performance repartidores",
      "GET /api/reportes/cumplimiento - Métricas de cumplimiento",
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
      console.log(`🚛 Servidor R-M-P v2.0 iniciado exitosamente`);
      console.log(`📡 Puerto: ${PORT}`);
      console.log(`🌐 URL: http://localhost:${PORT}`);
      console.log(`💾 Base de datos: ${process.env.DB_NAME || "rmp_db"}`);
      console.log(`📋 Esquema: 02-init.sql`);
      console.log(`🕒 Timestamp: ${new Date().toISOString()}`);
      console.log("🚀 ===================================\n");

      console.log("📋 Módulos disponibles:");
      console.log("   🏠  GET  / - Estado del servidor");
      console.log("   🔧  GET  /api/test - Test conectividad BD");
      console.log("   📊  GET  /api/schema - Verificar esquema BD");
      console.log("   🔐  POST /api/auth/login - Iniciar sesión");
      console.log("");
      console.log("📦 Entidades principales (Auth requerida):");
      console.log("   🚛  /api/vehiculos - Gestión de vehículos");
      console.log("   🗺️   /api/zonas - Gestión de zonas");
      console.log("   👥  /api/clientes - Gestión de clientes");
      console.log("   👤  /api/repartidores - Gestión de repartidores");
      console.log("   🚚  /api/viajes - Gestión de viajes");
      console.log("   📍  /api/visitas - Gestión de visitas");
      console.log("   👥  /api/usuarios - Gestión de usuarios");
      console.log("");
      console.log("📊 Reportes y analytics:");
      console.log("   📈  /api/reportes/resumen-rutas - Resumen principal");
      console.log("   📉  /api/reportes/metricas-diarias - Métricas del día");
      console.log(
        "   🏆  /api/reportes/performance/* - Análisis de rendimiento",
      );
      console.log(
        "   ✅  /api/reportes/cumplimiento - Métricas de cumplimiento",
      );
      console.log("");
    });
  } catch (error) {
    console.error("❌ Error al iniciar el servidor:", error);
    process.exit(1);
  }
}

// Manejar cierre graceful
process.on("SIGINT", async () => {
  console.log("\n⏹️  Cerrando servidor R-M-P...");
  try {
    const pool = require("./config/db");
    await pool.end();
    console.log("✅ Conexión a BD cerrada");
  } catch (error) {
    console.error("❌ Error cerrando conexión BD:", error);
  }
  console.log("👋 Servidor R-M-P cerrado exitosamente");
  process.exit(0);
});

// Manejar errores no capturados
process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("❌ Uncaught Exception:", error);
  process.exit(1);
});

// Iniciar la aplicación
startServer();
