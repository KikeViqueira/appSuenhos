import AsyncStorage from "@react-native-async-storage/async-storage";

// ================================
// CONSTANTES DE KEYS
// ================================
const STORAGE_KEYS = {
  // Auth & Onboarding
  ONBOARDING_COMPLETED: "hasCompletedOnboarding",

  // Daily Flags
  CHAT_ID: "chatId",
  HAS_CHAT_TODAY: "hasChatToday",
  REPORT_FLAG: "reportFlag",
  TIP_FLAG: "tipFlag",
  SLEEP_LOG: "sleepLog",
  SLEEP_START: "sleepStart",

  // User Preferences
  NOTIFICATIONS: "notifications",
  PREFERRED_TIMER_DURATION: "preferredTimerDuration",

  // Current Session
  CURRENT_CHAT_ID: "currentChatId",
};

// ================================
// UTILIDADES GENERALES
// ================================

/**
 * Función genérica para obtener un item del AsyncStorage
 * @param {string} key - Clave del item
 * @param {any} defaultValue - Valor por defecto si no existe
 * @returns {Promise<any>}
 */
export const getStorageItem = async (key, defaultValue = null) => {
  try {
    const value = await AsyncStorage.getItem(key);
    return value !== null ? value : defaultValue;
  } catch (error) {
    console.error(`Error al obtener ${key} del AsyncStorage:`, error);
    return defaultValue;
  }
};

/**
 * Función genérica para guardar un item en el AsyncStorage
 * @param {string} key - Clave del item
 * @param {any} value - Valor a guardar
 */
export const setStorageItem = async (key, value) => {
  try {
    await AsyncStorage.setItem(key, String(value));
  } catch (error) {
    console.error(`Error al guardar ${key} en AsyncStorage:`, error);
  }
};

/**
 * Función genérica para eliminar un item del AsyncStorage
 * @param {string} key - Clave del item a eliminar
 */
export const removeStorageItem = async (key) => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error(`Error al eliminar ${key} del AsyncStorage:`, error);
  }
};

/**
 * Función para guardar objeto JSON en AsyncStorage
 * @param {string} key - Clave del item
 * @param {object} data - Objeto a guardar
 */
export const setStorageObject = async (key, data) => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error al guardar objeto ${key} en AsyncStorage:`, error);
  }
};

/**
 * Función para obtener objeto JSON del AsyncStorage
 * @param {string} key - Clave del item
 * @param {object} defaultValue - Valor por defecto
 * @returns {Promise<object>}
 */
export const getStorageObject = async (key, defaultValue = null) => {
  try {
    const value = await AsyncStorage.getItem(key);
    return value !== null ? JSON.parse(value) : defaultValue;
  } catch (error) {
    console.error(`Error al obtener objeto ${key} del AsyncStorage:`, error);
    return defaultValue;
  }
};

// ================================
// FUNCIONES DE ONBOARDING
// ================================

export const hasCompletedOnboarding = async () => {
  const status = await getStorageItem(STORAGE_KEYS.ONBOARDING_COMPLETED);
  return status === "true";
};

export const setOnboardingCompleted = async () => {
  await setStorageItem(STORAGE_KEYS.ONBOARDING_COMPLETED, "true");
};

// ================================
// FUNCIONES DE BANDERAS DIARIAS
// ================================

/**
 * Función helper para crear banderas diarias con expiración
 * @param {string} key - Clave de la bandera
 * @param {any} flagValue - Valor de la bandera
 * @param {Date} expiryDate - Fecha de expiración (opcional)
 */
const setDailyFlag = async (key, flagValue, expiryDate = null) => {
  try {
    const expiry =
      expiryDate ||
      new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        new Date().getDate(),
        23,
        59,
        59,
        999
      );

    const data = {
      [key]: flagValue,
      [`expiry_${key}`]: expiry.getTime(),
    };

    await setStorageObject(key, data);
  } catch (error) {
    console.error(`Error al guardar bandera diaria ${key}:`, error);
  }
};

/**
 * Función helper para obtener banderas diarias con verificación de expiración
 * @param {string} key - Clave de la bandera
 * @returns {Promise<any|null>}
 */
const getDailyFlag = async (key) => {
  try {
    const data = await getStorageObject(key);
    if (data) {
      const flagValue = data[key];
      const expiryTime = data[`expiry_${key}`];

      if (expiryTime && Date.now() > expiryTime) {
        await removeStorageItem(key);
        return null;
      }

      return flagValue;
    }
    return null;
  } catch (error) {
    console.error(`Error al obtener bandera diaria ${key}:`, error);
    return null;
  }
};

// Chat Functions
export const setDailyChatId = async (chatId) => {
  await setDailyFlag("chatId", chatId);
  await setDailyFlag("hasChatToday", true);
};

export const getDailyChatId = async () => {
  return await getDailyFlag("chatId");
};

export const getHasChatToday = async () => {
  return await getDailyFlag("hasChatToday");
};

// Report Functions
export const setDailyReportFlag = async () => {
  await setDailyFlag("reportFlag", true);
};

export const getDailyReportFlag = async () => {
  return await getDailyFlag("reportFlag");
};

// Tip Functions
export const setDailyTipFlag = async () => {
  await setDailyFlag("tipFlag", true);
};

export const getDailyTipFlag = async () => {
  return await getDailyFlag("tipFlag");
};

// Sleep Functions
export const setSleepLogFlag = async () => {
  await setDailyFlag("sleepLog", true);
};

export const getSleepLogFlag = async () => {
  return await getDailyFlag("sleepLog");
};

export const setSleepStart = async (startTime) => {
  const timeString =
    startTime instanceof Date ? startTime.toISOString() : startTime;
  await setStorageItem(STORAGE_KEYS.SLEEP_START, timeString);
};

export const getSleepStart = async () => {
  return await getStorageItem(STORAGE_KEYS.SLEEP_START);
};

export const removeSleepStart = async () => {
  await removeStorageItem(STORAGE_KEYS.SLEEP_START);
};

// ================================
// FUNCIONES DE PREFERENCIAS
// ================================

export const setNotificationsEnabled = async (enabled) => {
  await setStorageItem(STORAGE_KEYS.NOTIFICATIONS, enabled ? "true" : "false");
};

export const getNotificationsEnabled = async () => {
  const value = await getStorageItem(STORAGE_KEYS.NOTIFICATIONS, "true");
  return value === "true";
};

export const setPreferredTimerDuration = async (duration) => {
  await setStorageItem(STORAGE_KEYS.PREFERRED_TIMER_DURATION, duration);
};

export const getPreferredTimerDuration = async () => {
  return await getStorageItem(STORAGE_KEYS.PREFERRED_TIMER_DURATION);
};

export const removePreferredTimerDuration = async () => {
  await removeStorageItem(STORAGE_KEYS.PREFERRED_TIMER_DURATION);
};

// ================================
// FUNCIONES DE SESIÓN ACTUAL
// ================================

export const setCurrentChatId = async (chatId) => {
  await setStorageItem(STORAGE_KEYS.CURRENT_CHAT_ID, chatId);
};

export const getCurrentChatId = async () => {
  return await getStorageItem(STORAGE_KEYS.CURRENT_CHAT_ID);
};

export const removeCurrentChatId = async () => {
  await removeStorageItem(STORAGE_KEYS.CURRENT_CHAT_ID);
};

// ================================
// FUNCIONES DE LIMPIEZA
// ================================

/**
 * Limpia todas las banderas diarias expiradas
 */
export const cleanExpiredFlags = async () => {
  const dailyKeys = [
    STORAGE_KEYS.CHAT_ID,
    STORAGE_KEYS.HAS_CHAT_TODAY,
    STORAGE_KEYS.REPORT_FLAG,
    STORAGE_KEYS.TIP_FLAG,
    STORAGE_KEYS.SLEEP_LOG,
  ];

  for (const key of dailyKeys) {
    await getDailyFlag(key); // Esto limpiará automáticamente las expiradas
  }
};

/**
 * Limpia todos los datos del usuario (logout)
 */
export const clearUserData = async () => {
  const userKeys = [
    STORAGE_KEYS.CHAT_ID,
    STORAGE_KEYS.HAS_CHAT_TODAY,
    STORAGE_KEYS.REPORT_FLAG,
    STORAGE_KEYS.TIP_FLAG,
    STORAGE_KEYS.SLEEP_LOG,
    STORAGE_KEYS.SLEEP_START,
    STORAGE_KEYS.CURRENT_CHAT_ID,
  ];

  for (const key of userKeys) {
    await removeStorageItem(key);
  }
};

/**
 * Obtiene todos los datos de debugging
 */
export const getAllStorageData = async () => {
  const data = {};
  for (const [name, key] of Object.entries(STORAGE_KEYS)) {
    data[name] = await getStorageItem(key);
  }
  return data;
};

export default {
  // Keys
  STORAGE_KEYS,

  // Utilities
  getStorageItem,
  setStorageItem,
  removeStorageItem,
  setStorageObject,
  getStorageObject,

  // Onboarding
  hasCompletedOnboarding,
  setOnboardingCompleted,

  // Daily Flags
  setDailyChatId,
  getDailyChatId,
  getHasChatToday,
  setDailyReportFlag,
  getDailyReportFlag,
  setDailyTipFlag,
  getDailyTipFlag,
  setSleepLogFlag,
  getSleepLogFlag,
  setSleepStart,
  getSleepStart,
  removeSleepStart,

  // Preferences
  setNotificationsEnabled,
  getNotificationsEnabled,
  setPreferredTimerDuration,
  getPreferredTimerDuration,
  removePreferredTimerDuration,

  // Current Session
  setCurrentChatId,
  getCurrentChatId,
  removeCurrentChatId,

  // Cleanup
  cleanExpiredFlags,
  clearUserData,
  getAllStorageData,
};
