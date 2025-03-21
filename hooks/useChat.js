import { useEffect, useState, Alert } from "react";
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { API_BASE_URL } from "../config/config";

const useChat = () => {
  const [messages, setMessages] = useState([]); // Estado que guarda todos los mensajes
  const [loading, setLoading] = useState(false); // Indica si la petición está en curso
  const [error, setError] = useState(null); // Almacena el error en caso de que ocurra

  /*
  Función para mandar un mensaje a aun chat existente o crear uno nuevo mandando un mensaje*

  *La función recibe dos parámetros, la url del endpoint al que se va a hacer la petición 
  *y el mensaje que se quiere enviar que tiene que ser coherente con el modelo de datos que espera la API de Message
  */
  const postRequest = async (message) => {
    //Creamos una instancia de AbortController para poder cancelar la petición en caso de que sea necesario
    const controller = new AbortController();
    //Activamos el estado de que la petición está cargando
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

      //recuperamos el token del almacenamiento seguro del movil y el id del chat de hoy
      const token = await SecureStore.getItemAsync("userToken");
      console.log("token: ", token);
      const chatId = await SecureStore.getItemAsync("chatId");

      console.log("chatId: ", chatId);

      //Hacemos la petición POST al endpoint
      const response = await axios.post(
        `${API_BASE_URL}/chats/1/${chatId}/messages`,
        {
          /*
           *El payload se tiene que corresponder con lo que tenemos en el modelo de datos de Message, en este caso el atributo se llama "content"
           */
          content: message,
        },
        {
          signal: controller.signal,
          headers: {
            Authorization: `Bearer ${token}`,
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

      //Tenemos que guardar en el secureStore el id del chat que hemos creado hoy, si no estaba guardado ya
      if (!chatId) {
        SecureStore.setItemAsync("chatId", response.data.id.toString());
      }
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
