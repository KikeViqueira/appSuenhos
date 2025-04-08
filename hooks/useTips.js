import { useEffect, useState, Alert } from "react";
import { apiClient } from "../services/apiClient";
import { API_BASE_URL } from "../config/config";
import { useAuthContext } from "../context/AuthContext";

const useTips = () => {
  const [tips, setTips] = useState([]); // Estado que guarda todos los tips
  const [loading, setLoading] = useState(false); // Indica si la petición está en curso
  const [error, setError] = useState(null); // Almacena el error en caso de que ocurra
  const [tipSelectedDetail, setTipSelectedDetail] = useState(null); // Almacena el detalle del tip seleccionado
  const [favoriteTips, setFavoriteTips] = useState([]); // Almacena los tips favoritos del usuario

  const { accessToken, userId } = useAuthContext();

  /*
   * Endpoint que se encarga de generar un tip personalizado para el usuario.
   */
  const generateTip = async () => {
    setError(null);
    setLoading(true);

    try {
      const response = apiClient.post(`${API_BASE_URL}/users/${userId}/tips`, {
        Headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      //Una vez creado lo que tenemos que hacer es añadirlo a los tips existentes
      const newTip = response.data;
      setTips((prevTips) => [...prevTips, newTip]);
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
          Headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      setTips(response.data);
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

    try {
      const response = await apiClient.get(
        `${API_BASE_URL}/users/${userId}/tips/${tipId}`,
        {
          Headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      //Almacenamos los detalles del tip seleccionado en el estado correspondiente
      setTipSelectedDetail(response.data);
    } catch (error) {
      setError(error);
      console.error("Error al recuperar el tip: ", error);
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
        `${API_BASE_URL}/users/${userId}/favorite-tips`,
        {
          Headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      setFavoriteTips(response.data);
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
        `${API_BASE_URL}/users/${userId}/favorite-tips/${idTip}`,
        {
          Headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      //Actualizamos la lista de tips favortitos en el estado //TODO: EL CHAT DICE QUE ES MEJOR ESTO A LLAMAR AL GET DE LA API
      setFavoriteTips((prevFavoriteTips) => [
        ...prevFavoriteTips,
        response.data,
      ]);
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
      await apiClient.delete(
        `${API_BASE_URL}/users/${userId}/favorite-tips/${idTip}`,
        {
          Headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      //Actualizamos la lista de tips favortitos en el estado, para quedarnos con los que no tienen el id del que se ha eliminado
      setFavoriteTips((prevFavoriteTips) =>
        prevFavoriteTips.filter((tip) => tip.id !== idTip)
      );
    } catch (error) {
      setError(error);
      console.error("Error al eliminar el tip de favoritos: ", error);
    } finally {
      setLoading(false);
    }
  };

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
  };
};

export default useTips;
