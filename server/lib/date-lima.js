/**
 * Utilidades para manejo de fechas específicamente para Lima, Perú (Backend)
 * Este archivo centraliza toda la lógica de fechas para evitar inconsistencias
 */

// Zona horaria de Lima, Perú (UTC-5, sin horario de verano desde 2016)
const LIMA_TIMEZONE = 'America/Lima';
const LIMA_UTC_OFFSET = '-05:00';

/**
 * Obtiene la fecha actual en Lima, Perú en formato YYYY-MM-DD
 * @returns {string} Fecha en formato YYYY-MM-DD
 */
function getTodayLimaYMD() {
  try {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: LIMA_TIMEZONE,
      year: 'numeric',
      month: '2-digit', 
      day: '2-digit',
    }).format(new Date());
  } catch (error) {
    console.warn('Error obteniendo fecha de Lima, usando fecha local:', error);
    // Fallback: usar fecha local
    return new Date().toISOString().split('T')[0];
  }
}

/**
 * Obtiene la fecha y hora actual en Lima, Perú en formato ISO
 * @returns {string} Fecha y hora en formato ISO ajustado a Lima
 */
function getNowLimaISO() {
  try {
    const now = new Date();
    
    // Obtener componentes de fecha/hora en Lima
    const limaTime = new Intl.DateTimeFormat('en-CA', {
      timeZone: LIMA_TIMEZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).formatToParts(now);
    
    // Construir la fecha ISO
    const year = limaTime.find(part => part.type === 'year')?.value;
    const month = limaTime.find(part => part.type === 'month')?.value;
    const day = limaTime.find(part => part.type === 'day')?.value;
    const hour = limaTime.find(part => part.type === 'hour')?.value;
    const minute = limaTime.find(part => part.type === 'minute')?.value;
    const second = limaTime.find(part => part.type === 'second')?.value;
    
    return `${year}-${month}-${day}T${hour}:${minute}:${second}${LIMA_UTC_OFFSET}`;
  } catch (error) {
    console.warn('Error obteniendo hora de Lima, usando hora local:', error);
    return new Date().toISOString();
  }
}

/**
 * Convierte UTC timestamp a fecha Lima en formato YYYY-MM-DD
 * Para usar en consultas SQL
 * @returns {string} SQL para convertir UTC a fecha de Lima
 */
function getLimaTodaySQLClause() {
  // Usar CONVERT_TZ para convertir UTC a Lima (-05:00)
  return `DATE(CONVERT_TZ(UTC_TIMESTAMP(), '+00:00', '${LIMA_UTC_OFFSET}'))`;
}

/**
 * Obtiene timestamp actual de Lima para MySQL
 * @returns {string} SQL para obtener timestamp actual de Lima
 */
function getLimaNowSQLClause() {
  return `CONVERT_TZ(UTC_TIMESTAMP(), '+00:00', '${LIMA_UTC_OFFSET}')`;
}

/**
 * Valida si una fecha está en formato YYYY-MM-DD válido
 * @param {string} dateString - Cadena de fecha a validar
 * @returns {boolean} True si es una fecha válida en formato YYYY-MM-DD
 */
function isValidYMDDate(dateString) {
  if (!dateString || !/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return false;
  }
  
  const date = new Date(dateString + 'T00:00:00');
  return !isNaN(date.getTime());
}

/**
 * Convierte una fecha local a formato YYYY-MM-DD
 * @param {Date} date - Fecha a convertir
 * @returns {string} Fecha en formato YYYY-MM-DD
 */
function dateToYMD(date) {
  if (!date || !(date instanceof Date)) {
    return getTodayLimaYMD();
  }
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Calcula la diferencia en días entre dos fechas
 * @param {string} date1 - Primera fecha (YYYY-MM-DD)
 * @param {string} date2 - Segunda fecha (YYYY-MM-DD)
 * @returns {number} Diferencia en días (positivo si date1 es posterior a date2)
 */
function daysDifference(date1, date2) {
  try {
    const d1 = new Date(date1 + 'T12:00:00'); // Usar mediodía para evitar problemas de zona horaria
    const d2 = new Date(date2 + 'T12:00:00');
    
    const diffTime = d1.getTime() - d2.getTime();
    return Math.round(diffTime / (1000 * 60 * 60 * 24));
  } catch (error) {
    console.warn('Error calculando diferencia de días:', error);
    return 0;
  }
}

/**
 * Obtiene el primer y último día del mes actual en Lima
 * @returns {object} Objeto con firstDay y lastDay del mes actual
 */
function getCurrentMonthBoundsLima() {
  const today = getTodayLimaYMD();
  const [year, month] = today.split('-');
  const firstDay = `${year}-${month}-01`;
  
  // Calcular último día del mes
  const nextMonth = new Date(parseInt(year), parseInt(month), 1); // Primer día del siguiente mes
  const lastDay = new Date(nextMonth.getTime() - 1); // Último día del mes actual
  const lastDayYMD = dateToYMD(lastDay);
  
  return { firstDay, lastDay: lastDayYMD };
}

module.exports = {
  LIMA_TIMEZONE,
  LIMA_UTC_OFFSET,
  getTodayLimaYMD,
  getNowLimaISO,
  getLimaTodaySQLClause,
  getLimaNowSQLClause,
  isValidYMDDate,
  dateToYMD,
  daysDifference,
  getCurrentMonthBoundsLima
};