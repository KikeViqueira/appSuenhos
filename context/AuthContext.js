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
  const [modalVisible, setModalVisible] = useState(false); // Controla la visibilidad del modal
  const [modalType, setModalType] = useState(null); // Tipo de modal a mostrar
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
  const [userInfo, setUserInfo] = useState(null); // Estado que guarda la info del user más actualizada que hay en la BD
  const [isAuthLoading, setIsAuthLoading] = useState(true); // Estado para controlar si la autenticación está en curso
  const [isFlagsLoading, setIsFlagsLoading] = useState(false); // Estado para controlar si la sincronización de flags está en curso

  //Función para actualizar el estado del onboarding
  const updateOnboardingStatus = (status) => {
    setOnboardingCompleted(status);
  };

  //Función para mostrar el modal con el tipo específico
  const showModal = (type) => {
    setModalType(type);
    setModalVisible(true);
  };

  //Función para cerrar el modal
  const hideModal = () => {
    setModalVisible(false);
    setModalType(null);
  };

  //Función para limpiar todas las banderas del almacenamiento del dispositivo
  const clearAllFlags = async () => {
    try {
      // Obtener todas las banderas agrupadas del mapa existente
      const groupedFlagKeys = Object.keys(groupedFlagsMap);

      // Lista de banderas adicionales que pueden estar almacenadas
      const additionalFlags = [
        "hasCompletedOnboarding",
        "sleepStart",
        "current_chat_id",
        "preferredTimerDuration",
        "notifications",
      ];

      // Combinar todas las banderas a eliminar
      const flagsToRemove = [...groupedFlagKeys, ...additionalFlags];

      console.log("Limpiando banderas:", flagsToRemove);

      // Eliminamos todas las banderas conocidas
      const removePromises = flagsToRemove.map((key) =>
        AsyncStorage.removeItem(key).catch((error) =>
          console.warn(`Error al eliminar bandera ${key}:`, error)
        )
      );

      await Promise.all(removePromises);

      console.log(
        "✅ Todas las banderas han sido eliminadas del almacenamiento local"
      );
    } catch (error) {
      console.error(
        "❌ Error al limpiar las banderas del almacenamiento:",
        error
      );
    }
  };

  //Función que tiene el mapa de las banderas que se usan en la app en las que guardamos un objeto y no un simple valor
  const groupedFlagsMap = {
    chatId: ["chatId", "expiry_chatId"],
    hasChatToday: ["hasChatToday", "expiry_hasChatToday"],
    reportFlag: ["reportFlag", "expiry_drm_report"],
    tipFlag: ["tipFlag", "expiry_tip_of_the_day"],
    sleepLog: ["sleepLog", "expiry_sleep_log"],
  };

  /*
   * Definimos a la función que se encargará de actualizar el valor de las banderas para que la cache siempre este sincronizada al entrar en la app
   * teniendo en cuenta que se le pasa la respuesta de la api ha dicha función
   *
   */
  const saveFlagsToCache = async (flags) => {
    console.log("Flags recibidas de la API:", flags);

    // Aplanamos la estructura anidada combinando todos los objetos de las secciones (acc es el acumulador y section es el grupo de banderas que estamos procesando actualmente)
    const flatFlags = Object.values(flags).reduce((acc, section) => {
      return { ...acc, ...section };
    }, {}); // {} es el valor inicial del acumulador

    console.log("Flags aplanadas:", flatFlags);

    const groupedFlags = {};
    //hacemos un set para evitar banderas que esten duplicadas
    const usedKeys = new Set();

    //Primero guardamos en el objeto groupedFlags las banderas que vienen de la api y necesitan formar un objeto
    for (const key in groupedFlagsMap) {
      const tempGroup = {};

      //Recorremos el array asociado a esta bandera en el map que hemos hecho arriba
      for (const subKey of groupedFlagsMap[key]) {
        // Solo procesamos la bandera si existe en las flags recibidas
        if (
          // Comprobamos que la propiedad está dentro del objeto
          flatFlags.hasOwnProperty(subKey) &&
          flatFlags[subKey] !== undefined &&
          flatFlags[subKey] !== null
        ) {
          tempGroup[subKey] = flatFlags[subKey]; //Cogemos de las flags aplanadas el valor que nos interesa para esta key
          usedKeys.add(subKey); //Añadimos la key a nuestro set para evitar duplicados
        }
      }

      // Solo guardamos el grupo si tiene al menos una bandera válida
      if (Object.keys(tempGroup).length > 0) {
        groupedFlags[key] = tempGroup;
      }
    }

    //metemos en nuestro objeto ahora las banderas que son simples
    for (const key in flatFlags) {
      if (
        !usedKeys.has(key) &&
        flatFlags[key] !== undefined &&
        flatFlags[key] !== null
      ) {
        groupedFlags[key] = flatFlags[key];
        // Ya no seteamos el onboarding aquí, se settea antes en getUserFlags para mejor timing
      }
    }

    //Recorremos el objeto y vamos guardando las banderas en el AsyncStorage
    for (const key in groupedFlags) {
      const value = groupedFlags[key];
      //Serializamos el valor dependiendo de si lo que vamos a guardar en el AsyncStorage es un objeto o un valor simple
      const serializedValue =
        typeof value === "object" ? JSON.stringify(value) : String(value);
      await AsyncStorage.setItem(key, serializedValue);
    }

    console.log(
      "BANDERAS AGRUPADAS:",
      Object.keys(groupedFlags).filter((key) => groupedFlagsMap[key])
    );
    console.log(
      "BANDERAS SIMPLES:",
      Object.keys(groupedFlags).filter((key) => !groupedFlagsMap[key])
    );
  };

  //Al cargar la app, intentamos cargar el token de la memoria segura
  useEffect(() => {
    const loadAuthData = async () => {
      try {
        //await SecureStore.deleteItemAsync("userAccessToken");
        //await SecureStore.deleteItemAsync("userRefreshToken");
        //await SecureStore.deleteItemAsync("userId");
        //await AsyncStorage.removeItem("hasCompletedOnboarding");
        //await AsyncStorage.setItem("hasCompletedOnboarding", "true");
        //await AsyncStorage.removeItem("hasChatToday");
        //await AsyncStorage.removeItem("current_chat_id");
        //await AsyncStorage.removeItem("chatId");
        //await AsyncStorage.removeItem("sleepStart");
        // await AsyncStorage.removeItem("sleepLog");

        //Estas banderas dependen exclusivamente del dispositivo asi que no se tienen en cuenta para la sincronización
        const userAccessToken = await SecureStore.getItemAsync(
          "userAccessToken"
        );
        const idUser = await SecureStore.getItemAsync("userId");

        console.log(
          "Valores para el token y el id del user: ",
          userAccessToken,
          idUser
        );

        if (userAccessToken && idUser) {
          setAccessToken(userAccessToken);
          setUserId(idUser);
        }
      } catch (error) {
        console.error("Error al cargar los datos del user: ", error);
      } finally {
        // Marcamos que la carga inicial ha terminado
        setIsAuthLoading(false);
      }
    };

    // Iniciamos la carga de los datos de autenticación
    loadAuthData();

    //registramos las funciones para que el interceptor pueda usarlas
    registerForceLogout(logout);
    registerSetAccessToken(setAccessToken);
  }, []);

  //Definimos en un nuevo efecto la llamada a la función de getUser cuando se cambia la variable de userId, accessToken o onboardingCompleted
  useEffect(() => {
    /*
     *CUANDO EL USER HAYA INICIADO SESIÓN Y SE TENGA TANTO EL ID COMO EL TOKEN DE ACCESO
     * SE LLAMA PRIMERO A LA FUNCIÓN DE CLEARALLFLAGS PARA LIMPIAR LAS BANDERAS DEL DISPOSITIVO
     * DESPUÉS SE LLAMA A LA FUNCIÓN DE GETUSERFLAGS PARA RECUPERAR LAS BANDERAS DEL USER Y SINCRONIZAR LA CACHE DEL DISPOSITIVO
     */
    const syncFlags = async () => {
      await clearAllFlags();
      await getUserFlags();
    };

    if (userId && accessToken) {
      syncFlags();
    }
    /**
     * El primer getUser que se llamará será cuando el user se haya logueado y haya completado el onboarding
     * a partir de ahí, cada vez que se actualice el token de acceso (ya sea debido al inicio de sesión o por el refresco del propio token), se llamará a getUser para recuperar la info del user
     * */
    if (userId && accessToken && onboardingCompleted) {
      getUser();
    }
  }, [userId, accessToken, onboardingCompleted]);

  /*
   * Definimos el endpoint por si el user quiere eliminar su cuenta
   * */
  const deleteAccount = async () => {
    setError(null);
    setLoading(true);

    try {
      const response = await apiClient.delete(
        `${API_BASE_URL}/users/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.status === 200) {
        await logout();
      }
      console.log("Cuenta eliminada correctamente: ", response.data);
    } catch (error) {
      setError(error);
      console.error("Error al eliminar la cuenta del user: ", error);
    } finally {
      setLoading(false);
    }
  };

  /*
   * Endpoint que se encargará de recuperar todas las banderas que esten relacionadas con el user para comprobar
   * que en la cache este todo correcto y no haya ningún error
   */

  const getUserFlags = async () => {
    setError(null);
    setLoading(true);
    setIsFlagsLoading(true); // Indicamos que estamos cargando flags

    try {
      //Comprobamos que se ha recuperado la info del secureStorage de manera correcta para poder hacer la petición
      if (!accessToken) throw new Error("No hay token de acceso");
      if (!userId) throw new Error("No hay id de usuario");

      //hacemos la petición get al endpoint de getUser
      const response = await apiClient.get(
        `${API_BASE_URL}/users/${userId}/flags`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.status === 200) {
        console.log("Flags recibidas del servidor:", response.data);

        // PRIMERO: Verificamos si tenemos la bandera de onboarding en la respuesta del servidor
        const flatFlags = Object.values(response.data).reduce(
          (acc, section) => {
            return { ...acc, ...section };
          },
          {}
        );

        // Si tenemos la bandera de onboarding, la actualizamos INMEDIATAMENTE
        if (flatFlags.hasOwnProperty("hasCompletedOnboarding")) {
          const onboardingFromServer =
            flatFlags.hasCompletedOnboarding === "true";
          console.log(
            "🔄 Actualizando onboarding desde servidor:",
            onboardingFromServer
          );
          setOnboardingCompleted(onboardingFromServer);
        }

        // DESPUÉS: Guardamos todas las flags en cache
        await saveFlagsToCache(response.data);
      }
      console.log("Banderas recuperadas del user: ", response.data);
    } catch (error) {
      //Si hay un error, lo guardamos en el estado de error
      setError(error);
      console.error("Error al recuperar las banderas del user: ", error);
    } finally {
      //Desactivamos el estado de carga una vez que la petición ha terminado
      setLoading(false);
      setIsFlagsLoading(false); // Indicamos que terminó la carga de flags
    }
  };

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
      //El useEffect se encargará de llamar a getUserFlags() cuando userId y accessToken estén establecidos
    } catch (error) {
      if (error.response) {
        if (error.response.status !== 403) {
          setError(error);
          console.error("Error en el inicio de sesión: ", error);
        } else {
          // Mostrar modal de error de login
          showModal("loginError");
        }
      }
    } finally {
      setLoading(false);
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
      // Mostrar modal de éxito
      showModal("registrationSuccess");
      return { success: true };
    } catch (error) {
      if (error.response) {
        if (error.response.status !== 409) {
          setError(error);
          console.error("Error al registrar el usuario: ", error);
        } else {
          showModal("emailExists");
        }
      }
      return { success: false, error };
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
    try {
      //Antes de nada navegamos a la pantalla de login para que no se vean eliminaciones por parte del sistema en la UI del user
      //router.push("/(Auth)/sign-in");
      // Limpiar todas las banderas del almacenamiento local
      await clearAllFlags();

      // Limpiar datos de autenticación del SecureStore
      await SecureStore.deleteItemAsync("userAccessToken");
      await SecureStore.deleteItemAsync("userRefreshToken");
      await SecureStore.deleteItemAsync("userId");

      // Limpiar estados en memoria
      setAccessToken(null);
      setUserInfo(null);
      setUserId(null);
      setOnboardingCompleted(null);

      console.log("Logout completado - todos los datos eliminados");
    } catch (error) {
      console.error("Error durante el logout:", error);
    } finally {
      //Navegar a la pantalla de login independientemente de si hubo errores
      router.push("/(Auth)/sign-in");
    }
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
        isAuthLoading,
        isFlagsLoading,
        modalVisible,
        modalType,
        setUserInfo,
        LoginRequest,
        logout,
        setError,
        registerUser,
        getUser,
        updateOnboardingStatus,
        showModal,
        hideModal,
        deleteAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => useContext(AuthContext); //Hook para acceder al contexto
