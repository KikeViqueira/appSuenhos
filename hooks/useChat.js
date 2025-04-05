import { useEffect, useState, Alert } from "react";
import { apiClient } from "../services/apiClient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "../config/config";
import { useAuthContext } from "../context/AuthContext";

const useChat = () => {
  const [messages, setMessages] = useState([]); // Estado que guarda todos los mensajes
  const [loading, setLoading] = useState(false); // Indica si la petición está en curso
  const [error, setError] = useState(null); // Almacena el error en caso de que ocurra
  const [history, setHistory] = useState([]); // Almacena el historial de chats
  const [isToday, setIsToday] = useState(false); // Bandera que indica si el chat es de hoy o no
  const { accessToken, userId } = useAuthContext();
  /*
   * Funciones internas para guardar el chatId en el AsyncStorage junto a una marca temporal de cuando se ha hecho el chat,
   * y función para recuperar el chatId del AsyncStorage y comprobar si es de hoy o no.
   */

  const setDailyChatId = async (id) => {
    try {
      const now = new Date();
      //Establecemos la expiración del id que es al final del día
      const endOfDay = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        23,
        59,
        59,
        999
      );
      //Creamos el objeto que vamos a guardar en el AsyncStorage
      const data = {
        chatId: id,
        expiry: endOfDay.getTime(),
      };
      await AsyncStorage.setItem("chatId", JSON.stringify(data));
    } catch (error) {
      console.error("Error al guardar el chatId en el AsyncStorage: ", error);
    }
  };

  const getDailyChatId = async () => {
    try {
      const data = await AsyncStorage.getItem("chatId");
      if (data) {
        const { chatId, expiry } = JSON.parse(data);
        //Comprobamos si el tiempo actual es mayor que el tiempo de expiración del chatId
        if (Date.now() > expiry) {
          //Si ha expirado eliminamos el chatId del AsyncStorage
          await AsyncStorage.removeItem("chatId");
          return null;
        }
        return chatId;
      }
    } catch (error) {
      console.error("Error al recuperar el chatId del AsyncStorage: ", error);
      return null;
    }
  };

  /*useEffect(() => {
    AsyncStorage.removeItem("chatId");
  }, []);*/

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
        content: message,
        sender: "USER",
      };

      //Agregamos un mensaje temporal de la IA para simular que está escribiendo
      const tempAIMessageId = Date.now() + 1;
      const tempAIMessage = {
        id: tempAIMessageId,
        content: "...",
        sender: "AI",
      };

      // Actualizamos el estado agregando ambos mensajes a la vez
      setMessages((prev) => [...prev, userMessage, tempAIMessage]);

      /*
       * recuperamos el id del chat de hoy almacenado en el AsyncStorage si existe el mensaje se envía a ese chat
       * si no existe se crea un nuevo chat con el mensaje del user y después se guarda el valor del id con la fecha en la que se ha creado
       * en el asyncStorage (mediante la función setDailyChatId) para llamadas futuras.
       */

      //Recuperamos el chatId del AsyncStorage mediante la función getDailyChatId
      const chatId = await getDailyChatId();

      //Si el id es null sabemos que es el primer mensaje que se manda a ese chat en el día de hoy y por lo tanto es un nuevo chat
      //Lo guardamos en una vraible para llamar después al getHistory y actualizar el historial de chats
      const storedChatId = chatId ? chatId : null;
      console.log("id del chat de hoy: ", storedChatId);

      //Hacemos la petición POST al endpoint
      const response = await apiClient.post(
        `${API_BASE_URL}/chats/${userId}/${chatId ? chatId : null}/messages`,
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
          { id: Date.now() + 2, content: response.data.response, sender: "AI" }, //Añadimos el nuevo objeto mensaje al estado de los mensajes
        ];
      });

      console.log("id del chat que acabamos de crear: ", response.data.id);

      //Una vez creado tenemos que guardar la id y fecha de expiración en el AsyncStorage
      await setDailyChatId(response.data.id.toString());

      //En el caso de que el valor del chatid al hacer la llamada fuese nuelo tenemos que llamar al getHistory para actualizar el historial de chats con este nuevo que se ha creado
      //En caso de que el chat ya existiese pues ya lo tenemos en el historial de chats y no hace falta volver a llamarlo
      if (storedChatId === null) getHistory();
    } catch (error) {
      //Si ocurre un error se elimina el mensaje temporal de la IA y se muestra un mensaje de error
      setMessages((prev) =>
        prev.filter((message) => message.content !== "...")
      );
      setError(error);
    } finally {
      setLoading(false); //Indicamos que la petición ha terminado
    }
  };

  /*
   * Endpoint para recuperar el historial de chats que tiene un user asociados a su id
   */
  const getHistory = async () => {
    setError(null);
    setLoading(true);
    try {
      const response = await apiClient.get(
        `${API_BASE_URL}/users/${userId}/chats`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      //Guardamos el historial de chats en el estado
      setHistory(response.data);
      console.log("Historial de chats recuperado: ", response.data);
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  /*
   * Endpoint para eliminar uno o mas chats de un user a partir de una lista de ids, en este caso se llama ids y se recibe como parámetro
   */
  const deleteChats = async (ids) => {
    setError(null);
    setLoading(true);
    try {
      const response = await apiClient.delete(
        `${API_BASE_URL}/users/${userId}/chats`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          data: {
            ids: ids,
          },
        }
      );
      //Si el delete se ha hecho de manera correcta, se llama a la función getHistory para actualizar el historial de chats
      if (response.status === 200) getHistory();
      else {
        Alert.alert("Error", "No se ha podido eliminar el chat");
      }
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  /*
   * Endpoint para recuperar la conversación de un chat a partir de su id y recuperar una bandera que nos dice
   * si el chat es de hoy o no, para permitir escribir o no en el respectivamente.
   */
  const getConversationChat = async (targetChatId) => {
    setError(null);
    setLoading(true);
    try {
      const response = await apiClient.get(
        `${API_BASE_URL}/users/${userId}/chats/${targetChatId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      //Guardamos el historial de mensajes en el estado
      setMessages(response.data.messages);
      console.log(
        "Mensajes recuperados en el endpoint: ",
        response.data.messages
      );
      //En otro estado tenemos que guardar la bandera de si el chat es de hoy o no, dependiendo del valor de esta sabremos si podemos escribir en el chat o no
      setIsToday(response.data.isEditable);
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  //Funcion para recuperar la conversación del posible chat de hoy al entrar en la pestaña de chat
  const getTodayChat = async () => {
    //Recuperamos el chatId del AsyncStorage mediante la función getDailyChatId
    const chatId = await getDailyChatId();
    //Comprobamos si el chatId existe, si no existe no hacemos nada
    if (chatId) {
      //Llamamos a la función getConversationChat pasándole el chatId
      getConversationChat(chatId);
    }
  };

  return {
    messages,
    loading,
    error,
    postRequest,
    setMessages,
    history,
    getHistory,
    deleteChats,
    getConversationChat,
    isToday,
    getTodayChat,
  };
};

export default useChat;
