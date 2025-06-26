import { useState, useEffect } from "react";
import { apiClient } from "../services/apiClient";
import { API_BASE_URL } from "../config/config";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuthContext } from "../context/AuthContext";
import {
  getMidnightToday,
  getLocalDateTimeString,
} from "../services/timeHelper";

/*
 * Función para guardar en el AsyncStorage una bandera de si hoy  el user ha generado un tip o no.
 * Función para recuperar la bandera de si hoy el user ha generado un tip o no.
 */

const setDailyTipFlag = async () => {
  try {
    //Creamos el objeto que vamos a guardar en el AsyncStorage
    const data = {
      tipFlag: true,
      expiry_tip_of_the_day: getMidnightToday(),
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
      const { tipFlag, expiry_tip_of_the_day } = JSON.parse(data);
      if (getLocalDateTimeString() > expiry_tip_of_the_day) {
        await AsyncStorage.removeItem("tipFlag");
        return null;
      }
      return tipFlag;
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

  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize, setPageSize] = useState(7);

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
      if (response.status === 200) {
        // Agregar el nuevo tip al principio de la lista (más reciente)
        setTips((prevTips) => [newTip, ...prevTips]);
      }
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
   * Endpoint para recuperar los tips que el usuario tiene asociados a su cuenta con paginación.
   * @param page - Número de página (opcional, por defecto 0)
   * @param size - Tamaño de página (opcional, por defecto 10)
   * @param sortBy - Campo por el que ordenar (opcional, por defecto 'timeStamp')
   * @param direction - Dirección del ordenamiento (opcional, por defecto 'desc')
   * @param append - Si es true, anexa los resultados a los existentes (para scroll infinito)
   */
  const getTips = async (
    page = 0,
    size = 7,
    sortBy = "timeStamp",
    direction = "desc",
    append = false
  ) => {
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
          params: {
            page: page.toString(),
            size: size.toString(),
            sort: sortBy,
            direction: direction,
          },
        }
      );

      if (response.status === 200) {
        const pageData = response.data;

        // Actualizar estados de paginación
        setCurrentPage(pageData.number);
        setTotalPages(pageData.totalPages);
        setTotalElements(pageData.totalElements);
        setPageSize(pageData.size);

        // Actualizar tips según si es append o reemplazo
        if (append && page > 0) {
          setTips((prevTips) => [...prevTips, ...pageData.content]);
        } else {
          setTips(pageData.content);
        }
      }

      if (response.status === 204) {
        // No hay contenido
        setTips([]);
        setCurrentPage(0);
        setTotalPages(0);
        setTotalElements(0);
      }
    } catch (error) {
      if (error.response) {
        if (error.response.status !== 404) {
          setError(error);
          console.error("Error al recuperar los tips: ", error);
        } else {
          //Si el error es 404 significa que el user no tiene tips asociados a su cuenta asi que ponemos los estados en el valor correspondiente
          setTips([]);
          setCurrentPage(0);
          setTotalPages(0);
          setTotalElements(0);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // Función para cargar la siguiente página (útil para scroll infinito)
  const loadNextPage = async () => {
    if (currentPage + 1 < totalPages && !loading) {
      await getTips(currentPage + 1, pageSize, "timeStamp", "desc", true);
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
      if (error.response) {
        if (error.response.status !== 404) {
          setError(error);
          console.error("Error al recuperar el tip: ", error);
        } else setTipSelectedDetail({});
      }
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
        //Eliminamos los tips del estado local
        setTips((prevTips) =>
          prevTips.filter((tip) => !tipIds.includes(tip.id))
        );

        // Actualizar el total de elementos
        setTotalElements((prevTotal) => prevTotal - tipIds.length);

        //TODO: DIRIA QUE ESTO SOBRA COMPLETAMENTE TAL Y COMO ESTA IMPLEMENTADO
        // Si la página actual queda vacía y no es la primera página, ir a la anterior
        const remainingTipsInCurrentPage = tips.filter(
          (tip) => !tipIds.includes(tip.id)
        ).length;
        if (remainingTipsInCurrentPage === 0 && currentPage > 0) {
          await getTips(currentPage - 1, pageSize, "timeStamp", "desc", false);
        }
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
    setTipSelectedDetail,
    favoriteTips,
    getFavoriteTips,
    addFavoriteTip,
    removeFavoriteTip,
    deleteTips,
    currentPage,
    totalPages,
    totalElements,
    pageSize,
    loadNextPage,
  };
};

export default useTips;
