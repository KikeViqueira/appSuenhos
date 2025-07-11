import React, { useState } from "react";
import { apiClient } from "../services/apiClient";
import { useAuthContext } from "../context/AuthContext";
import * as SecureStore from "expo-secure-store";

const useFitbit = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sleepTodayFitbitData, setSleepTodayFitbitData] = useState(null); //Guarda la info del sueño del user del día de hoy
  const [foodFitbitData, setFoodFitbitData] = useState(null); //Guarda la info semanal de la comida del user
  const [sleepWeeklyFitbitData, setSleepWeeklyFitbitData] = useState(null); //Guarda la info semanal de sueño del user

  /*
   * ENDPOINT CORRESPONDIENTE AL LOGIN DEL USER DE NUESTRA APP EN FITBIT
   */

  const loginFitbit = async (userId) => {
    setError(null);
    setLoading(true);

    try {
      const response = await apiClient.post(
        `/fitbitAuth/login`,
        parseInt(userId), // Enviamos directamente el número, NO un objeto
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (response && response.status === 200) {
        //Guardamos el token de acceso a fitbit en el SecureStore
        await SecureStore.setItemAsync(
          "fitbitAccessToken",
          response.data.accessToken
        );
      }
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  /*
   * HACEMOS LOS ENDPOINTS CORRESPONDIENTES QUE VAN A DEVOLVER LA DATA DEL USER PAARA USAR EN LAS GRÁFICAS DISEÑADAS ESPECIALMENTE PARA ELLOS
   */

  const getSleepTodayFitbitData = async () => {
    setError(null);
    setLoading(true);

    try {
      // Recuperamos el token de Fitbit del SecureStore
      const fitbitToken = await SecureStore.getItemAsync("fitbitAccessToken");

      const response = await apiClient.get(`/fitbit/sleep`, {
        headers: {
          Authorization: `${fitbitToken}`,
          "Content-Type": "application/json",
        },
      });
      if (response && response.status === 200)
        setSleepTodayFitbitData(response.data);
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  const getFoodFitbitData = async () => {
    setError(null);
    setLoading(true);

    try {
      // Recuperamos el token de Fitbit del SecureStore
      const fitbitToken = await SecureStore.getItemAsync("fitbitAccessToken");

      const response = await apiClient.get(`/fitbit/food`, {
        headers: {
          Authorization: `${fitbitToken}`,
          "Content-Type": "application/json",
        },
      });
      if (response && response.status === 200) setFoodFitbitData(response.data);
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  const getSleepWeeklyFitbitData = async () => {
    setError(null);
    setLoading(true);

    try {
      // Recuperamos el token de Fitbit del SecureStore
      const fitbitToken = await SecureStore.getItemAsync("fitbitAccessToken");

      const response = await apiClient.get(`/fitbit/sleepWeekly`, {
        headers: {
          Authorization: `${fitbitToken}`,
          "Content-Type": "application/json",
        },
      });
      if (response && response.status === 200)
        setSleepWeeklyFitbitData(response.data);
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    sleepTodayFitbitData,
    foodFitbitData,
    sleepWeeklyFitbitData,
    loginFitbit,
    getSleepTodayFitbitData,
    getFoodFitbitData,
    getSleepWeeklyFitbitData,
  };
};

export default useFitbit;
