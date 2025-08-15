#!/usr/bin/env node

/**
 * Script de diagnóstico para problemas en el módulo de zonas
 * Identifica problemas comunes y proporciona soluciones
 */

const axios = require('axios');

// Configuración
const BASE_URL = 'http://localhost:4000';
const FRONTEND_URL = 'http://localhost:3000';

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'cyan');
  console.log('='.repeat(60));
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

// Función para hacer requests con timeout
async function makeRequest(url, timeout = 5000) {
  try {
    const response = await axios.get(url, { timeout });
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || error.message,
      status: error.response?.status || 0,
      code: error.code
    };
  }
}

// 1. Verificar servicios básicos
async function checkServices() {
  logSection('🔍 VERIFICANDO SERVICIOS');

  // Verificar servidor backend
  logInfo('Verificando servidor backend (puerto 4000)...');
  const serverCheck = await makeRequest(`${BASE_URL}/`);

  if (serverCheck.success) {
    logSuccess(`Servidor backend funcionando: ${serverCheck.data.message}`);
  } else {
    logError(`Servidor backend no disponible: ${serverCheck.error}`);
    if (serverCheck.code === 'ECONNREFUSED') {
      logWarning('El servidor no está ejecutándose. Ejecuta: npm start en la carpeta server/');
    }
    return false;
  }

  // Verificar cliente frontend
  logInfo('Verificando cliente frontend (puerto 3000)...');
  const clientCheck = await makeRequest(`${FRONTEND_URL}/`);

  if (clientCheck.success) {
    logSuccess('Cliente frontend funcionando');
  } else {
    logWarning(`Cliente frontend no disponible: ${clientCheck.error}`);
    if (clientCheck.code === 'ECONNREFUSED') {
      logWarning('El cliente no está ejecutándose. Ejecuta: npm run dev en la carpeta client/');
    }
  }

  return true;
}

// 2. Verificar base de datos
async function checkDatabase() {
  logSection('🗄️  VERIFICANDO BASE DE DATOS');

  const dbCheck = await makeRequest(`${BASE_URL}/api/test`);

  if (!dbCheck.success) {
    logError(`No se puede verificar la base de datos: ${dbCheck.error}`);
    return false;
  }

  const dbData = dbCheck.data;

  logInfo(`Base de datos: ${dbData.database}`);
  logInfo(`Host: ${dbData.host}`);

  // Verificar tabla ZONA
  if (dbData.tables && dbData.tables.existing.includes('ZONA')) {
    logSuccess('Tabla ZONA encontrada');
    logInfo(`Registros en ZONA: ${dbData.tables.counts.ZONA}`);
  } else {
    logError('Tabla ZONA no encontrada');
    logWarning('Ejecuta el script de inicialización: mysql/init/01-init.sql');
    return false;
  }

  // Verificar estructura de la tabla
  const schemaCheck = await makeRequest(`${BASE_URL}/api/schema`);
  if (schemaCheck.success && schemaCheck.data.schema && schemaCheck.data.schema.tables.ZONA) {
    const zonaFields = schemaCheck.data.schema.tables.ZONA.map(field => field.Field);

    logInfo('Campos en tabla ZONA: ' + zonaFields.join(', '));

    // Verificar si tiene los campos nuevos
    const hasDescripcion = zonaFields.includes('descripcion');
    const hasLatitud = zonaFields.includes('latitud');
    const hasLongitud = zonaFields.includes('longitud');
    const hasNombre = zonaFields.includes('nombre');

    if (hasNombre && !hasDescripcion) {
      logWarning('La tabla tiene campo "nombre" pero no "descripcion"');
      logWarning('Necesitas ejecutar la migración: mysql/init/03-migration-zona-upgrade.sql');
      return { needsMigration: true };
    }

    if (!hasLatitud || !hasLongitud) {
      logWarning('La tabla no tiene campos de coordenadas (latitud, longitud)');
      logWarning('Necesitas ejecutar la migración: mysql/init/03-migration-zona-upgrade.sql');
      return { needsMigration: true };
    }

    if (hasDescripcion && hasLatitud && hasLongitud) {
      logSuccess('Tabla ZONA tiene la estructura correcta (descripcion, latitud, longitud)');
    }
  }

  return true;
}

// 3. Verificar API de zonas
async function checkZonasAPI() {
  logSection('🗺️  VERIFICANDO API DE ZONAS');

  // Verificar endpoint principal
  logInfo('Verificando GET /api/zonas...');
  const zonasCheck = await makeRequest(`${BASE_URL}/api/zonas`);

  if (!zonasCheck.success) {
    if (zonasCheck.status === 401) {
      logWarning('API requiere autenticación. Esto es normal.');
      return true; // No es un error real
    } else {
      logError(`Error en /api/zonas: ${zonasCheck.error}`);
      return false;
    }
  }

  logSuccess(`API /api/zonas funcionando. ${zonasCheck.data.count} zonas encontradas`);

  // Verificar endpoint de estadísticas
  logInfo('Verificando GET /api/zonas/estadisticas...');
  const statsCheck = await makeRequest(`${BASE_URL}/api/zonas/estadisticas`);

  if (!statsCheck.success) {
    if (statsCheck.status === 404) {
      logError('Endpoint /api/zonas/estadisticas devuelve 404');
      logWarning('Problema: La ruta "estadisticas" está después de "/:id" en zona.route.js');
      logInfo('Solución: Reordenar las rutas poniendo "/estadisticas" antes de "/:id"');
      return { statsError: true };
    } else if (statsCheck.status === 401) {
      logWarning('API de estadísticas requiere autenticación. Esto es normal.');
    } else {
      logError(`Error en /api/zonas/estadisticas: ${statsCheck.error}`);
      return false;
    }
  } else {
    logSuccess('API /api/zonas/estadisticas funcionando correctamente');
  }

  // Verificar estructura de datos
  if (zonasCheck.success && zonasCheck.data.data && zonasCheck.data.data.length > 0) {
    const primeraZona = zonasCheck.data.data[0];
    logInfo('Estructura de primera zona:');
    Object.keys(primeraZona).forEach(key => {
      const value = primeraZona[key];
      const type = typeof value;
      console.log(`    ${key}: ${type} = ${value}`);
    });

    // Verificar tipos de coordenadas
    if (primeraZona.latitud !== null && primeraZona.latitud !== undefined) {
      const latType = typeof primeraZona.latitud;
      const lngType = typeof primeraZona.longitud;

      if (latType !== 'number' || lngType !== 'number') {
        logWarning(`Coordenadas no son números: latitud(${latType}), longitud(${lngType})`);
        logInfo('Esto puede causar errores en el mapa con toFixed()');
        return { coordinateTypeError: true };
      } else {
        logSuccess('Coordenadas tienen tipo correcto (number)');
      }
    }
  }

  return true;
}

// 4. Verificar archivos del frontend
async function checkFrontendFiles() {
  logSection('📁 VERIFICANDO ARCHIVOS FRONTEND');

  const fs = require('fs');
  const requiredFiles = [
    'client/app/zonas/page.tsx',
    'client/hooks/use-zonas.ts',
    'client/components/forms/zona-form.tsx',
    'client/components/zona-estadisticas.tsx',
    'client/components/zona-mapa.tsx'
  ];

  let allFilesExist = true;

  requiredFiles.forEach(file => {
    if (fs.existsSync(file)) {
      logSuccess(`${file} ✓`);
    } else {
      logError(`${file} ✗`);
      allFilesExist = false;
    }
  });

  if (!allFilesExist) {
    logWarning('Algunos archivos del frontend faltan');
    return false;
  }

  // Verificar contenido de archivos clave
  logInfo('Verificando contenido de archivos...');

  try {
    const zonaMapaContent = fs.readFileSync('client/components/zona-mapa.tsx', 'utf8');

    if (zonaMapaContent.includes('zona.latitud?.toFixed(4)')) {
      logWarning('Detectado: zona.latitud?.toFixed(4) - puede causar error si latitud no es número');
      logInfo('Solución: usar Number(zona.latitud).toFixed(4)');
      return { mapError: true };
    }

    if (zonaMapaContent.includes('Number(zona.latitud).toFixed(4)')) {
      logSuccess('Mapa usa Number() correctamente para coordenadas');
    }

    const pageContent = fs.readFileSync('client/app/zonas/page.tsx', 'utf8');
    if (pageContent.includes('searchKeys={["codigo", "descripcion"]}')) {
      logSuccess('Página usa campos correctos para búsqueda');
    } else if (pageContent.includes('searchKeys={["codigo", "nombre"]}')) {
      logWarning('Página aún usa campo "nombre" en lugar de "descripcion"');
      return { searchFieldError: true };
    }

  } catch (error) {
    logError(`Error leyendo archivos: ${error.message}`);
    return false;
  }

  return true;
}

// 5. Generar reporte y soluciones
function generateSolutions(issues) {
  logSection('🔧 SOLUCIONES RECOMENDADAS');

  if (issues.needsMigration) {
    logError('PROBLEMA: Tabla ZONA necesita migración');
    console.log('SOLUCIÓN:');
    console.log('  1. docker-compose exec mysql mysql -u root -prootpassword rmp_db');
    console.log('  2. SOURCE mysql/init/03-migration-zona-upgrade.sql;');
    console.log('  O ejecutar: ./inicio-zonas.sh migrate');
  }

  if (issues.statsError) {
    logError('PROBLEMA: Endpoint /api/zonas/estadisticas devuelve 404');
    console.log('SOLUCIÓN:');
    console.log('  Archivo: server/routes/zona.route.js');
    console.log('  Mover router.get("/estadisticas", ...) ANTES de router.get("/:id", ...)');
  }

  if (issues.coordinateTypeError) {
    logError('PROBLEMA: Coordenadas no son tipo number');
    console.log('SOLUCIÓN:');
    console.log('  En client/components/zona-mapa.tsx:');
    console.log('  Cambiar zona.latitud.toFixed(4) por Number(zona.latitud).toFixed(4)');
  }

  if (issues.mapError) {
    logError('PROBLEMA: Método toFixed() en coordenadas puede fallar');
    console.log('SOLUCIÓN:');
    console.log('  En client/components/zona-mapa.tsx:');
    console.log('  Reemplazar todas las instancias de:');
    console.log('    zona.latitud?.toFixed(4) → Number(zona.latitud).toFixed(4)');
    console.log('    zona.longitud?.toFixed(4) → Number(zona.longitud).toFixed(4)');
  }

  if (issues.searchFieldError) {
    logError('PROBLEMA: Búsqueda usa campo "nombre" obsoleto');
    console.log('SOLUCIÓN:');
    console.log('  En client/app/zonas/page.tsx:');
    console.log('  Cambiar searchKeys={["codigo", "nombre"]} por searchKeys={["codigo", "descripcion"]}');
  }

  if (Object.keys(issues).length === 0) {
    logSuccess('🎉 ¡No se detectaron problemas! El módulo de zonas debería funcionar correctamente.');
  }
}

// Función principal
async function runDiagnostic() {
  console.log('🔍 DIAGNÓSTICO DEL MÓDULO DE ZONAS');
  console.log('Analizando problemas comunes...\n');

  const issues = {};

  // Ejecutar verificaciones
  const servicesOk = await checkServices();
  if (!servicesOk) {
    logError('Servicios básicos no disponibles. Revisa que el servidor esté ejecutándose.');
    return;
  }

  const dbResult = await checkDatabase();
  if (dbResult && dbResult.needsMigration) {
    issues.needsMigration = true;
  }

  const apiResult = await checkZonasAPI();
  if (apiResult && apiResult.statsError) {
    issues.statsError = true;
  }
  if (apiResult && apiResult.coordinateTypeError) {
    issues.coordinateTypeError = true;
  }

  const frontendResult = await checkFrontendFiles();
  if (frontendResult && frontendResult.mapError) {
    issues.mapError = true;
  }
  if (frontendResult && frontendResult.searchFieldError) {
    issues.searchFieldError = true;
  }

  // Generar soluciones
  generateSolutions(issues);

  logSection('📋 RESUMEN');
  if (Object.keys(issues).length === 0) {
    logSuccess('✅ Sistema funcionando correctamente');
  } else {
    logWarning(`⚠️  ${Object.keys(issues).length} problema(s) detectado(s)`);
  }

  console.log('\n💡 Para más ayuda, revisa:');
  console.log('   📖 MODULO_ZONAS_README.md');
  console.log('   🧪 node test-zonas.js (para pruebas completas)');
  console.log('   🚀 ./inicio-zonas.sh (para reiniciar todo)');
}

// Ejecutar diagnóstico
if (require.main === module) {
  runDiagnostic().catch(error => {
    logError(`Error inesperado: ${error.message}`);
    process.exit(1);
  });
}

module.exports = { runDiagnostic };
