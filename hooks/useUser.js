import { useEffect, useState, Alert } from "react";
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { API_BASE_URL } from "../config/config";

const useUser = () => {
  const [userRegister, setUserRegister] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  //Estado para guardar la info del user que ha iniciado sesión
  const [logInUser, setLogInUser] = useState({});

  /*
   * Realizamos la petición POST a /users para permitir al user que cree una cuenta en la app
   * Los datos que tenemos que mandar en el payload son los siguientes:
   * email: email del user
   * name: nombre del user
   * password: contraseña del user
   */

  const registerUser = async (user) => {
    //reiniciamos la bandera de error, por si se ha quedado en un estado anterior debido a la llamada de otro endpoint
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
      setUserRegister(response.data.Resource);

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

  /*
   * Realizamos la petición GET a /users/{idUser} para recuperar la info del user que ha iniciado sesión
   */
  //TODO: DEVOLVER LA ID CREO QUE ES MALA IDEA Y GUARDARLA EN UN ESTADO, SE SUPONE QUE LA PERSONA QUE VA A INICIAR SESIÓN ES LA MISMA QUE SE HA REGISTRADO EN EL DISPOSITIVO

  const getUser = async (userId) => {
    //reiniciamos la bandera de error, por si se ha quedado en un estado anterior debido a la llamada de otro endpoint
    setError(null);

    //Creamos una instancia de AbortController para poder cancelar la petición en caso de que sea necesario
    const controller = new AbortController();
    //Activamos el estado de que la petición está cargando
    setLoading(true);

    //Tenemos que recuperar tanto el token como el id del user que está solicitando la acción
    const token = await SecureStore.getItemAsync("userToken");
    const id = await SecureStore.getItemAsync("userId");

    try {
      //hacemos la petición get al endpoint de getUser
      const response = await axios.get(`${API_BASE_URL}/users/${id}`, {
        signal: controller.signal,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setLogInUser(response.data);
      console.log("Información recuperada del user: ", response.data);
    } catch (error) {
      //Si hay un error, lo guardamos en el estado de error
      setError(error);
      console.error("Error al recuperar la info del user: ", error);
    } finally {
      //Desactivamos el estado de carga una vez que la petición ha terminado
      setLoading(false);
    }
  };

  return { userRegister, loading, error, registerUser };
};

export default useUser;
