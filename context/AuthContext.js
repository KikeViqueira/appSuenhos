/*
 * Los Contextos en React permiten compartir datos (como el estado de autenticación) a lo largo
 *  de toda la aplicación sin tener que pasar props manualmente a cada componente. Se crean
 *  con React.createContext y se usan mediante un Provider que envuelve la parte de la app
 *  que necesita acceder a esos datos. Luego, en cualquier componente se puede usar el hook
 *  useContext para acceder a ese estado.
 *
 * Guarda y comparte datos globales (por ejemplo, la información del usuario) que deben estar
 * sincronizados en toda la app. Aquí se exponen endpoints o funciones para recuperar esta info.
 *
 * Así evitamos tener que pasar props a través de múltiples componentes para compartir datos y evitamos en definitiva
 * el "prop drilling".
 */
import React, { createContext, useEffect, useState, useContext } from "react";
import { API_BASE_URL } from "../config/config";
import * as SecureStore from "expo-secure-store";
//Importamos los servicios y registramos las funciones para que el interceptor pueda llamarlas
import {
  registerSetAccessToken,
  registerForceLogout,
  updateTokens,
} from "../services/TokenService";
import { apiClient } from "../services/apiClient";
import { router } from "expo-router";
import { hasCompletedOnboarding } from "../services/onboardingService";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [loading, setLoading] = useState(false); // Indica si la petición está en curso
  const [error, setError] = useState(null); // Almacena el error en caso de que ocurra
  /*
   * Estos dos estados los tenemos que hacer para tener la info centralizada en un solo lugar para usarlos en toda la app,
   * lo que guaradamos en el secureStorage sirve para que una vez que se cierra la app no se pierda la info.
   *
   * El accessToken que es el que necesitamos para las llamadas a la API, lo guardamos en memoria (estado) para tener accesso rápido a él
   * y también en el secureStorage por si el user cierra la app antes de que este caduque, asi maximizamos su vida útil.
   *
   * el refreshToken lo guardamos en el secureStorage para que no se pierda una vez que se cierra la app.
   * El id del user aunque se guarde en el secureStorage, también lo guardamos en el estado para tener acceso rápido a él.
   */
  const [userId, setUserId] = useState(null); // Estado que guarda el id del user que se ha registrado en la app
  const [accessToken, setAccessToken] = useState(null); // Estado que guarda el token que recibimos del endpoint del login
  const [onboardingCompleted, setOnboardingCompleted] = useState(null); // Estado que guarda si el user ha completado el cuestionario de onboarding
  const [userInfo, setUserInfo] = useState(null); // Estado que guarda la info del user que se ha logueado en la app

  //Función para actualizar el estado del onboarding
  const updateOnboardingStatus = (status) => {
    setOnboardingCompleted(status);
  };

  //Al cargar la app, intentamos cargar el token de la memoria segura
  useEffect(() => {
    const loadAuthData = async () => {
      try {
        //await SecureStore.deleteItemAsync("userAccessToken");
        //await SecureStore.deleteItemAsync("userRefreshToken");
        //await SecureStore.deleteItemAsync("userId");
        //await AsyncStorage.removeItem("hasCompletedOnboarding");

        const userAccessToken = await SecureStore.getItemAsync(
          "userAccessToken"
        );
        const idUser = await SecureStore.getItemAsync("userId");
        const onboardingStatus = await hasCompletedOnboarding();
        console.log(
          "Valores para el token y el id del user: ",
          userAccessToken,
          idUser,
          onboardingStatus
        );
        if (userAccessToken && idUser) {
          setAccessToken(userAccessToken);
          setUserId(idUser);
        }
        //Se pone fuera del if pq se puede dar el caso de que el user se haya logeado y no haya completado el onboarding
        setOnboardingCompleted(onboardingStatus);
      } catch (error) {
        console.error("Error al cargar los datos del user: ", error);
      }
    };
    loadAuthData();
    //registramos las funciones para que el interceptor pueda usarlas
    registerForceLogout(logout);
    registerSetAccessToken(setAccessToken);
  }, []);

  //Definimos en un nuevo efecto la llamada a la función de getUser cuando se cambia la variable de userId, accessToken o onboardingCompleted
  useEffect(() => {
    /**
     * El primer getUser que se llamará será cuando el user se haya logueado y haya completado el onboarding
     * a partir de ahí, cada vez que se actualice el token de acceso (ya sea debido al inicio de sesión o por el refresco del propio token), se llamará a getUser para recuperar la info del user
     * */
    if (userId && accessToken && onboardingCompleted) getUser();
  }, [userId, accessToken, onboardingCompleted]);

  /*
   * Realizamos la petición POST a /auth/login permitir al user que inicie sesión en la app y obtenga su correspondiente token JWT para poder
   * hacer uso de las funncionalidades de la app
   * Los datos que tenemos que mandar en el payload son los siguientes:
   * email: email del user
   * password: contraseña del user
   */

  //Función para hacer el login
  const LoginRequest = async (email, password) => {
    setError(null); //Limpiamos el estado de error
    setLoading(true);
    try {
      //Hacemos la petición POST al endpoint de Login de la api
      const response = await apiClient.post(`${API_BASE_URL}/auth/login`, {
        email: email,
        password: password,
      });

      //Una vez que hemos recibido los tokens, guardamos el accessToken en el estado
      setAccessToken(response.data.accessToken);
      //Guardamos el refreshToken y el accessToken en la memoria segura para que cuando el user cierre la app y la vuelva a abrir, la app sepa el valor del token
      await updateTokens(response.data.accessToken, response.data.refreshToken);
      //tenemos que guardar también el id del user que se ha creado en la BD en el secureStorage y en el estado para las futuras peticiones
      await SecureStore.setItemAsync("userId", response.data.userId.toString());
      console.log("Usuario logueado correctamente: ", response.data);
      setUserId(response.data.userId.toString());
    } catch (error) {
      setError(error);
      console.error("Error en el inicio de sesión: ", error);
    } finally {
      setLoading(false); //La petición ha terminado
    }
  };

  /*
   * Realizamos la petición POST a /users para permitir al user que cree una cuenta en la app
   * Los datos que tenemos que mandar en el payload son los siguientes:
   * email: email del user
   * name: nombre del user
   * password: contraseña del user
   */

  const registerUser = async (user) => {
    //reiniciamos la bandera de error, por si se ha quedado en un estado anterior debido a la llamada de otro endpoint
    setError(null);
    //Activamos el estado de que la petición está cargando
    setLoading(true);

    try {
      //hacemos la petición POST al endpoint de registro
      const response = await apiClient.post(`${API_BASE_URL}/users`, {
        /*
         * El payload se tiene que corresponder con lo que tenemos en el modelo de datos de User, en este caso los atributos son "email", "name" y "password"
         */
        email: user.email,
        name: user.name,
        password: user.password,
      });
      console.log("Usuario registrado correctamente: ", response.data);
    } catch (error) {
      //Si hay un error, lo guardamos en el estado de error
      setError(error);
      console.error("Error al registrar el usuario: ", error);
    } finally {
      //Desactivamos el estado de carga una vez que la petición ha terminado
      setLoading(false);
    }
  };

  /*
   * Realizamos la petición GET a /users/{idUser} para recuperar la info del user que ha iniciado sesión
   */

  const getUser = async () => {
    //reiniciamos la bandera de error, por si se ha quedado en un estado anterior debido a la llamada de otro endpoint
    setError(null);
    //Activamos el estado de que la petición está cargando
    setLoading(true);

    try {
      //Comprobamos que se ha recuperado la info del secureStorage de manera correcta para poder hacer la petición
      if (!accessToken) throw new Error("No hay token de acceso");
      if (!userId) throw new Error("No hay id de usuario");

      //hacemos la petición get al endpoint de getUser
      const response = await apiClient.get(`${API_BASE_URL}/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      setUserInfo(response.data);
      console.log("Información recuperada del user: ", response.data);
    } catch (error) {
      //Si hay un error, lo guardamos en el estado de error
      setError(error);
      console.error("Error al recuperar la info del user: ", error);
    } finally {
      //Desactivamos el estado de carga una vez que la petición ha terminado
      setLoading(false);
    }
  };

  //Función para cerrar la sesión
  const logout = async () => {
    setAccessToken(null);
    setUserInfo(null);
    setUserId(null);
    await SecureStore.deleteItemAsync("userAccessToken");
    await SecureStore.deleteItemAsync("userRefreshToken");
    await SecureStore.deleteItemAsync("userId");
    //Redirigimos al user a la pantalla de login
    router.push("/(Auth)/sign-in");
  };

  return (
    /*
     * Se pasa todo ese estado y funciones a través del AuthContext.Provider a los componentes hijos, usando la propiedad children (con "c" minúscula)
     *  que representa todo lo que se encuentre dentro del Provider.
     */
    <AuthContext.Provider
      value={{
        accessToken,
        userId,
        onboardingCompleted,
        userInfo,
        loading,
        error,
        LoginRequest,
        logout,
        setError,
        registerUser,
        getUser,
        updateOnboardingStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => useContext(AuthContext); //Hook para acceder al contexto
