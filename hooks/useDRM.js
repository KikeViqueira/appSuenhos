import { useEffect, useState, Alert } from "react";
import { apiClient } from "../services/apiClient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuthContext } from "../context/AuthContext";
import {
  getMidnightToday,
  getLocalDateTimeString,
} from "../services/timeHelper";

/*
 * Función para guardar en el AsyncStorage una bandera de si hoy el user ha generado un informe o no.
 * Función para recuperar la bandera de si hoy el user ha generado un informe o no.
 */

const setDailyReportFlag = async () => {
  try {
    //Creamos el objeto que vamos a guardar en el AsyncStorage
    const data = {
      reportFlag: true,
      expiry_drm_report: getMidnightToday(),
    };
    await AsyncStorage.setItem("reportFlag", JSON.stringify(data));
  } catch (error) {
    console.error(
      "Error al guardar la bandera de informe en el AsyncStorage: ",
      error
    );
  }
};

export const getDailyReportFlag = async () => {
  try {
    const data = await AsyncStorage.getItem("reportFlag");
    if (data) {
      const { reportFlag, expiry_drm_report } = JSON.parse(data);
      if (getLocalDateTimeString() > expiry_drm_report) {
        //Si ha expirado eliminamos la bandera del AsyncStorage
        await AsyncStorage.removeItem("reportFlag");
        return null;
      }
      return reportFlag;
    }
  } catch (error) {
    console.error(
      "Error al recuperar la bandera de informe del AsyncStorage: ",
      error
    );
    return null;
  }
};

const useDRM = () => {
  //Definimos los estados que necesitamos por ahora
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  //Estado para guardar el informe de hoy
  const [drmToday, setDrmToday] = useState({});

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
        `/users/${userId}/drm`,
        {
          data: data,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      //Llamamos a la función para guardar la bandera de informe en el AsyncStorage
      await setDailyReportFlag();
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
        `/users/${userId}/drm?period=daily`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      //Guardamos el objeto DTO del drmToday en el estado drmToday
      setDrmToday(response.data);
    } catch (error) {
      if (error.response) {
        if (error.response.status !== 404) {
          setError(error);
          console.error(
            "Error al intentar obtener el cuestionario DRM de hoy: ",
            error
          );
          //En caso de que el user intente recuperar el de hoy y se devuelva un 404 porque todavía no la ha hecho, guardamos un objeto vacío en el estado drmToday
        } else setDrmToday({});
      }
    } finally {
      setLoading(false);
    }
  };

  return { saveDrmAnswers, loading, error, getDrmToday, drmToday };
};

export default useDRM;
