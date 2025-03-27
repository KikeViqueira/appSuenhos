import { useEffect, useState, Alert } from "react";
import { apiClient } from "../services/apiClient";
import * as SecureStore from "expo-secure-store";
import { API_BASE_URL } from "../config/config";
import { useAuthContext } from "../context/AuthContext";

const useUser = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  //Recuperamos lo que nos interesa del contexto de Auth
  const { setUserInfo, userId, accessToken } = useAuthContext();

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
          },
        }
      );

      /*
       * Una vez hemos recuperado la info actualizada dle user, ya que recibimos UserUpdateDTO,
       * actualizamos la variable de userInfo del contexto de Auth para que se haga una nueva llamada
       * al endpoint de recuperar la info del user
       */
      console.log("User actualizado: ", response.data);
      setUserInfo(response.data);
    } catch (error) {
      setError(error);
      console.error("Error al actualizar el usuario: ", error);
    } finally {
      setLoading(false);
    }
  };

  return { updateUser, loading, error };
};

export default useUser;
