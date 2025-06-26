import { format } from "date-fns";

/**
 * Convierte una fecha a formato YYYY-MM-DD'T'HH:mm:ss
 * @param {Date} date - Fecha a formatear
 * @returns {string} Fecha en formato YYYY-MM-DD'T'HH:mm:ss
 */
export const toLocalDateTimeString = (date) => {
  return format(date, "yyyy-MM-dd'T'HH:mm:ss");
};

/**
 * Obtiene la fecha y hora actual en formato YYYY-MM-DD'T'HH:mm:ss
 * @returns {string} Fecha y hora actual en formato YYYY-MM-DD'T'HH:mm:ss
 */
export const getLocalDateTimeString = () => {
  return format(new Date(), "yyyy-MM-dd'T'HH:mm:ss");
};

/**
 * Obtiene solo la fecha en formato YYYY-MM-DD (sin hora)
 * @param {Date} date - Fecha a formatear (opcional, por defecto hoy)
 * @returns {string} Fecha en formato YYYY-MM-DD
 */
export const getLocalDateString = (date = new Date()) => {
  return format(date, "yyyy-MM-dd");
};

/**
 * Obtiene la medianoche del día actual
 * @returns {string} Fecha de medianoche (23:59:59) en formato YYYY-MM-DD'T'HH:mm:ss
 */
export const getMidnightToday = () => {
  const now = new Date();
  const midnight = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    23,
    59,
    59,
    999
  );
  return toLocalDateTimeString(midnight);
};

/**
 * Agrega horas a una fecha
 * @param {Date} date - Fecha base
 * @param {number} hours - Horas a agregar
 * @returns {Date} Nueva fecha con las horas agregadas
 */
export const addHours = (date, hours) => {
  return new Date(date.getTime() + hours * 60 * 60 * 1000);
};

/**
 * Verifica si una fecha está dentro del mismo día
 * @param {Date} date1 - Primera fecha
 * @param {Date} date2 - Segunda fecha (opcional, por defecto hoy)
 * @returns {boolean} True si están en el mismo día
 */
export const isSameDay = (date1, date2 = new Date()) => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};
