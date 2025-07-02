import React, { useState } from "react";
import { apiClient } from "../services/apiClient";
import { useAuthContext } from "../context/AuthContext";

const useFitbit = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sleepTodayFitbitData, setSleepTodayFitbitData] = useState(null); //Guarda la info del sueño del user del día de hoy
  const [foodFitbitData, setFoodFitbitData] = useState(null); //Guarda la info semanal de la comida del user
  const [sleepWeeklyFitbitData, setSleepWeeklyFitbitData] = useState(null); //Guarda la info semanal de sueño del user
  const [fitbitToken, setFitbitToken] = useState(null); //Guarda el token de fitbit del user

  const { accessToken, userId } = useAuthContext();

  /*
   * ENDPOINT CORRESPONDIENTE AL LOGIN DEL USER DE NUESTRA APP EN FITBIT
   */

  const loginFitbit = async () => {
    setError(null);
    setLoading(true);

    try {
      const response = await apiClient.get(
        `/fitbitAuth/login`,
        {
          userId,
        },
        {
          headers: {
            Authorization: accessToken,
            "Content-Type": "application/json",
          },
        }
      );
      if (response && response.status === 200) setFitbitToken(response.data);
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
      const response = await apiClient.get(`/fitbit/sleep`, {
        headers: {
          Authorization: "ACCESS_TOKEN_VALUE",
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
      const response = await apiClient.get(`/fitbit/food`, {
        headers: {
          Authorization: "ACCESS_TOKEN_VALUE",
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
      const response = await apiClient.get(`/fitbit/sleepWeekly`, {
        headers: {
          Authorization: "ACCESS_TOKEN_VALUE",
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
    getSleepTodayFitbitData,
    getFoodFitbitData,
    getSleepWeeklyFitbitData,
  };
};

export default useFitbit;
