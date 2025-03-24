import { useEffect, useState, Alert } from "react";
import { apiClient } from "../services/apiClient";
import * as SecureStore from "expo-secure-store";
import { API_BASE_URL } from "../config/config";
import { useAuthContext } from "../context/AuthContext";

const useSound = () => {
  //Definimos los estados iniciales que sabemos que vamos a usar
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  //Estado para guardar los sonidos estáticos que se recuperarán de la API
  const [staticSounds, setSounds] = useState([]);
  //Estado para guardar los sonidos del usuario que se recuperarán de la API
  const [userSounds, setUserSounds] = useState([]);

  /*
   * Al usarse el hook de useSound dentro de un componente dentro del árbol de componentes de la app
   * podemos usar los estados que están almacenados en el AuthContext para poder hacer las llamadas a la API
   * de una manera más centralizada, rápida y eficiente.
   */
  const { accessToken, userId } = useAuthContext();

  /*
   * Función que se encargará de recuperar los sonidos disponibles por defecto en la app para enseñarselos al usuario
   */
  const getAllStaticSounds = async () => {
    setError(null); // Reseteamos el error
    setLoading(true); // Activamos el estado de carga

    try {
      //Hacemos la llamada a la API para recuperar los sonidos estáticos
      const response = await apiClient.get(`${API_BASE_URL}/sounds`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
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
    setLoading(true); // Activamos el estado de carga

    try {
      //Hacemos la llamada a la API para recuperar los sonidos estáticos
      const response = await axios.get(`${API_BASE_URL}/sounds/${userId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
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
    setLoading(true); // Activamos el estado de carga

    try {
      //Hacemos la llamada a la API para recuperar los sonidos estáticos
      const response = await axios.post(
        `${API_BASE_URL}/sounds/${userId}`,
        {
          name: sound.name,
          source: sound.source,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
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
    setLoading(true); // Activamos el estado de carga

    try {
      //hacemos la llamada al endpoint
      const response = await axios.delete(
        `${API_BASE_URL}/sounds/${userId}/${soundId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
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
