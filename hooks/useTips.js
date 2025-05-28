import { useState, useEffect } from "react";
import { apiClient } from "../services/apiClient";
import { API_BASE_URL } from "../config/config";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuthContext } from "../context/AuthContext";

/*
 * Función para guardar en el AsyncStorage una bandera de si hoy  el user ha generado un tip o no.
 * Función para recuperar la bandera de si hoy el user ha generado un tip o no.
 */

const setDailyTipFlag = async () => {
  try {
    const now = new Date();
    //Establecemos la expiración de la bandera
    const endOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      23,
      59,
      59,
      999
    );
    //Creamos el objeto que vamos a guardar en el AsyncStorage
    const data = {
      tipCreated: true,
      expiry: endOfDay.getTime(),
    };
    await AsyncStorage.setItem("tipFlag", JSON.stringify(data));
  } catch (error) {
    console.error(
      "Error al guardar la bandera de tip en el AsyncStorage: ",
      error
    );
  }
};

export const getDailyTipFlag = async () => {
  try {
    const data = await AsyncStorage.getItem("tipFlag");
    if (data) {
      const { tipCreated, expiry } = JSON.parse(data);
      //Comprobamos si el tiempo actual es mayor que el tiempo de expiración del chatId
      if (Date.now() > expiry) {
        //Si ha expirado eliminamos la bandera del AsyncStorage
        await AsyncStorage.removeItem("tipFlag");
        return null;
      }
      return tipCreated;
    }
  } catch (error) {
    console.error(
      "Error al recuperar la bandera de tip del AsyncStorage: ",
      error
    );
    return null;
  }
};

const useTips = () => {
  const [tips, setTips] = useState([]); // Estado que guarda todos los tips
  const [loading, setLoading] = useState(false); // Indica si la petición está en curso
  const [error, setError] = useState(null); // Almacena el error en caso de que ocurra
  const [tipSelectedDetail, setTipSelectedDetail] = useState({}); // Almacena el detalle del tip seleccionado
  const [favoriteTips, setFavoriteTips] = useState([]); // Almacena los tips favoritos del usuario

  const { accessToken, userId } = useAuthContext();

  /*
   * Endpoint que se encarga de generar un tip personalizado para el usuario.
   */
  const generateTip = async () => {
    setError(null);
    setLoading(true);

    try {
      const response = await apiClient.post(
        `${API_BASE_URL}/users/${userId}/tips`,
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      //Una vez creado lo que tenemos que hacer es añadirlo a los tips existentes
      const newTip = response.data;
      if (response.status === 200) setTips((prevTips) => [...prevTips, newTip]);
      //llamamos a la función para guardar la bandera de tip en el AsyncStorage
      await setDailyTipFlag();
    } catch (error) {
      setError(error);
      console.error("Error al generar el tip: ", error);
    } finally {
      setLoading(false);
    }
  };

  /*
   * Endpoint para recuperar los tips que el usario tiene asociados a su cuenta.
   */
  const getTips = async () => {
    setError(null);
    setLoading(true);

    try {
      const response = await apiClient.get(
        `${API_BASE_URL}/users/${userId}/tips`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (response.status === 200) setTips(response.data);
      //En caso de que la respuesta sea 204, es decir, que no hay contenido, lo que significa que el usuario no tiene tips favoritos, lo que significa que el array de tips favoritos se vacía
      if (response.status === 204) setFavoriteTips([]);
    } catch (error) {
      setError(error);
      console.error("Error al recuperar los tips: ", error);
    } finally {
      setLoading(false);
    }
  };

  /*
   * Endpoint para recuperar la información de un tip en concreto a partir de su id.
   */
  const getTipById = async (tipId) => {
    setError(null);
    setLoading(true);

    console.log("Tip del cual queremos recuperar la información: ", tipId);

    try {
      const response = await apiClient.get(
        `${API_BASE_URL}/users/${userId}/tips/${tipId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      //Almacenamos los detalles del tip seleccionado en el estado correspondiente
      if (response.status === 200) setTipSelectedDetail(response.data);
    } catch (error) {
      setError(error);
      console.error("Error al recuperar el tip: ", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log(
      "valor de la bandera de si es favorito o no",
      tipSelectedDetail.isFavorite
    );
  }, [tipSelectedDetail]);

  /*
   * Endpoint para eliminar un tip o varios a partir de sus ids
   */
  const deleteTips = async (tipIds) => {
    setError(null);
    setLoading(true);

    console.log("Ids de los tips que se van a eliminar: ", tipIds);

    try {
      const response = await apiClient.delete(
        `${API_BASE_URL}/users/${userId}/tips`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json", //Indicamos el tipo de contenido que se está enviando
          },
          data: tipIds,
        }
      );
      if (response.status === 200) {
        //Dejamos guardados en el estado aquellos tips que no tengan un id que esté en el array de ids que se han pasado como parámetro para ser eliminados
        setTips((prevTips) =>
          prevTips.filter((tip) => !tipIds.includes(tip.id))
        );
      }
    } catch (error) {
      setError(error);
      console.error("Error al eliminar los tips: ", error);
    } finally {
      setLoading(false);
    }
  };

  /*
   * A continuación se implementan las funcionalidades que gestionan los tips favoritos del usuario.
   * Añadir, eliminar y recuperar los tips favoritos.
   */

  const getFavoriteTips = async () => {
    setError(null);
    setLoading(true);

    try {
      const response = await apiClient.get(
        `${API_BASE_URL}/users/${userId}/favorites-tips`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (response.status === 200) setFavoriteTips(response.data);
      if (response.status === 204) setFavoriteTips([]);
    } catch (error) {
      setError(error);
      console.error("Error al recuperar los tips favoritos: ", error);
    } finally {
      setLoading(false);
    }
  };

  const addFavoriteTip = async (idTip) => {
    setError(null);
    setLoading(true);

    try {
      const response = await apiClient.post(
        `${API_BASE_URL}/users/${userId}/favorites-tips/${idTip}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (response.status === 200) {
        //Actualizamos la lista de tips favortitos en el estado
        setFavoriteTips((prevFavoriteTips) => [
          ...prevFavoriteTips,
          ...response.data, //Añadimos cada objeto tip del array que devuelve la api en el estado array
        ]);
      }
    } catch (error) {
      setError(error);
      console.error("Error al añadir el tip a favoritos: ", error);
    } finally {
      setLoading(false);
    }
  };

  const removeFavoriteTip = async (idTip) => {
    setError(null);
    setLoading(true);

    try {
      const response = await apiClient.delete(
        `${API_BASE_URL}/users/${userId}/favorites-tips/${idTip}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (response.status === 200) {
        //Actualizamos la lista de tips favortitos en el estado, para quedarnos con los que no tienen el id del que se ha eliminado
        setFavoriteTips((prevFavoriteTips) =>
          prevFavoriteTips.filter((tip) => tip.id !== idTip)
        );
        console.log("TIP ELIMINADO DE FAVORITOS: ", idTip);
      }
    } catch (error) {
      setError(error);
      console.error("Error al eliminar el tip de favoritos: ", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("Lista de tips favoritos actualizada: ", favoriteTips);
    console.log(
      "Cantidad de tips favoritos actualizada: ",
      favoriteTips.length
    );
  }, [favoriteTips]);

  return {
    tips,
    loading,
    error,
    generateTip,
    getTips,
    getTipById,
    tipSelectedDetail,
    getFavoriteTips,
    favoriteTips,
    addFavoriteTip,
    removeFavoriteTip,
    deleteTips,
  };
};

export default useTips;
