/*
 * Los Contextos en React permiten compartir datos (como el estado de autenticación) a lo largo
 *  de toda la aplicación sin tener que pasar props manualmente a cada componente. Se crean
 *  con React.createContext y se usan mediante un Provider que envuelve la parte de la app
 *  que necesita acceder a esos datos. Luego, en cualquier componente se puede usar el hook
 *  useContext para acceder a ese estado.
 */
import React, {
  createContext,
  useEffect,
  useState,
  useContext,
  Children,
} from "react";
import axios from "axios";
import { API_BASE_URL } from "../config/config";
import * as SecureStore from "expo-secure-store";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null); // Estado que guarda el token que recibimos del endpoint del login
  const [loading, setLoading] = useState(false); // Indica si la petición está en curso
  const [error, setError] = useState(null); // Almacena el error en caso de que ocurra

  //Al cargar la app, intentamos cargar el token de la memoria segura
  useEffect(() => {
    const loadToken = async () => {
      try {
        const storedToken = await SecureStore.getItemAsync("userToken");
        if (storedToken) {
          //TODO: LIMPIAMOS SIEMPRE EL TOKEN ANTES DE ENVIAR NADA EN EL LOGIN MIENTRAS ESTAMOS EN DESARROLLO DEL PROYECTO
          SecureStore.deleteItemAsync("userToken");
        }
      } catch (error) {
        console.error("Error al cargar el token: ", error);
      }
    };
    loadToken();
  }, []);

  //Función para hacer el login
  const LoginRequest = async (email, password) => {
    const controller = new AbortController();
    setLoading(true);
    try {
      //Hacemos la petición POST al endpoint de Login de la api
      const response = await axios.post(
        `${API_BASE_URL}/auth/login`,
        {
          email: email,
          password: password,
        },
        {
          signal: controller.signal,
        }
      );

      //Una vez que hemos recibido el token, lo guardamos en el estado
      console.log(response.data.token);
      setToken(response.data.token);

      //Guardamos el token en la memoria segura
      await SecureStore.setItemAsync("userToken", response.data.token);
    } catch (error) {
      setError(error);
      console.error("Error en el inicio de sesión: ", error);
    } finally {
      setLoading(false); //La petición ha terminado
    }
  };

  //Función para cerrar la sesión
  const logout = async () => {
    setToken(null);
    await SecureStore.deleteItemAsync("userToken");
  };

  return (
    /*
     * Se pasa todo ese estado y funciones a través del AuthContext.Provider a los componentes hijos, usando la propiedad children (con "c" minúscula)
     *  que representa todo lo que se encuentre dentro del Provider.
     */
    <AuthContext.Provider
      value={{ token, loading, error, LoginRequest, logout, setError }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => useContext(AuthContext); //Hook para acceder al contexto
