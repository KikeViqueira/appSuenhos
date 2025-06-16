import AsyncStorage from "@react-native-async-storage/async-storage";

/*
 * A continuación definimos las funciones para gestionar el id de las notificaciones
 * en el almacenamiento local del dispositivo del user.
 */
export const saveNotificationId = async (key, id) => {
  await AsyncStorage.setItem(key, id);
};

export const getNotificationId = async (key) => {
  return await AsyncStorage.getItem(key);
};

export const removeNotificationId = async (key) => {
  await AsyncStorage.removeItem(key);
};
