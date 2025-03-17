import { useEffect, useState, Alert } from "react";
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { API_BASE_URL } from "../config/config";

const useOnboarding = () => {
  //Definimos los estados que necesitamos por ahora
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /*
   * Realizamos la petición POST a /onboarding/{userId} para permitir al user que registre su información de onboarding
   */

  const saveOnboardingAnswers = async (data) => {
    //reiniciamos las banderas de loading y error, por si se han quedado en un estado anterior debido a la llamada de otro endpoint
    setLoading(false);
    setError(null);

    //Creamos una instancia de AbortController para poder cancelar la petición en caso de que sea necesario
    const controller = new AbortController();
    //Activamos el estado de que la petición está cargando
    setLoading(true);

    try {
      //tenemos que recuperar el id del user para que la petición sea válida
      const userId = await SecureStore.getItemAsync("userId");

      //recuperamos el token del almacenamiento seguro del movil
      const token = await SecureStore.getItemAsync("userToken");

      //hacemos la petición POST al endpoint de registro
      const response = await axios.post(
        `${API_BASE_URL}/onboarding/${userId}`,
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
    } catch (error) {
      setError(error);
      console.error("Error al guardar las respuestas del onboarding: ", error);
    } finally {
      setLoading(false);
    }
  };

  return { saveOnboardingAnswers, loading, error };
};

export default useOnboarding;
