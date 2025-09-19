/**
 * Utilidades para manejo de fechas específicamente para Lima, Perú
 * Este archivo centraliza toda la lógica de fechas para evitar inconsistencias
 */

// Zona horaria de Lima, Perú
export const LIMA_TIMEZONE = 'America/Lima';

/**
 * Obtiene la fecha actual en Lima, Perú en formato YYYY-MM-DD
 * @returns {string} Fecha en formato YYYY-MM-DD
 */
export function getTodayLimaYMD(): string {
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
 * Obtiene la fecha y hora actual en Lima, Perú
 * @returns {Date} Objeto Date ajustado a la zona horaria de Lima
 */
export function getNowLima(): Date {
  try {
    // Crear un nuevo Date con la hora actual
    const now = new Date();
    
    // Obtener el offset de Lima en minutos
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
    
    // Construir la fecha de Lima
    const year = parseInt(limaTime.find(part => part.type === 'year')?.value || '0');
    const month = parseInt(limaTime.find(part => part.type === 'month')?.value || '0') - 1; // 0-indexed
    const day = parseInt(limaTime.find(part => part.type === 'day')?.value || '0');
    const hour = parseInt(limaTime.find(part => part.type === 'hour')?.value || '0');
    const minute = parseInt(limaTime.find(part => part.type === 'minute')?.value || '0');
    const second = parseInt(limaTime.find(part => part.type === 'second')?.value || '0');
    
    return new Date(year, month, day, hour, minute, second);
  } catch (error) {
    console.warn('Error obteniendo hora de Lima, usando hora local:', error);
    return new Date();
  }
}

/**
 * Convierte un Date a formato YYYY-MM-DD en zona horaria de Lima
 * @param {Date} date - Fecha a convertir
 * @returns {string} Fecha en formato YYYY-MM-DD
 */
export function dateToLimaYMD(date: Date): string {
  try {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: LIMA_TIMEZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(date);
  } catch (error) {
    console.warn('Error convirtiendo fecha a Lima, usando conversión local:', error);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}

/**
 * Formatea una fecha en formato DD/MM/YYYY para mostrar al usuario peruano
 * @param {string} dateString - Fecha en formato YYYY-MM-DD o ISO
 * @returns {string} Fecha formateada como DD/MM/YYYY
 */
export function formatDateForPeru(dateString?: string): string {
  if (!dateString) return '';
  
  try {
    // Si ya está en formato YYYY-MM-DD, convertir directamente
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      const [year, month, day] = dateString.split('-');
      return `${day}/${month}/${year}`;
    }
    
    // Si es una fecha ISO o otro formato, parsear y formatear
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-PE', {
      timeZone: LIMA_TIMEZONE,
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  } catch (error) {
    console.warn('Error formateando fecha:', error);
    return dateString;
  }
}

/**
 * Convierte una fecha DD/MM/YYYY a formato YYYY-MM-DD
 * @param {string} peruDate - Fecha en formato DD/MM/YYYY
 * @returns {string} Fecha en formato YYYY-MM-DD
 */
export function peruDateToYMD(peruDate: string): string {
  if (!peruDate) return '';
  
  try {
    const [day, month, year] = peruDate.split('/');
    if (day && month && year) {
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
  } catch (error) {
    console.warn('Error convirtiendo fecha peruana:', error);
  }
  
  return peruDate;
}

/**
 * Valida si una fecha está en formato YYYY-MM-DD válido
 * @param {string} dateString - Cadena de fecha a validar
 * @returns {boolean} True si es una fecha válida en formato YYYY-MM-DD
 */
export function isValidYMDDate(dateString: string): boolean {
  if (!dateString || !/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return false;
  }
  
  const date = new Date(dateString + 'T00:00:00');
  return !isNaN(date.getTime()) && dateString === dateToLimaYMD(date);
}

/**
 * Obtiene el inicio y fin del día actual en Lima
 * @returns {object} Objeto con startOfDay y endOfDay en ISO string
 */
export function getTodayLimaBounds(): { startOfDay: string; endOfDay: string } {
  const todayYMD = getTodayLimaYMD();
  const startOfDay = `${todayYMD}T00:00:00`;
  const endOfDay = `${todayYMD}T23:59:59`;
  
  return { startOfDay, endOfDay };
}

/**
 * Calcula la diferencia en días entre dos fechas en zona horaria de Lima
 * @param {string} date1 - Primera fecha (YYYY-MM-DD)
 * @param {string} date2 - Segunda fecha (YYYY-MM-DD)
 * @returns {number} Diferencia en días (positivo si date1 es posterior a date2)
 */
export function daysDifferenceLima(date1: string, date2: string): number {
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