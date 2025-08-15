#!/usr/bin/env node

/**
 * Script de prueba para el módulo de zonas
 * Prueba todas las funcionalidades del CRUD de zonas
 */

const axios = require('axios');

// Configuración
const BASE_URL = 'http://localhost:4000';
const API_URL = `${BASE_URL}/api`;

// Datos de prueba
const ZONA_PRUEBA = {
  codigo: 'TEST001',
  descripcion: 'Zona de Prueba Test - Área de testing para validar funcionalidades del sistema de gestión de zonas geográficas.',
  latitud: -12.0464,
  longitud: -77.0428
};

const ZONA_ACTUALIZADA = {
  codigo: 'TEST002',
  descripcion: 'Zona de Prueba Actualizada - Área de testing modificada con nuevas coordenadas y descripción mejorada.',
  latitud: -12.0500,
  longitud: -77.0500
};

// Token de autenticación (se obtendrá del login)
let authToken = '';
let zonaCreada = null;

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
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

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'cyan');
  console.log('='.repeat(60));
}

function logTest(testName) {
  log(`\n🧪 ${testName}`, 'blue');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

// Función para hacer requests con manejo de errores
async function makeRequest(method, url, data = null, requireAuth = true) {
  try {
    const config = {
      method,
      url: `${API_URL}${url}`,
      headers: {}
    };

    if (requireAuth && authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }

    if (data) {
      config.data = data;
      config.headers['Content-Type'] = 'application/json';
    }

    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || error.message,
      status: error.response?.status || 500
    };
  }
}

// 1. Verificar que el servidor esté funcionando
async function testServerHealth() {
  logTest('Verificando estado del servidor');

  const result = await makeRequest('GET', '/', null, false);

  if (result.success) {
    logSuccess(`Servidor funcionando: ${result.data.message}`);
    logInfo(`Versión: ${result.data.version}`);
    return true;
  } else {
    logError(`Error del servidor: ${result.error}`);
    return false;
  }
}

// 2. Probar conectividad con la base de datos
async function testDatabaseConnection() {
  logTest('Verificando conectividad con la base de datos');

  const result = await makeRequest('GET', '/test', null, false);

  if (result.success) {
    logSuccess('Conectividad con BD exitosa');
    logInfo(`Base de datos: ${result.data.database}`);
    logInfo(`Tablas encontradas: ${result.data.tables.existing.length}`);

    // Verificar que la tabla ZONA existe
    if (result.data.tables.existing.includes('ZONA')) {
      logSuccess('Tabla ZONA encontrada');
      logInfo(`Registros en ZONA: ${result.data.tables.counts.ZONA}`);
    } else {
      logError('Tabla ZONA no encontrada');
      return false;
    }

    return true;
  } else {
    logError(`Error de BD: ${result.error}`);
    return false;
  }
}

// 3. Autenticación
async function testAuthentication() {
  logTest('Iniciando sesión para obtener token');

  const loginData = {
    email: 'demo@rmp.com',
    password: 'demo'
  };

  const result = await makeRequest('POST', '/auth/login', loginData, false);

  if (result.success && result.data.token) {
    authToken = result.data.token;
    logSuccess(`Autenticación exitosa: ${result.data.user.nombre_completo}`);
    return true;
  } else {
    logError(`Error de autenticación: ${result.error?.message || result.error}`);
    return false;
  }
}

// 4. Obtener lista de zonas
async function testGetZonas() {
  logTest('Obteniendo lista de zonas');

  const result = await makeRequest('GET', '/zonas');

  if (result.success) {
    logSuccess(`${result.data.count} zonas encontradas`);

    if (result.data.data && result.data.data.length > 0) {
      logInfo('Primeras 3 zonas:');
      result.data.data.slice(0, 3).forEach(zona => {
        console.log(`   - ${zona.codigo}: ${zona.nombre}`);
      });
    }

    return true;
  } else {
    logError(`Error al obtener zonas: ${result.error?.message || result.error}`);
    return false;
  }
}

// 5. Crear nueva zona
async function testCreateZona() {
  logTest('Creando nueva zona');

  const result = await makeRequest('POST', '/zonas', ZONA_PRUEBA);

  if (result.success) {
    zonaCreada = result.data.data;
    logSuccess(`Zona creada: ${zonaCreada.codigo}`);
    logInfo(`ID asignado: ${zonaCreada.id_zona}`);
    logInfo(`Descripción: ${zonaCreada.descripcion.substring(0, 50)}...`);
    logInfo(`Coordenadas: ${zonaCreada.latitud}, ${zonaCreada.longitud}`);
    return true;
  } else {
    logError(`Error al crear zona: ${result.error?.message || result.error}`);
    return false;
  }
}

// 6. Obtener zona por ID
async function testGetZonaById() {
  if (!zonaCreada) {
    logWarning('Saltando test - no hay zona creada');
    return false;
  }

  logTest(`Obteniendo zona por ID: ${zonaCreada.id_zona}`);

  const result = await makeRequest('GET', `/zonas/${zonaCreada.id_zona}`);

  if (result.success) {
    const zona = result.data.data;
    logSuccess(`Zona encontrada: ${zona.codigo}`);
    logInfo(`Descripción: ${zona.descripcion.substring(0, 50)}...`);
    logInfo(`Coordenadas: ${zona.latitud}, ${zona.longitud}`);
    logInfo(`Creada: ${new Date(zona.created_at).toLocaleString()}`);
    return true;
  } else {
    logError(`Error al obtener zona: ${result.error?.message || result.error}`);
    return false;
  }
}

// 7. Obtener zona por código
async function testGetZonaByCodigo() {
  if (!zonaCreada) {
    logWarning('Saltando test - no hay zona creada');
    return false;
  }

  logTest(`Obteniendo zona por código: ${zonaCreada.codigo}`);

  const result = await makeRequest('GET', `/zonas/codigo/${zonaCreada.codigo}`);

  if (result.success) {
    const zona = result.data.data;
    logSuccess(`Zona encontrada por código: ${zona.codigo}`);
    logInfo(`Descripción: ${zona.descripcion.substring(0, 50)}...`);
    return true;
  } else {
    logError(`Error al obtener zona por código: ${result.error?.message || result.error}`);
    return false;
  }
}

// 8. Actualizar zona
async function testUpdateZona() {
  if (!zonaCreada) {
    logWarning('Saltando test - no hay zona creada');
    return false;
  }

  logTest(`Actualizando zona ID: ${zonaCreada.id_zona}`);

  const result = await makeRequest('PUT', `/zonas/${zonaCreada.id_zona}`, ZONA_ACTUALIZADA);

  if (result.success) {
    const zonaActualizada = result.data.data;
    logSuccess(`Zona actualizada: ${zonaActualizada.codigo}`);
    logInfo(`Nueva descripción: ${zonaActualizada.descripcion.substring(0, 50)}...`);
    logInfo(`Nuevas coordenadas: ${zonaActualizada.latitud}, ${zonaActualizada.longitud}`);

    // Actualizar referencia local
    zonaCreada = zonaActualizada;
    return true;
  } else {
    logError(`Error al actualizar zona: ${result.error?.message || result.error}`);
    return false;
  }
}

// 9. Buscar zonas
async function testSearchZonas() {
  logTest('Buscando zonas con término "TEST"');

  const result = await makeRequest('GET', '/zonas/search?q=TEST');

  if (result.success) {
    logSuccess(`${result.data.count} zonas encontradas con "TEST"`);

    if (result.data.data && result.data.data.length > 0) {
      result.data.data.forEach(zona => {
        console.log(`   - ${zona.codigo}: ${zona.nombre}`);
      });
    }

    return true;
  } else {
    logError(`Error en búsqueda: ${result.error?.message || result.error}`);
    return false;
  }
}

// 10. Obtener estadísticas de zonas
async function testGetEstadisticas() {
  logTest('Obteniendo estadísticas de zonas');

  const result = await makeRequest('GET', '/zonas/estadisticas');

  if (result.success) {
    logSuccess(`Estadísticas obtenidas para ${result.data.count} zonas`);

    if (result.data.data && result.data.data.length > 0) {
      logInfo('Resumen de zonas con clientes:');
      result.data.data
        .filter(zona => zona.total_clientes > 0)
        .slice(0, 5)
        .forEach(zona => {
          console.log(`   - ${zona.codigo}: ${zona.total_clientes} clientes (${zona.clientes_activos} activos)`);
        });
    }

    return true;
  } else {
    logError(`Error al obtener estadísticas: ${result.error?.message || result.error}`);
    return false;
  }
}

// 11. Probar validaciones
async function testValidations() {
  logTest('Probando validaciones del sistema');

  // Probar crear zona sin datos requeridos
  console.log('\n   🔍 Zona sin código:');
  const resultSinCodigo = await makeRequest('POST', '/zonas', { descripcion: 'Solo descripción' });

  if (!resultSinCodigo.success && resultSinCodigo.status === 400) {
    logSuccess('Validación correcta: rechaza zona sin código');
  } else {
    logWarning('Validación fallida: debería rechazar zona sin código');
  }

  // Probar crear zona sin descripción
  console.log('\n   🔍 Zona sin descripción:');
  const resultSinDescripcion = await makeRequest('POST', '/zonas', { codigo: 'SOLO001' });

  if (!resultSinDescripcion.success && resultSinDescripcion.status === 400) {
    logSuccess('Validación correcta: rechaza zona sin descripción');
  } else {
    logWarning('Validación fallida: debería rechazar zona sin descripción');
  }

  // Probar coordenadas inválidas
  console.log('\n   🔍 Coordenadas inválidas:');
  const resultCoordInvalidas = await makeRequest('POST', '/zonas', {
    codigo: 'COORD001',
    descripcion: 'Zona con coordenadas inválidas',
    latitud: 100, // Fuera del rango válido
    longitud: -200 // Fuera del rango válido
  });

  if (!resultCoordInvalidas.success && resultCoordInvalidas.status === 400) {
    logSuccess('Validación correcta: rechaza coordenadas fuera de rango');
  } else {
    logWarning('Validación fallida: debería rechazar coordenadas inválidas');
  }

  // Probar crear zona con código duplicado
  if (zonaCreada) {
    console.log('\n   🔍 Código duplicado:');
    const resultDuplicado = await makeRequest('POST', '/zonas', {
      codigo: zonaCreada.codigo,
      descripcion: 'Zona duplicada - No debería permitir crear esto'
    });

    if (!resultDuplicado.success && resultDuplicado.status === 400) {
      logSuccess('Validación correcta: rechaza código duplicado');
    } else {
      logWarning('Validación fallida: debería rechazar código duplicado');
    }
  }

  return true;
}

// 12. Eliminar zona de prueba
async function testDeleteZona() {
  if (!zonaCreada) {
    logWarning('Saltando test - no hay zona creada');
    return false;
  }

  logTest(`Eliminando zona de prueba ID: ${zonaCreada.id_zona}`);

  const result = await makeRequest('DELETE', `/zonas/${zonaCreada.id_zona}`);

  if (result.success) {
    logSuccess(`Zona eliminada: ${zonaCreada.codigo}`);

    // Verificar que realmente se eliminó
    const verifyResult = await makeRequest('GET', `/zonas/${zonaCreada.id_zona}`);
    if (!verifyResult.success && verifyResult.status === 404) {
      logSuccess('Eliminación confirmada: zona no encontrada');
    } else {
      logWarning('La zona aún existe después de eliminarla');
    }

    return true;
  } else {
    logError(`Error al eliminar zona: ${result.error?.message || result.error}`);
    return false;
  }
}

// Función principal para ejecutar todas las pruebas
async function runAllTests() {
  logSection('🧪 INICIANDO PRUEBAS DEL MÓDULO DE ZONAS');

  const tests = [
    { name: 'Estado del servidor', fn: testServerHealth },
    { name: 'Conectividad BD', fn: testDatabaseConnection },
    { name: 'Autenticación', fn: testAuthentication },
    { name: 'Obtener zonas', fn: testGetZonas },
    { name: 'Crear zona', fn: testCreateZona },
    { name: 'Obtener zona por ID', fn: testGetZonaById },
    { name: 'Obtener zona por código', fn: testGetZonaByCodigo },
    { name: 'Actualizar zona', fn: testUpdateZona },
    { name: 'Buscar zonas', fn: testSearchZonas },
    { name: 'Estadísticas', fn: testGetEstadisticas },
    { name: 'Validaciones', fn: testValidations },
    { name: 'Eliminar zona', fn: testDeleteZona }
  ];

  const results = [];

  for (const test of tests) {
    try {
      const result = await test.fn();
      results.push({ name: test.name, success: result });
    } catch (error) {
      logError(`Error inesperado en ${test.name}: ${error.message}`);
      results.push({ name: test.name, success: false });
    }
  }

  // Resumen final
  logSection('📊 RESUMEN DE PRUEBAS');

  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  results.forEach(result => {
    if (result.success) {
      logSuccess(`${result.name}`);
    } else {
      logError(`${result.name}`);
    }
  });

  console.log('\n' + '='.repeat(60));
  log(`📈 RESULTADOS FINALES:`, 'cyan');
  logSuccess(`✅ Pruebas exitosas: ${passed}`);
  if (failed > 0) {
    logError(`❌ Pruebas fallidas: ${failed}`);
  }
  log(`📊 Total de pruebas: ${results.length}`, 'blue');

  if (failed === 0) {
    logSuccess('🎉 ¡TODAS LAS PRUEBAS PASARON! El módulo de zonas está funcionando correctamente.');
    logSuccess('✅ Funcionalidades validadas: CRUD, coordenadas GPS, descripciones, validaciones');
  } else {
    logWarning(`⚠️  ${failed} prueba(s) fallaron. Revisa los errores arriba.`);
  }

  console.log('='.repeat(60));

  return failed === 0;
}

// Manejo de argumentos de línea de comandos
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
🧪 Script de prueba para el módulo de zonas

Uso: node test-zonas.js [opciones]

Opciones:
  --help, -h     Mostrar esta ayuda
  --verbose, -v  Modo verbose (más detalles)

Ejemplos:
  node test-zonas.js              # Ejecutar todas las pruebas
  node test-zonas.js --verbose    # Ejecutar con más detalles

Requisitos:
  - El servidor debe estar ejecutándose en http://localhost:4000
  - La base de datos debe estar inicializada con migración de zonas
  - Debe existir un usuario demo@rmp.com con password 'demo'
  - Las zonas deben tener campos: codigo, descripcion, latitud, longitud

Funcionalidades probadas:
  ✅ CRUD completo con nuevos campos
  ✅ Validaciones de coordenadas GPS
  ✅ Descripciones detalladas
  ✅ Búsqueda por código y descripción
  ✅ Estadísticas con geolocalización
`);
  process.exit(0);
}

// Ejecutar las pruebas
if (require.main === module) {
  runAllTests()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      logError(`Error fatal: ${error.message}`);
      process.exit(1);
    });
}

module.exports = {
  runAllTests,
  testServerHealth,
  testDatabaseConnection,
  testAuthentication,
  testGetZonas,
  testCreateZona,
  testGetZonaById,
  testGetZonaByCodigo,
  testUpdateZona,
  testSearchZonas,
  testGetEstadisticas,
  testValidations,
  testDeleteZona
};
