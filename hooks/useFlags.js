import React, { useState } from "react";
import { apiClient } from "../services/apiClient";
import { API_BASE_URL } from "../config/config";
import { useAuthContext } from "../context/AuthContext";

const useFlags = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { accessToken, userId } = useAuthContext();

  /*
   * TENEMOS QUE LLAMAR A LOS ENDPOINT QUE ELIMINAN O MODIFICAN LOS FLAGS
   * TANTO PARA LAS BANDERAS DE CONFIGURACIÓN COMO PARA LAS DIARIAS
   */

  //Endpoints para modificar una bandera de configuración
  const updateConfigFlagValue = async (flagKey, flagValue) => {
    setError(null);
    setLoading(true);
    try {
      const response = await apiClient.put(
        `${API_BASE_URL}/users/${userId}/flags/ConfigurationFlags/${flagKey}`,
        {
          flagValue: flagValue,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.status === 200) return true;
      else {
        throw new Error(
          "Error al actualizar el valor de la bandera de configuración"
        );
      }
    } catch (error) {
      setError(error);
      console.error(
        "Error al actualizar el valor de la bandera de configuración:",
        error
      );
      return false;
    } finally {
      setLoading(false);
    }
  };

  //Endpoints para insertar una bandera diaria o eliminarla de la BD
  const insertDailyFlag = async (flagKey, flagValue) => {
    setError(null);
    setLoading(true);
    try {
      const response = await apiClient.post(
        `${API_BASE_URL}/users/${userId}/flags/DailyFlags/${flagKey}`,
        {
          flagValue: flagValue,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.status === 200) return true;
      else {
        throw new Error("Error al insertar la bandera diaria");
      }
    } catch (error) {
      setError(error);
      console.error("Error al insertar la bandera diaria:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteDailyFlag = async (flagKey) => {
    setError(null);
    setLoading(true);
    try {
      const response = await apiClient.delete(
        `${API_BASE_URL}/users/${userId}/flags/DailyFlags/${flagKey}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.status === 200) return true;
      else {
        throw new Error("Error al eliminar la bandera diaria");
      }
    } catch (error) {
      setError(error);
      console.error("Error al eliminar la bandera diaria:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    insertDailyFlag,
    deleteDailyFlag,
    updateConfigFlagValue,
  };
};

export default useFlags;
