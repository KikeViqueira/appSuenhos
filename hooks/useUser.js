import { useState } from "react";
import { apiClient } from "../services/apiClient";
import { useAuthContext } from "../context/AuthContext";

const useUser = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
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
        `/users/${userId}`,
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
      if (path !== "/password") getUser();
      setLoading(false);
      return false;
    } catch (error) {
      // Si es un error 400 y estamos cambiando la contraseña, es porque la contraseña anterior es incorrecta
      if (error.response?.status === 400 && path === "/password") {
        return true;
      } else {
        setError(error);
        console.error("Error al actualizar el usuario: ", error);
        setLoading(false);
        return false;
      }
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
        `/users/${userId}/profile-picture`,
        file,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          transformRequest: (data) => data, //Le decimos a axios que no transforme el request
        }
      );
      getUser();
    } catch (error) {
      setError(error);
      console.error("Error al actualizar la foto de perfil: ", error);
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
        `/users/${userId}/profile-picture`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
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
