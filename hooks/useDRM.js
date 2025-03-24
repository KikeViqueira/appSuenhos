import { useEffect, useState, Alert } from "react";
import { apiClient } from "../services/apiClient";
import * as SecureStore from "expo-secure-store";
import { API_BASE_URL } from "../config/config";
import { useAuthContext } from "../context/AuthContext";

const useDRM = () => {
  //Definimos los estados que necesitamos por ahora
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  //Estado para guardar el informe de hoy
  const [drmToday, setDrmToday] = useState("");

  //Recuperamos la info del authContext
  const { accessToken, userId } = useAuthContext();

  /*
   * Realizamos la petición POST a /users/{userId}/drm para permitir al user que registre su respuesta al cuestionario
   * Esto se cumplirá si el user ha hecho el onboarding y haya hecho algún registro de sueño en la última semana
   *
   * El objeto data es donde vienen guardadas las respuestas que deseamos mandar a la API
   */

  const saveDrmAnswers = async (data) => {
    setError(null);
    setLoading(true);

    try {
      //Hacemos la petición POST a la API
      const response = await apiClient.post(
        `${API_BASE_URL}/users/${userId}/drm`,
        {
          data: data,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
    } catch (error) {
      setError(error);
      console.error("Error al intentar hacer el cuestionario DRM: ", error);
    } finally {
      setLoading(false);
    }
  };

  const getDrmToday = async () => {
    setError(null);
    setLoading(true);

    try {
      //Hacemos la petición GET a la API
      const response = await apiClient.get(
        `${API_BASE_URL}/users/${userId}/drm?preiod=daily`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      console.log(
        "Respuesta de la API al obtener el cuestionario DRM de hoy: ",
        response.data
      );

      setDrmToday(response.data);
    } catch (error) {
      setError(error);
      console.error(
        "Error al intentar obtener el cuestionario DRM de hoy: ",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  return { saveDrmAnswers, loading, error, getDrmToday, drmToday };
};

export default useDRM;
