import { useEffect, useState, Alert } from "react";
import { apiClient } from "../services/apiClient";
import { API_BASE_URL } from "../config/config";
import { useAuthContext } from "../context/AuthContext";

const useUser = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  //Estado para saber si el usuario ha eliminado la foto de perfil
  //Recuperamos lo que nos interesa del contexto de Auth
  const { userId, accessToken, getUser } = useAuthContext();

  /*
   * Realizamos la petición PATCH a /users para permitir al user cambiar:
   * - Contraseña
   * - Foto de perfil
   */

  const updateUser = async (path, newValue) => {
    setError(null);
    setLoading(true);
    try {
      const response = await apiClient.patch(
        `${API_BASE_URL}/users/${userId}`,
        /*
         * Formato del payload:
         * [
         * {
         *   "op": "replace",
         *   "path": "/password",
         *   "value": "nuevaContraseñaSegura123"
         * },
         * ]
         */
        [
          {
            op: "replace",
            path: path,
            value: newValue,
          },
        ],
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      /*
       * Una vez hemos recuperado la info actualizada del user tenemos que llamar a la función
       * getUser() del contexto de Auth para actualizar el estado del user en la app
       * y así reflejar los cambios en la UI.A no ser que lo que se haya actualizado sea la contraseña
       */
      console.log("User actualizado: ", response.data);
      if (path !== "/password") getUser();
    } catch (error) {
      setError(error);
      console.error("Error al actualizar el usuario: ", error);
    } finally {
      setLoading(false);
    }
  };

  /*
   * Endpoint para permitir al user cambiar su foto de perfil
   */
  const updateProfilePicture = async (file) => {
    setError(null);
    setLoading(true);
    try {
      const response = await apiClient.put(
        `${API_BASE_URL}/users/${userId}/profile-picture`,
        file,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          transformRequest: (data) => data, //Le decimos a axios que no transforme el request
        }
      );
      console.log("Foto de perfil actualizada: ", response.data);
      getUser();
    } catch (error) {
      setError(error);
      console.error("Error al actualizar la foto de perfil: ", error);
      console.log(error.message);
      console.log(error.response?.status, error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  /*
   * Endpoint para permitir al user eliminar su foto de perfil
   */
  const deleteProfilePicture = async () => {
    setError(null);
    setLoading(true);
    try {
      const response = await apiClient.delete(
        `${API_BASE_URL}/users/${userId}/profile-picture`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      console.log("Foto de perfil eliminada: ", response.data);
      getUser();
      //Devolvemos la url del placeholder para settearla en el estado de la app
      return response.data;
    } catch (error) {
      setError(error);
      console.error("Error al eliminar la foto de perfil: ", error);
    } finally {
      setLoading(false);
    }
  };

  return {
    updateUser,
    loading,
    error,
    deleteProfilePicture,
    updateProfilePicture,
  };
};

export default useUser;
