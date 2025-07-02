//Todas las variables que usemos del archivo .env expo las devuelve como Strings

// Obtener URL base del backend desde .env
const getApiBaseUrl = () => {
  const envUrl = process.env.EXPO_PUBLIC_API_BASE_URL;

  if (envUrl) {
    return envUrl;
  }

  console.warn(
    "⚠️ EXPO_PUBLIC_API_BASE_URL no está definida. Usando localhost por defecto."
  );
  return "http://localhost:8080/api";
};

// Obtener timeout desde .env
const getApiTimeout = () => {
  const envTimeout = process.env.EXPO_PUBLIC_API_TIMEOUT;

  if (envTimeout && !isNaN(envTimeout)) {
    return parseInt(envTimeout);
  }

  // Timeout por defecto: 45 segundos
  return 45000;
};

// Exportaciones simples
export const API_BASE_URL = getApiBaseUrl();
export const API_TIMEOUT = getApiTimeout();

// Para compatibilidad con el código existente
export const CONFIG = {
  API_BASE_URL: API_BASE_URL,
  API_TIMEOUT: API_TIMEOUT,
};

// Log simple para verificar configuración
console.log("🔧 ZzzTime - API URL:", API_BASE_URL);
console.log("🔧 ZzzTime - Timeout:", API_TIMEOUT + "ms");
