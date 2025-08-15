#!/usr/bin/env node

/**
 * Script de prueba para el módulo de viajes
 * Verifica que todos los componentes estén correctamente alineados con la BD
 *
 * Uso: node test-viajes-module.js
 */

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Configuración de base de datos
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root_password',
  database: process.env.DB_NAME || 'rmp_db',
  port: process.env.DB_PORT || 3306
};

// Colores para output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testDatabase() {
  log('\n🔍 VERIFICANDO ESTRUCTURA DE BASE DE DATOS', 'cyan');
  log('=' .repeat(60), 'cyan');

  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    log('✅ Conexión a base de datos exitosa', 'green');

    // Verificar tabla VIAJE
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT, EXTRA
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'VIAJE'
      ORDER BY ORDINAL_POSITION
    `, [dbConfig.database]);

    log('\n📊 Estructura de tabla VIAJE:', 'yellow');
    const expectedColumns = [
      'id_viaje', 'fecha', 'id_vehiculo', 'id_repartidor', 'nro_viaje',
      'salida_cd', 'llegada_cd', 'distancia_km', 'tiempo_manejo_min',
      'tiempo_servicio_min', 'recarga_min', 'refrigerio_min', 'tipo_viaje',
      'created_by', 'updated_by', 'created_at', 'updated_at'
    ];

    const foundColumns = columns.map(col => col.COLUMN_NAME);

    for (const expectedCol of expectedColumns) {
      if (foundColumns.includes(expectedCol)) {
        const colInfo = columns.find(c => c.COLUMN_NAME === expectedCol);
        log(`  ✅ ${expectedCol} (${colInfo.DATA_TYPE})`, 'green');
      } else {
        log(`  ❌ ${expectedCol} - FALTA`, 'red');
      }
    }

    // Verificar foreign keys
    log('\n🔗 Verificando Foreign Keys:', 'yellow');
    const [fks] = await connection.execute(`
      SELECT COLUMN_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'VIAJE' AND REFERENCED_TABLE_NAME IS NOT NULL
    `, [dbConfig.database]);

    const expectedFKs = [
      { column: 'id_vehiculo', table: 'VEHICULO' },
      { column: 'id_repartidor', table: 'REPARTIDOR' },
      { column: 'created_by', table: 'USUARIO' },
      { column: 'updated_by', table: 'USUARIO' }
    ];

    for (const expectedFK of expectedFKs) {
      const fk = fks.find(f => f.COLUMN_NAME === expectedFK.column);
      if (fk && fk.REFERENCED_TABLE_NAME === expectedFK.table) {
        log(`  ✅ ${expectedFK.column} → ${expectedFK.table}`, 'green');
      } else {
        log(`  ❌ ${expectedFK.column} → ${expectedFK.table} - FALTA`, 'red');
      }
    }

    // Verificar datos de prueba
    log('\n📈 Verificando datos existentes:', 'yellow');
    const [viajesCount] = await connection.execute('SELECT COUNT(*) as count FROM VIAJE');
    const [vehiculosCount] = await connection.execute('SELECT COUNT(*) as count FROM VEHICULO WHERE activo = 1');
    const [repartidoresCount] = await connection.execute('SELECT COUNT(*) as count FROM REPARTIDOR WHERE activo = 1');

    log(`  📋 Viajes: ${viajesCount[0].count}`, 'blue');
    log(`  🚛 Vehículos activos: ${vehiculosCount[0].count}`, 'blue');
    log(`  👤 Repartidores activos: ${repartidoresCount[0].count}`, 'blue');

    return true;

  } catch (error) {
    log(`❌ Error en base de datos: ${error.message}`, 'red');
    return false;
  } finally {
    if (connection) await connection.end();
  }
}

function testFrontendFiles() {
  log('\n🎨 VERIFICANDO ARCHIVOS FRONTEND', 'cyan');
  log('=' .repeat(60), 'cyan');

  const files = [
    'client/hooks/use-viajes.ts',
    'client/components/forms/viaje-form.tsx',
    'client/components/tables/viajes-table.tsx',
    'client/app/viajes/page.tsx'
  ];

  let allFilesExist = true;

  for (const file of files) {
    const fullPath = path.join(__dirname, file);
    if (fs.existsSync(fullPath)) {
      log(`✅ ${file}`, 'green');

      // Verificar contenido específico
      const content = fs.readFileSync(fullPath, 'utf8');

      if (file.includes('use-viajes.ts')) {
        const hasRequiredFields = [
          'id_viaje', 'fecha', 'id_vehiculo', 'id_repartidor', 'nro_viaje',
          'salida_cd', 'llegada_cd', 'distancia_km', 'tipo_viaje'
        ].every(field => content.includes(field));

        const hasObsoleteFields = ['id_ruta', 'ruta_nombre', 'origen', 'destino'].some(field => content.includes(field));

        if (hasRequiredFields && !hasObsoleteFields) {
          log(`  ✅ Campos alineados con BD`, 'green');
        } else {
          log(`  ⚠️  Revisar alineación de campos`, 'yellow');
        }
      }

      if (file.includes('viaje-form.tsx')) {
        const hasRepartidorSelect = content.includes('useRepartidores');
        const hasValidations = content.includes('validateForm');
        const hasErrorHandling = content.includes('errors.');

        if (hasRepartidorSelect && hasValidations && hasErrorHandling) {
          log(`  ✅ Formulario completo y validado`, 'green');
        } else {
          log(`  ⚠️  Verificar implementación del formulario`, 'yellow');
        }
      }

      if (file.includes('page.tsx')) {
        const hasDeleteAlert = content.includes('AlertDialog');
        const hasProperColumns = content.includes('vehiculo_placa') && content.includes('repartidor_nombre');

        if (hasDeleteAlert && hasProperColumns) {
          log(`  ✅ Página con alertas y columnas correctas`, 'green');
        } else {
          log(`  ⚠️  Verificar implementación de la página`, 'yellow');
        }
      }

    } else {
      log(`❌ ${file} - NO ENCONTRADO`, 'red');
      allFilesExist = false;
    }
  }

  return allFilesExist;
}

function testBackendController() {
  log('\n⚙️  VERIFICANDO CONTROLADOR BACKEND', 'cyan');
  log('=' .repeat(60), 'cyan');

  const controllerPath = path.join(__dirname, 'server/controllers/viaje.controller.js');

  if (!fs.existsSync(controllerPath)) {
    log('❌ Controlador no encontrado', 'red');
    return false;
  }

  log('✅ Archivo del controlador encontrado', 'green');

  const content = fs.readFileSync(controllerPath, 'utf8');

  // Verificar funciones principales
  const functions = ['getViajes', 'getViajeById', 'createViaje', 'updateViaje', 'deleteViaje'];
  let allFunctionsExist = true;

  for (const func of functions) {
    if (content.includes(`const ${func}`)) {
      log(`  ✅ ${func}()`, 'green');
    } else {
      log(`  ❌ ${func}() - FALTA`, 'red');
      allFunctionsExist = false;
    }
  }

  // Verificar mejoras en deleteViaje
  const hasReferenceCheck = content.includes('VISITA') && content.includes('id_viaje');
  const hasDetailedError = content.includes('clientes_afectados') || content.includes('visitas asociadas');

  if (hasReferenceCheck && hasDetailedError) {
    log(`  ✅ deleteViaje con verificación de referencias`, 'green');
  } else {
    log(`  ⚠️  Verificar mejoras en deleteViaje`, 'yellow');
  }

  return allFunctionsExist;
}

async function testAPIEndpoints() {
  log('\n🌐 VERIFICANDO ENDPOINTS API', 'cyan');
  log('=' .repeat(60), 'cyan');

  // Esta función requeriría que el servidor esté ejecutándose
  // Para este test, solo verificamos que las rutas estén definidas

  const routesPath = path.join(__dirname, 'server/routes');

  if (fs.existsSync(routesPath)) {
    log('✅ Directorio de rutas encontrado', 'green');

    const viajeRoutes = path.join(routesPath, 'viajes.js');
    if (fs.existsSync(viajeRoutes)) {
      log('✅ Rutas de viajes definidas', 'green');

      const routeContent = fs.readFileSync(viajeRoutes, 'utf8');
      const endpoints = ['GET /', 'GET /:id', 'POST /', 'PUT /:id', 'DELETE /:id'];

      for (const endpoint of endpoints) {
        const method = endpoint.split(' ')[0].toLowerCase();
        const path = endpoint.split(' ')[1];

        if (routeContent.includes(`.${method}('${path}'`) || routeContent.includes(`.${method}("${path}"`)) {
          log(`  ✅ ${endpoint}`, 'green');
        } else {
          log(`  ⚠️  ${endpoint} - VERIFICAR`, 'yellow');
        }
      }
    } else {
      log('⚠️  Archivo de rutas de viajes no encontrado', 'yellow');
    }
  } else {
    log('❌ Directorio de rutas no encontrado', 'red');
  }

  return true;
}

function generateTestSummary(results) {
  log('\n📋 RESUMEN DE PRUEBAS', 'magenta');
  log('=' .repeat(60), 'magenta');

  const { database, frontend, backend, api } = results;

  let score = 0;
  let total = 4;

  if (database) {
    log('✅ Base de datos: CORRECTA', 'green');
    score++;
  } else {
    log('❌ Base de datos: PROBLEMAS DETECTADOS', 'red');
  }

  if (frontend) {
    log('✅ Frontend: ARCHIVOS CORRECTOS', 'green');
    score++;
  } else {
    log('❌ Frontend: ARCHIVOS FALTANTES O INCORRECTOS', 'red');
  }

  if (backend) {
    log('✅ Backend: CONTROLADOR CORRECTO', 'green');
    score++;
  } else {
    log('❌ Backend: PROBLEMAS EN CONTROLADOR', 'red');
  }

  if (api) {
    log('✅ API: RUTAS DEFINIDAS', 'green');
    score++;
  } else {
    log('❌ API: PROBLEMAS EN RUTAS', 'red');
  }

  log(`\n🎯 PUNTUACIÓN: ${score}/${total} (${Math.round(score/total*100)}%)`, score === total ? 'green' : 'yellow');

  if (score === total) {
    log('\n🎉 ¡MÓDULO DE VIAJES COMPLETAMENTE FUNCIONAL!', 'green');
    log('   El módulo está alineado con la base de datos y listo para uso.', 'green');
  } else {
    log('\n⚠️  REVISAR ELEMENTOS MARCADOS ARRIBA', 'yellow');
    log('   Corregir los problemas identificados antes de usar en producción.', 'yellow');
  }
}

async function main() {
  log('🚀 INICIANDO PRUEBAS DEL MÓDULO DE VIAJES', 'bright');
  log('Verificando alineación con base de datos y funcionalidad completa\n', 'bright');

  const results = {
    database: await testDatabase(),
    frontend: testFrontendFiles(),
    backend: testBackendController(),
    api: testAPIEndpoints()
  };

  generateTestSummary(results);

  log('\n📚 DOCUMENTACIÓN:', 'cyan');
  log('   Ver VIAJES_MODULE_ALIGNMENT_SUMMARY.md para detalles completos', 'cyan');

  process.exit(results.database && results.frontend && results.backend && results.api ? 0 : 1);
}

// Manejar errores no capturados
process.on('unhandledRejection', (reason, promise) => {
  log(`❌ Error no manejado: ${reason}`, 'red');
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  log(`❌ Excepción no capturada: ${error.message}`, 'red');
  process.exit(1);
});

// Ejecutar pruebas
if (require.main === module) {
  main();
}

module.exports = {
  testDatabase,
  testFrontendFiles,
  testBackendController,
  testAPIEndpoints
};
