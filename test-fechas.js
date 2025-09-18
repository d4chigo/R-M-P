const { todayPeruYMD, toPeruYMD, nowPeruTimestamp } = require('./server/lib/date-utils');

console.log('=== VERIFICACIÓN DE FECHAS - ZONA HORARIA LIMA ===');
console.log('');

// Mostrar fecha actual en diferentes formatos
console.log('📅 Fecha actual:');
console.log('UTC (new Date()):', new Date().toISOString());
console.log('Lima fecha (YYYY-MM-DD):', todayPeruYMD());
console.log('Lima timestamp completo:', nowPeruTimestamp());
console.log('');

// Probar conversiones
const testDate = new Date('2024-09-18T07:00:00Z'); // 7 AM UTC = 2 AM Lima
console.log('🔄 Prueba de conversión:');
console.log('Fecha de prueba (UTC):', testDate.toISOString());
console.log('Convertida a Lima:', toPeruYMD(testDate));
console.log('');

// Mostrar diferencia horaria
const utcHour = new Date().getUTCHours();
const limaHour = new Date().toLocaleString('en-US', {
  timeZone: 'America/Lima',
  hour: 'numeric',
  hour12: false
});

console.log('⏰ Comparación horaria:');
console.log('Hora UTC:', utcHour + ':00');
console.log('Hora Lima:', limaHour + ':00');
console.log('Diferencia:', (parseInt(limaHour) - utcHour), 'horas');
console.log('');

console.log('✅ Si la diferencia es -5 horas, la configuración es correcta.');
console.log('📝 Las fechas ahora deberían registrarse correctamente para la zona horaria de Lima.');