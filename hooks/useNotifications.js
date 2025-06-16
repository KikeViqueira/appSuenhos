import { useState, useEffect } from "react";
import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import useFlags from "./useFlags";
import {
  saveNotificationId,
  getNotificationId,
  removeNotificationId,
} from "../services/handleAsyncNotifications";

// Configuración global de las notificaciones
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const useNotifications = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const { updateConfigFlagValue } = useFlags();

  // Cargar el estado de notificaciones al inicializar
  useEffect(() => {
    loadNotificationSettings();
  }, []);

  // Función para cargar configuración de notificaciones
  const loadNotificationSettings = async () => {
    try {
      const enabled = await AsyncStorage.getItem("notifications");
      setNotificationsEnabled(enabled !== "false"); // Por defecto true si no existe
    } catch (error) {
      console.error("Error cargando configuración de notificaciones:", error);
      setNotificationsEnabled(true); // Fallback
    }
  };

  //Función para activar las notificaciones
  const enableNotifications = async () => {
    try {
      setLoading(true);

      // Verificar permisos
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted") {
        throw new Error("Permisos de notificación denegados");
      }

      // Actualizar estado local
      setNotificationsEnabled(true);

      // Guardar en AsyncStorage
      await AsyncStorage.setItem("notifications", "true");

      // Actualizar en el backend
      await updateConfigFlagValue("notifications", true);

      console.log("✅ Notificaciones activadas");
      return true;
    } catch (error) {
      console.error("Error activando notificaciones:", error);
      // Revertir estado en caso de error
      setNotificationsEnabled(false);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  //Función para desactivar las notificaciones
  const disableNotifications = async () => {
    try {
      setLoading(true);

      // 1. Cancelar todas las notificaciones programadas
      await cancelAllScheduledNotifications();

      // 2. Actualizar estado local
      setNotificationsEnabled(false);

      // 3. Guardar en AsyncStorage
      await AsyncStorage.setItem("notifications", "false");

      // 4. Actualizar en el backend
      await updateConfigFlagValue("notifications", false);

      console.log("🔕 Notificaciones desactivadas y canceladas");
      return true;
    } catch (error) {
      console.error("Error desactivando notificaciones:", error);
      // Revertir estado en caso de error
      setNotificationsEnabled(true);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  //Función para cancelar todas las notificaciones programadas
  const cancelAllScheduledNotifications = async () => {
    try {
      // Obtener todas las notificaciones programadas
      const scheduledNotifications =
        await Notifications.getAllScheduledNotificationsAsync();

      console.log(
        `📱 Cancelando ${scheduledNotifications.length} notificaciones programadas`
      );

      // Cancelar todas las notificaciones
      await Notifications.cancelAllScheduledNotificationsAsync();

      // Limpiar todos los IDs guardados
      await clearAllNotificationIds();

      return scheduledNotifications.length;
    } catch (error) {
      console.error("Error cancelando notificaciones:", error);
      throw error;
    }
  };

  //Función para programar una notificación si las notificaciones están habilitadas
  const scheduleNotificationIfEnabled = async (notificationData) => {
    // Solo programar si las notificaciones están habilitadas
    if (!notificationsEnabled) {
      console.log(
        "🔕 Notificaciones deshabilitadas, no se programará la notificación"
      );
      return null;
    }

    try {
      const notificationId = await Notifications.scheduleNotificationAsync(
        notificationData
      );
      console.log("🔔 Notificación programada:", notificationId);
      return notificationId;
    } catch (error) {
      console.error("Error programando notificación:", error);
      throw error;
    }
  };

  // ===== NUEVAS FUNCIONES PARA MANEJAR NOTIFICACIONES CON ID =====

  /**
   * Programa una notificación y guarda su ID con una clave específica
   * @param {string} key - Clave única para identificar la notificación
   * @param {object} notificationData - Datos de la notificación (content, trigger)
   * @returns {string|null} - ID de la notificación o null si no se programó
   */
  const scheduleNotificationWithId = async (key, notificationData) => {
    if (!notificationsEnabled) {
      console.log(`Notificaciones deshabilitadas, no se programará "${key}"`);
      return null;
    }

    try {
      // Cancelar notificación previa con la misma clave si existe. No hace falta que pongamos el await porque el editor entiendo que no provoca efectos secundarios.
      cancelNotificationById(key);

      // Programar nueva notificación
      const notificationId = await Notifications.scheduleNotificationAsync(
        notificationData
      );

      // Guardar el ID con la clave
      await saveNotificationId(key, notificationId);

      console.log(
        `🔔 Notificación "${key}" programada con ID:`,
        notificationId
      );
      return notificationId;
    } catch (error) {
      console.error(`Error programando notificación "${key}":`, error);
      throw error;
    }
  };

  /**
   * Cancela una notificación específica por su clave
   * @param {string} key - Clave de la notificación a cancelar
   * @returns {boolean} - true si se canceló, false si no existía
   */
  const cancelNotificationById = async (key) => {
    try {
      const notificationId = await getNotificationId(key);

      if (notificationId) {
        await Notifications.cancelScheduledNotificationAsync(notificationId);
        await removeNotificationId(key);
        console.log(`🗑️ Notificación "${key}" cancelada`);
        return true;
      } else {
        console.log(`⚠️ No se encontró notificación con clave "${key}"`);
        return false;
      }
    } catch (error) {
      console.error(`Error cancelando notificación "${key}":`, error);
      throw error;
    }
  };

  /**
   * Verifica si existe una notificación programada con una clave específica
   * @param {string} key - Clave a verificar
   * @returns {boolean} - true si existe, false si no
   */
  const hasScheduledNotification = async (key) => {
    try {
      const notificationId = await getNotificationId(key);
      return !!notificationId; //Devolvemos true si existe, false si no
    } catch (error) {
      console.error(`Error verificando notificación "${key}":`, error);
      return false;
    }
  };

  /**
   * Obtiene todas las notificaciones programadas actualmente
   * @returns {Array} - Lista de notificaciones programadas
   */
  const getAllScheduledNotifications = async () => {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error("Error obteniendo notificaciones programadas:", error);
      return [];
    }
  };

  /**
   * Limpia todos los IDs de notificaciones guardados en AsyncStorage
   * Útil cuando se cancelan todas las notificaciones
   */
  const clearAllNotificationIds = async () => {
    try {
      // Lista de claves conocidas de notificaciones
      const knownNotificationKeys = [
        "WakeUpReminder", //Notificación de recordatorio pasadas 8 horas para hacer el cuestionario de hoy
        "SleepLogNearEnd", //Notificación de recordatorio para decirle al user que se le acaba el tiempo de hacer el cuestionario de hoy
        "DailyTip", //Notificación de recordatorio para decirle al user que se acuerde de generar el tip de hoy pasadas 2 horas
        // Agregar más claves según se vayan creando
      ];

      const removePromises = knownNotificationKeys.map((key) =>
        removeNotificationId(key).catch((error) =>
          console.warn(`Error removiendo clave ${key}:`, error)
        )
      );

      await Promise.all(removePromises);
      console.log("IDs de notificaciones limpiados");
    } catch (error) {
      console.error("Error limpiando IDs de notificaciones:", error);
    }
  };

  return {
    // Estados
    notificationsEnabled,
    loading,

    // Funciones básicas
    enableNotifications,
    disableNotifications,
    cancelAllScheduledNotifications,
    scheduleNotificationIfEnabled,

    // Funciones avanzadas con IDs
    scheduleNotificationWithId,
    cancelNotificationById,
    hasScheduledNotification,
    getAllScheduledNotifications,
    clearAllNotificationIds,
  };
};

export default useNotifications;
