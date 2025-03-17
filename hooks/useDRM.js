import { useEffect, useState, Alert } from "react";
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { API_BASE_URL } from "../config/config";

const useDRM = () => {
  //Definimos los estados que necesitamos por ahora
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /*
   * Realizamos la petición POST a /drm para permitir al user que registre su respuesta al cuestionario
   * Esto se cumplirá si el user ha hecho el onboarding y haya hecho algún registro de sueño en la última semana
   *
   * El objeto data es donde vienen guardadas las respuestas que deseamos mandar a la API
   */

  const saveDrmAnswers = async (data) => {
    setError(false);

    //Creamos una instancia del controller de Axios
    const controller = new AbortController();
    setLoading(true);

    try {
    } catch (error) {
    } finally {
    }
  };

  return { saveDrmAnswers, loading, error };
};

export default useDRM;
