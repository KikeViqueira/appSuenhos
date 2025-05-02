import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { API_BASE_URL } from "../config/config";
import {
  updateAccessToken,
  callForceLogout,
  updateTokens,
} from "./TokenService";

// Crear la instancia de axios con la URL base
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // timeout de 10 segundos
});

// Interceptor para manejar errores de autenticación y refresh token
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    // Si el error es 401 o 403 y no hemos intentado hacer refresh
    if (
      (error.response?.status === 401 || error.response?.status === 403) &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        const refreshToken = await SecureStore.getItemAsync("userRefreshToken");
        if (!refreshToken) {
          //Si no hay refresh token, forzar logout
          await callForceLogout();
          return Promise.reject(error);
        }
        // Intentar hacer refresh del token llamando al endpoint de la api
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken: refreshToken,
        });
        console.log("Token refreshed successfully: ", response.data);
        const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
          response.data;
        // Actualizar tokens
        await updateTokens(newAccessToken, newRefreshToken);
        await updateAccessToken(newAccessToken);
        // Actualizar el header de la petición original y reintentarla
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Si falla el refresh, forzar logout
        await callForceLogout();
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export { apiClient };
