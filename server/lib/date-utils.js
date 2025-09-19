/**
 * Utilidades de fecha para manejar correctamente la zona horaria de Lima, Perú
 */

/**
 * Obtiene la fecha actual en formato YYYY-MM-DD para la zona horaria de Lima (Perú)
 * @returns {string} Fecha en formato YYYY-MM-DD
 */
function todayPeruYMD() {
  try {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Lima',
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit'
    }).format(new Date());
  } catch (e) {
    console.error('Error al obtener fecha de Lima:', e);
    // Fallback: UTC (puede desfasar 1 día en algunos horarios)
    return new Date().toISOString().split('T')[0];
  }
}

/**
 * Convierte cualquier fecha a formato YYYY-MM-DD en zona horaria de Lima
 * @param {Date|string} date - Fecha a convertir
 * @returns {string} Fecha en formato YYYY-MM-DD
 */
function toPeruYMD(date) {
  try {
    const dateObj = date instanceof Date ? date : new Date(date);
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Lima',
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit'
    }).format(dateObj);
  } catch (e) {
    console.error('Error al convertir fecha a Lima:', e);
    return new Date().toISOString().split('T')[0];
  }
}

/**
 * Obtiene el timestamp actual en zona horaria de Lima como datetime
 * @returns {string} Timestamp en formato YYYY-MM-DD HH:MM:SS
 */
function nowPeruTimestamp() {
  try {
    const now = new Date();
    const limaDate = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Lima',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(now);
    
    const limaTime = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'America/Lima',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).format(now);
    
    return `${limaDate} ${limaTime}`;
  } catch (e) {
    console.error('Error al obtener timestamp de Lima:', e);
    return new Date().toISOString().replace('T', ' ').substring(0, 19);
  }
}

module.exports = {
  todayPeruYMD,
  toPeruYMD,
  nowPeruTimestamp
};