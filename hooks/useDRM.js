import { useEffect, useState, Alert } from "react";
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { API_BASE_URL } from "../config/config";

const useDRM = () => {
  //Definimos los estados que necesitamos por ahora
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /*
   * Realizamos la petición POST a /users/{userId}/drm para permitir al user que registre su respuesta al cuestionario
   * Esto se cumplirá si el user ha hecho el onboarding y haya hecho algún registro de sueño en la última semana
   *
   * El objeto data es donde vienen guardadas las respuestas que deseamos mandar a la API
   */

  const saveDrmAnswers = async (data) => {
    setError(false);

    console.log(
      "Respuestas del cuestionario DRM recibidas para mandar a la API: ",
      data
    );

    //Creamos una instancia del controller de Axios
    const controller = new AbortController();
    setLoading(true);

    try {
      //Obtenemos el token del usario y su id
      const token = await SecureStore.getItemAsync("userToken");
      const userId = await SecureStore.getItemAsync("userId"); //TODO: hay que tener en cuenta que el userId que tenemos guardado es el del último user que se ha registrado en la app

      //Hacemos la petición POST a la API
      const response = await axios.post(
        `${API_BASE_URL}/users/1/drm`,
        {
          data: data,
        },
        {
          signal: controller.signal,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(
        "Respuesta de la API al hacer el cuestionario DRM: ",
        response.data.reportGenerated
      );
    } catch (error) {
      setError(error);
      console.error("Error al intentar hacer el cuestionario DRM: ", error);
    } finally {
      setLoading(false);
    }
  };

  return { saveDrmAnswers, loading, error };
};

export default useDRM;
