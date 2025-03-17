import { useEffect, useState, Alert } from "react";
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { API_BASE_URL } from "../config/config";

const useUser = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /*
   * Realizamos la petición POST a /users para permitir al user que cree una cuenta en la app
   * Los datos que tenemos que mandar en el payload son los siguientes:
   * email: email del user
   * name: nombre del user
   * password: contraseña del user
   */

  const registerUser = async (user) => {
    //reiniciamos las banderas de loading y error, por si se han quedado en un estado anterior debido a la llamada de otro endpoint
    setLoading(false);
    setError(null);

    //Creamos una instancia de AbortController para poder cancelar la petición en caso de que sea necesario
    const controller = new AbortController();
    //Activamos el estado de que la petición está cargando
    setLoading(true);

    try {
      //hacemos la petición POST al endpoint de registro
      const response = await axios.post(
        `${API_BASE_URL}/users`,
        {
          /*
           * El payload se tiene que corresponder con lo que tenemos en el modelo de datos de User, en este caso los atributos son "email", "name" y "password"
           */
          email: user.email,
          name: user.name,
          password: user.password,
        },
        {
          signal: controller.signal,
        }
      );

      //Una vez tenemos la respuesta de la API, guardamos el user en el estado
      console.log("respuesta de la api: ", response.data.Resource);
      setUser(response.data.Resource);

      //tenemos que guardar también el id del user que se ha creado en la BD en el asyncStorage para las futuras peticiones
      await SecureStore.setItemAsync(
        "userId",
        response.data.Resource.id.toString()
      );
    } catch (error) {
      //Si hay un error, lo guardamos en el estado de error
      setError(error);
      console.error("Error al registrar el usuario: ", error);
    } finally {
      //Desactivamos el estado de carga una vez que la petición ha terminado
      setLoading(false);
    }
  };

  return { user, loading, error, registerUser };
};

export default useUser;
