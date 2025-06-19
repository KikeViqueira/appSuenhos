import * as SecureStore from "expo-secure-store";

/*
 * Archivo que contiene las funciones para gestionar los tokens de autenticación
 * de una manera más centralizada y reutilizable
 *
 * Y encargado de actualizar el estado del estado de accessToken en el context para tener siempre
 * el valor actualizado.
 */

let setGlobalAccessToken = null;

// Función para registrar la función que actualiza el token en el estado global del contexto
export const registerSetAccessToken = (fn) => {
  setGlobalAccessToken = fn;
};

// Función para actualizar el access token global
export const updateAccessToken = async (newToken) => {
  if (setGlobalAccessToken) await setGlobalAccessToken(newToken);
};

//Función para actualizar el token de acceso y el refresh token en el secureStore
export const updateTokens = async (accessToken, refreshToken) => {
  await SecureStore.setItemAsync("userAccessToken", accessToken);
  await SecureStore.setItemAsync("userRefreshToken", refreshToken);
};

//Registramos la función de logOut para que el interceptor pueda llamarla
let forceLogoutFn = null;

//Registramos la función de logOut del AuthContext
export const registerForceLogout = (fn) => {
  forceLogoutFn = fn;
};

//Función para llamar a logout desde cualquier parte
export const callForceLogout = async () => {
  if (forceLogoutFn) await forceLogoutFn();
};
