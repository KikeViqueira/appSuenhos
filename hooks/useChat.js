import { useEffect, useState, Alert } from "react";
import { apiClient } from "../services/apiClient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "../config/config";
import { useAuthContext } from "../context/AuthContext";

const useChat = () => {
  const [messages, setMessages] = useState([]); // Estado que guarda todos los mensajes
  const [loading, setLoading] = useState(false); // Indica si la petición está en curso
  const [error, setError] = useState(null); // Almacena el error en caso de que ocurra

  const { accessToken, userId } = useAuthContext();

  /*
   * Función para mandar un mensaje a aun chat existente o crear uno nuevo mandando un mensaje
   * La función recibe dos parámetros, la url del endpoint al que se va a hacer la petición
   * y el mensaje que se quiere enviar que tiene que ser coherente con el modelo de datos que espera la API de Message
   */
  const postRequest = async (message) => {
    setError(null);
    setLoading(true);
    try {
      //Agregamos el mensaje del user al estado
      const userMessage = {
        id: Date.now(),
        text: message,
        sender: "user",
      };

      //Agregamos un mensaje temporal de la IA para simular que está escribiendo
      const tempAIMessageId = Date.now() + 1;
      const tempAIMessage = {
        id: tempAIMessageId,
        text: "...",
        sender: "AI",
      };

      // Actualizamos el estado agregando ambos mensajes a la vez
      setMessages((prev) => [...prev, userMessage, tempAIMessage]);

      /*
       * recuperamos el id del chat de hoy almacenado en el AsyncStorage si existe el mensaje se envía a ese chat
       * si no existe se crea un nuevo chat con el mensaje del user y después se guarda el valor del id en el asyncStorage
       * para llamadas futuras
       *
       */
      const chatId = await AsyncStorage.getItem("chatId");

      console.log("chatId: ", chatId);

      //Hacemos la petición POST al endpoint
      const response = await apiClient.post(
        `${API_BASE_URL}/chats/${userId}/${chatId}/messages`,
        {
          /*
           *El payload se tiene que corresponder con lo que tenemos en el modelo de datos de Message, en este caso el atributo se llama "content"
           */
          content: message,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      //Una vez hemos recibido la respuesta de la IA, eliminamos el mensaje temporal de la IA y añadimos el mensaje de la IA
      setMessages((prev) => {
        const tempMessage = prev.filter(
          (message) => message.id !== tempAIMessageId
        );
        return [
          ...tempMessage, //llamamos a la función que nos devuelve el array de mensajes sin el mensaje temporal de la IA
          { id: Date.now() + 2, text: response.data.response, sender: "AI" }, //Añadimos el nuevo objeto mensaje al estado de los mensajes
        ];
      });

      console.log("id del chat que acabamos de crear: ", response.data.id);

      //Tenemos que guardar en el asyncStorage el id del chat que hemos creado hoy, si no estaba guardado ya
      if (!chatId)
        await AsyncStorage.setItem("chatId", response.data.id.toString());
    } catch (error) {
      //Si ocurre un error se elimina el mensaje temporal de la IA y se muestra un mensaje de error
      setMessages((prev) => prev.filter((message) => message.text !== "..."));
      setError(error);
    } finally {
      setLoading(false); //Indicamos que la petición ha terminado
    }
  };

  return { messages, loading, error, postRequest, setMessages };
};

export default useChat;
