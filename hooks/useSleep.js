import { useEffect, useState, Alert } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiClient } from "../services/apiClient";
import { API_BASE_URL } from "../config/config";
import { useAuthContext } from "../context/AuthContext";

export default function useSleep() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sleepLog, setSleepLog] = useState({});
  const [sleepLogsDuration, setSleepLogsDuration] = useState({});
  //Estado para saber si ha hecho algun cuestionario en los ultimos 7 dias
  const [hasMadeSleepLog, setHasMadeSleepLog] = useState(false);

  const { accessToken, userId } = useAuthContext();

  /*
   * Funciones para guardar si el user ha hecho el registro matutino de sueño y
   * para recuperar el valor de la bandera en el AsyncStorage, el valor de la bandera solo
   * se guarda en el AsyncStorage en el mismo día ya que cada día hay uno nuevo.
   *
   * Las funciones son como la de chat.
   *
   */
  const saveSleepLog = async () => {
    try {
      const now = new Date();
      const endOfDay = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        23,
        59,
        59,
        999
      );
      const data = {
        sleepLog: true,
        expiry_sleep_log: endOfDay.getTime(),
      };
      await AsyncStorage.setItem("sleepLog", JSON.stringify(data));
    } catch (error) {
      console.error("Error al guardar el registro matutino de sueño: ", error);
    }
  };

  const getDailySleepLog = async () => {
    try {
      const storedSleepLog = await AsyncStorage.getItem("sleepLog");
      if (storedSleepLog) {
        const parsedData = JSON.parse(storedSleepLog);
        if (Date.now() > parsedData.expiry_sleep_log) {
          await AsyncStorage.removeItem("sleepLog");
          return null;
        }
        return parsedData.sleepLog;
      }
      return null;
    } catch (error) {
      console.error(
        "Error al recuperar el registro matutino de sueño: ",
        error
      );
      return null;
    }
  };

  /*
   * Endpoint para guardar el registro matutino de sueño
   */
  const createSleepLog = async (sleepLog) => {
    setError(null);
    setLoading(true);

    try {
      // Formatear el objeto sleepLog para enviar a la API
      // Nos aseguramos de que sleepTime sea un string con formato ISO
      let formattedSleepLog = { ...sleepLog };

      // Si sleepTime es un objeto Date, lo convertimos a string ISO
      if (formattedSleepLog.sleepTime instanceof Date) {
        formattedSleepLog.sleepTime = formattedSleepLog.sleepTime
          .toISOString()
          .slice(0, 19);
      }

      // Aseguramos que duration sea un valor numérico
      if (typeof formattedSleepLog.duration === "string") {
        formattedSleepLog.duration = parseInt(formattedSleepLog.duration);
      }

      console.log(
        "Formatted sleep log that is going to be sent to the API: ",
        formattedSleepLog
      );

      const response = await apiClient.post(
        `${API_BASE_URL}/users/${userId}/sleep-logs`,
        {
          data: formattedSleepLog,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200 || response.status === 201) {
        await saveSleepLog();
        // Actualizamos el estado local con el valor más reciente
        setSleepLog(formattedSleepLog);

        // Devolver resultado exitoso
        return {
          success: true,
          message: "Registro de sueño guardado exitosamente",
        };
      }
    } catch (error) {
      console.error("Error al crear el registro matutino de sueño: ", error);
      setError(error);

      // Devolver resultado de fallo
      return {
        success: false,
        error: error.message || "Error desconocido",
      };
    } finally {
      setLoading(false);
    }
  };

  /*
   * Endpoint para recuperar las respuestas al cuestionario matutino de sueño
   * o para recuperar la duración de sueño que el user aha tenido en los últimos 7 días
   */

  const getSleepLogEndpoint = async (param) => {
    setError(null);
    setLoading(true);

    try {
      //En caso de que el param sea null o undefined se le da un valor por defecto que recibe la api, en este caso es 1
      const duration = param || "1";

      const response = await apiClient.get(
        `${API_BASE_URL}/users/${userId}/sleep-logs`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          params: {
            duration: duration,
          },
        }
      );

      if (response.status === 200) {
        //Dependiendo de que param haya mandado el user guardamos la info recibida de una manera u otra
        if (duration === "1") {
          setSleepLog(response.data);
        } else {
          //Si alguno de los valores del mapa que recibimos es distinto de cero, sabemos que el user ha hecho algun cuestionario en los ultimos 7 dias
          if (Object.values(response.data).some((value) => value !== 0)) {
            setHasMadeSleepLog(true);
          }
          setSleepLogsDuration(response.data);
        }
      }
    } catch (error) {
      if (error.response) {
        if (error.response.status !== 404) {
          console.error(
            "Error al recuperar el registro matutino de sueño: ",
            error
          );
        }
      }
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    sleepLog,
    sleepLogsDuration,
    hasMadeSleepLog,
    createSleepLog,
    getSleepLogEndpoint,
    getDailySleepLog,
  };
}
