import { useEffect, useState, Alert } from "react";
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { API_BASE_URL } from "../config/config";

const useSound = () => {
  //Definimos los estados iniciales que sabemos que vamos a usar
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  //Estado para guardar los sonidos estáticos que se recuperarán de la API
  const [staticSounds, setSounds] = useState([]);
  //Estado para guardar los sonidos del usuario que se recuperarán de la API
  const [userSounds, setUserSounds] = useState([]);

  /*
   * Función que se encargará de recuperar los sonidos disponibles por defecto en la app para enseñarselos al usuario
   */
  const getAllStaticSounds = async () => {
    setError(null); // Reseteamos el error

    //Creamos una instancia del controllador de aborto para poder cancelar la petición en caso de que sea necesario
    const controller = new AbortController();
    setLoading(true); // Activamos el estado de carga

    //Recuperamos el token del almacenamiento seguro del móvil
    const token = await SecureStore.getItemAsync("userToken");

    try {
      //Hacemos la llamada a la API para recuperar los sonidos estáticos
      const response = await axios.get(`${API_BASE_URL}/sounds`, {
        signal: controller.signal,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setSounds(response.data);
    } catch (error) {
      setError(error); // Guardamos el error en el estado
      console.error("Error al recuperar los sonidos estáticos: ", error);
    } finally {
      setLoading(false); // Desactivamos el estado de carga
    }
  };

  /*
   * Función que se encargará de recuperar los sonidos subidos por el usario en la app
   */
  const getUserSounds = async () => {
    setError(null); // Reseteamos el error

    //Creamos una instancia del controllador de aborto para poder cancelar la petición en caso de que sea necesario
    const controller = new AbortController();
    setLoading(true); // Activamos el estado de carga

    //Recuperamos el token del almacenamiento seguro del móvil y el id del user
    const token = await SecureStore.getItemAsync("userToken");
    const userId = await SecureStore.getItemAsync("userId");

    try {
      //Hacemos la llamada a la API para recuperar los sonidos estáticos
      const response = await axios.get(`${API_BASE_URL}/sounds/${userId}`, {
        signal: controller.signal,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Sonidos del user recuperados:", response.data);

      setUserSounds(response.data);
    } catch (error) {
      setError(error); // Guardamos el error en el estado
      console.error(
        "Error al recuperar los sonidos subidos por el user: ",
        error
      );
    } finally {
      setLoading(false); // Desactivamos el estado de carga
    }
  };

  useEffect(() => {
    console.log("Sonidos del user guardados en el estado: ", userSounds);
  }, [userSounds]);

  /*
   * Función que se encargará de recuperar los sonidos subidos por el usario en la app
   */

  const postSound = async (sound) => {
    setError(null); // Reseteamos el error

    //Creamos una instancia del controllador de aborto para poder cancelar la petición en caso de que sea necesario
    const controller = new AbortController();
    setLoading(true); // Activamos el estado de carga

    //Recuperamos el token del almacenamiento seguro del móvil y el id del user
    const token = await SecureStore.getItemAsync("userToken");
    const userId = await SecureStore.getItemAsync("userId");

    try {
      //Hacemos la llamada a la API para recuperar los sonidos estáticos
      const response = await axios.post(
        `${API_BASE_URL}/sounds/${userId}`,
        {
          sound: sound,
        },
        {
          signal: controller.signal,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Sonido subido a la app:", response.data);
      //Añadimos el sonido subido a los sonidos del user
      setUserSounds((prevSounds) => [...prevSounds, response.data]);
    } catch (error) {
      setError(error); // Guardamos el error en el estado
      console.error("Error al intentar subir el sonido a la app: ", error);
    } finally {
      setLoading(false); // Desactivamos el estado de carga
    }
  };

  /*
   * Creamos la función que representa el endpoint de la API para que el user elimine un sonido de los que ha subido a la app
   */
  const deleteUserSound = async (soundId) => {
    setError(null); // Reseteamos el error

    //Creamos una instancia del controllador de aborto para poder cancelar la petición en caso de que sea necesario
    const controller = new AbortController();
    setLoading(true); // Activamos el estado de carga

    //Recuperamos el token del almacenamiento seguro del móvil y el id del user
    const token = await SecureStore.getItemAsync("userToken");
    const userId = await SecureStore.getItemAsync("userId");

    try {
      //hacemos la llamada al endpoint
      const response = await axios.delete(
        `${API_BASE_URL}/sounds/${userId}/${soundId}`,
        {
          signal: controller.signal,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Sonido eliminado de la app: ", response.data);

      //Tenemos que actualizar el estado que guarda los sonidos que el user ha subido, eliminando a este del array. Esto lo hacemos quedandonos con todos los sonidos que no sean el que acabamos de eliminar
      setUserSounds((prevSounds) => prevSounds.filter((s) => s.id !== soundId));
    } catch (error) {
      setError(error);
      console.error("Error al intentar eliminar el sonido de la app: ", error);
    } finally {
      setLoading(false);
    }
  };

  return {
    staticSounds,
    getAllStaticSounds,
    getUserSounds,
    userSounds,
    postSound,
    deleteUserSound,
    loading,
    error,
  };
};

export default useSound;
