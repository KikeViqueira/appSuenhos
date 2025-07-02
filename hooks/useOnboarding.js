import { useState } from "react";
import { apiClient } from "../services/apiClient";
import { useAuthContext } from "../context/AuthContext";

const useOnboarding = () => {
  //Definimos los estados que necesitamos por ahora
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  //Recuperamos la info del authContext
  const { accessToken, userId } = useAuthContext();

  /*
   * Realizamos la petición POST a /onboarding/{userId} para permitir al user que registre su información de onboarding
   */

  const saveOnboardingAnswers = async (data) => {
    setError(null);
    setLoading(true);

    try {
      //hacemos la petición POST al endpoint de registro
      const response = await apiClient.post(
        `/onboarding/${userId}`,
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
      console.error("Error al guardar las respuestas del onboarding: ", error);
    } finally {
      setLoading(false);
    }
  };

  return { saveOnboardingAnswers, loading, error };
};

export default useOnboarding;
