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
const centroDistribucionRoutes = require("./routes/centro-distribucion.route");
const tesoreriaRoutes = require("./routes/tesoreria.route");
const repartidorRoutes = require("./routes/repartidor.route");
const viajeRoutes = require("./routes/viaje.route");
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
      "VIAJE",
      "TESORERIA",
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
      "VIAJE",
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
      AND TABLE_NAME IN ('ZONA', 'VEHICULO', 'REPARTIDOR', 'VIAJE')
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



// Registrar rutas públicas
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);

// Registrar rutas protegidas (requieren autenticación)
app.use("/api/vehiculos", authenticateToken, vehiculoRoutes);
app.use("/api/zonas", authenticateToken, zonaRoutes);
app.use("/api/centros-distribucion", centroDistribucionRoutes);
app.use("/api/tesoreria", tesoreriaRoutes);
app.use("/api/repartidores", authenticateToken, repartidorRoutes);
app.use("/api/viajes", authenticateToken, viajeRoutes);
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
      "GET /api/tesoreria - Lista de tesorería",
      "GET /api/tesoreria/:id - Registro de tesorería por ID",
      "POST /api/tesoreria - Crear registro de tesorería",
      "PUT /api/tesoreria/:id - Actualizar registro de tesorería",
      "DELETE /api/tesoreria/:id - Eliminar registro de tesorería",
      "GET /api/tesoreria/search - Buscar registros de tesorería",
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
console.log("   🏭  /api/centros-distribucion - Gestión de centros de distribución");
console.log("   💰  /api/tesoreria - Gestión de tesorería");
      console.log("   👤  /api/repartidores - Gestión de repartidores");
      console.log("   🚚  /api/viajes - Gestión de viajes");
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

// -----------------------------
// Scheduler: resumen_rutas delta loader
// Controlled via env vars:
// WORKER_ENABLE_SCHEDULER=true
// WORKER_SCHEDULE_CRON="*/10 * * * *" (every 10 minutes)
// -----------------------------
try {
  const enableScheduler = String(process.env.WORKER_ENABLE_SCHEDULER || 'false').toLowerCase() === 'true';
  if (enableScheduler) {
    const cron = require('node-cron');
    const resumenWorker = require('./scripts/resumen-worker');
    const scheduleCron = process.env.WORKER_SCHEDULE_CRON || '*/10 * * * *';

    console.log('\n\u23f3 Scheduler for resumen_rutas is ENABLED');
    console.log(`\u23f0 Cron schedule: ${scheduleCron}`);

    const task = cron.schedule(scheduleCron, async () => {
      try {
        console.log('\n\u23f3 [scheduler] Running resumen_rutas delta load...');
        await resumenWorker.deltaLoad();
        console.log('\u2705 [scheduler] Delta load finished');
      } catch (err) {
        console.error('\u274c [scheduler] Delta load error:', err);
      }
    }, {
      scheduled: true,
      timezone: process.env.WORKER_SCHEDULE_TZ || 'UTC'
    });

    // Expose for graceful shutdown
    process.on('SIGINT', async () => {
      try {
        if (task) task.stop();
        console.log('\u2705 Scheduler stopped');
      } catch (e) {
        console.error('Error stopping scheduler:', e);
      }
    });
  } else {
    console.log('\n\u23f3 Scheduler for resumen_rutas is DISABLED (set WORKER_ENABLE_SCHEDULER=true to enable)');
  }
} catch(e) {
  console.error('Error checking scheduler flag:', e);
}

// Rollover tesoreria diario opcional
try {
  const enableRollover = String(process.env.TESORERIA_ROLLOVER_ENABLE || 'false').toLowerCase() === 'true';
  if (enableRollover) {
    const cron = require('node-cron');
    const runRollover = require('./scripts/tesoreria-rollover');
  const rolloverCron = process.env.TESORERIA_ROLLOVER_CRON || '59 23 * * *'; // 23:59 daily
    console.log('\n\u23f3 Tesoreria rollover scheduler ENABLED');
    console.log(`\u23f0 Cron schedule: ${rolloverCron}`);
    const taskR = cron.schedule(rolloverCron, async () => {
      try {
        console.log('\n\u23f3 [rollover] Running tesoreria rollover...');
        await runRollover();
        console.log('\u2705 [rollover] Finished');
      } catch (err) {
        console.error('\u274c [rollover] Error:', err);
      }
  }, { scheduled: true, timezone: process.env.TESORERIA_ROLLOVER_TZ || 'America/Lima' });

    process.on('SIGINT', async () => {
      try { if (taskR) taskR.stop(); console.log('\u2705 Rollover scheduler stopped'); } catch(e) {}
    });
  } else {
    console.log('\n\u23f3 Tesoreria rollover scheduler is DISABLED (set TESORERIA_ROLLOVER_ENABLE=true to enable)');
  }
} catch (e) {
  console.error('Error starting rollover scheduler:', e);
}
// All schedulers initialized
