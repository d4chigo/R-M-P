#!/usr/bin/env node

/**
 * Script de debug para el formulario de viajes
 * Simula diferentes formatos de fecha que pueden venir del backend
 *
 * Uso: node debug-viaje-form.js
 */

console.log('🔍 DEBUGGING FORMULARIO DE VIAJES\n');

// Simular diferentes formatos de fecha que pueden venir del backend
const testDates = [
  '2024-01-19',                    // Formato DATE de MySQL
  '2024-01-19T00:00:00.000Z',      // ISO String completo
  '2024-01-19T05:00:00.000Z',      // ISO String con timezone
  new Date('2024-01-19'),          // Date object
  '2024-01-19 00:00:00',           // DATETIME de MySQL
  '19/01/2024',                    // Formato DD/MM/YYYY
];

// Función para formatear fecha DATE (yyyy-mm-dd) - igual que en el formulario
const formatDateLocal = (date) => {
  console.log(`  📅 Input: ${date} (type: ${typeof date})`);

  if (!date) {
    console.log('  ❌ Fecha vacía');
    return "";
  }

  // Si ya viene en formato yyyy-mm-dd, devolverla tal como está
  if (typeof date === "string" && date.match(/^\d{4}-\d{2}-\d{2}$/)) {
    console.log('  ✅ Ya está en formato correcto');
    return date;
  }

  try {
    // Si viene como timestamp o fecha completa, extraer solo la parte de fecha
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      console.log('  ❌ Fecha inválida');
      return "";
    }
    const result = dateObj.toISOString().split("T")[0];
    console.log(`  ✅ Convertida a: ${result}`);
    return result;
  } catch (error) {
    console.log(`  ❌ Error al procesar: ${error.message}`);
    return "";
  }
};

// Probar con diferentes formatos
console.log('🧪 PROBANDO DIFERENTES FORMATOS DE FECHA:\n');
testDates.forEach((date, index) => {
  console.log(`Prueba ${index + 1}:`);
  const result = formatDateLocal(date);
  console.log(`  🎯 Resultado final: "${result}"\n`);
});

// Simular datos de viaje como los que vienen del backend
console.log('📊 SIMULANDO DATOS DEL BACKEND:\n');

const mockViajeData = {
  id_viaje: 1,
  fecha: '2024-01-19',           // Como viene de MySQL DATE
  id_vehiculo: 1,
  id_repartidor: 1,
  nro_viaje: 1,
  salida_cd: '2024-01-19T08:05:00.000Z',
  llegada_cd: '2024-01-19T16:30:00.000Z',
  distancia_km: 84.9,
  tiempo_manejo_min: 172,
  tiempo_servicio_min: 305,
  recarga_min: 31,
  refrigerio_min: 60,
  tipo_viaje: 'ENTREGA'
};

console.log('Datos originales del viaje:');
console.log(JSON.stringify(mockViajeData, null, 2));

console.log('\n🔄 PROCESANDO PARA EL FORMULARIO:');

const formData = {
  fecha: formatDateLocal(mockViajeData.fecha),
  id_vehiculo: mockViajeData.id_vehiculo?.toString() || "",
  id_repartidor: mockViajeData.id_repartidor?.toString() || "",
  nro_viaje: mockViajeData.nro_viaje?.toString() || "1",
  salida_cd: mockViajeData.salida_cd ? mockViajeData.salida_cd.slice(0, 16) : "",
  llegada_cd: mockViajeData.llegada_cd ? mockViajeData.llegada_cd.slice(0, 16) : "",
  distancia_km: mockViajeData.distancia_km?.toString() || "",
  tiempo_manejo_min: mockViajeData.tiempo_manejo_min?.toString() || "",
  tiempo_servicio_min: mockViajeData.tiempo_servicio_min?.toString() || "",
  recarga_min: mockViajeData.recarga_min?.toString() || "",
  refrigerio_min: mockViajeData.refrigerio_min?.toString() || "",
  tipo_viaje: mockViajeData.tipo_viaje || "",
};

console.log('Datos para el formulario:');
console.log(JSON.stringify(formData, null, 2));

// Verificar campos específicos que están fallando
console.log('\n🎯 VERIFICACIÓN DE CAMPOS PROBLEMÁTICOS:');

console.log('Campo fecha:');
console.log(`  ✓ Valor original: ${mockViajeData.fecha}`);
console.log(`  ✓ Valor procesado: ${formData.fecha}`);
console.log(`  ✓ ¿Es válido para input[type="date"]?: ${/^\d{4}-\d{2}-\d{2}$/.test(formData.fecha) ? 'SÍ' : 'NO'}`);

console.log('\nCampo tipo_viaje:');
console.log(`  ✓ Valor original: ${mockViajeData.tipo_viaje}`);
console.log(`  ✓ Valor procesado: ${formData.tipo_viaje}`);
console.log(`  ✓ ¿Es string válido?: ${typeof formData.tipo_viaje === 'string' && formData.tipo_viaje.length > 0 ? 'SÍ' : 'NO'}`);

console.log('\n🔧 POSIBLES SOLUCIONES:');
console.log('1. Verificar que el backend esté enviando la fecha en formato DATE (yyyy-mm-dd)');
console.log('2. Asegurar que el campo tipo_viaje no sea null en la base de datos');
console.log('3. Verificar que el useEffect se ejecute después de recibir los datos');
console.log('4. Añadir logging en el componente React para ver qué datos llegan');

console.log('\n✅ DEBUG COMPLETADO');
