import { useEffect, useState, Alert } from "react";
import axios from "axios";

const useChat = () => {
  const [messages, setMessages] = useState([]); // Estado que guarda todos los mensajes
  const [loading, setLoading] = useState(false); // Indica si la petición está en curso
  const [error, setError] = useState(null); // Almacena el error en caso de que ocurra

  /*
  Función para mandar un mensaje a aun chat existente o crear uno nuevo mandando un mensaje*

  *La función recibe dos parámetros, la url del endpoint al que se va a hacer la petición 
  *y el mensaje que se quiere enviar que tiene que ser coherente con el modelo de datos que espera la API de Message
  */
  const postRequest = async (url, message) => {
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
      setMessages([...messages, userMessage]);

      //Agregamos un mensaje temporal de la IA para simular que está escribiendo
      const tempAIMessageId = Date.now() + 1;
      const tempAIMessage = {
        id: tempAIMessageId,
        text: "...",
        sender: "AI",
      };

      //Hacemos la petición POST al endpoint
      const response = await axios.post(
        url,
        {
          /*
           *El payload se tiene que corresponder con lo que tenemos en el modelo de datos de Message, en este caso el atributo se llama "content"
           */
          content: message,
        },
        {
          signal: controller.signal,
          auth: {
            username: "admin",
            password: "admin123",
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
          { id: Date.now() + 2, text: response.data, sender: "AI" }, //Añadimos el nuevo objeto mensaje al estado de los mensajes
        ];
      });
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
