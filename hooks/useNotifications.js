import { useState, useEffect } from "react";
import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import useFlags from "./useFlags";

const useNotifications = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const { updateConfigFlagValue } = useFlags();

  const enableNotifications = async () => {
    try {
      setLoading(true);

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

      return scheduledNotifications.length;
    } catch (error) {
      console.error("Error cancelando notificaciones:", error);
      throw error;
    }
  };

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

  return {
    notificationsEnabled,
    loading,
    enableNotifications,
    disableNotifications,
    cancelAllScheduledNotifications,
    scheduleNotificationIfEnabled,
  };
};

export default useNotifications;
