import { useEffect, useState, Alert } from "react";
import { apiClient } from "../services/apiClient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "../config/config";
import { useAuthContext } from "../context/AuthContext";

const CURRENT_MESSAGES_KEY = "current_chat_messages";
const CURRENT_CHAT_EDITABLE_KEY = "current_chat_editable";

const useChat = () => {
  const [messages, setMessages] = useState([]); // Estado que guarda todos los mensajes
  const [loading, setLoading] = useState(false); // Indica si la petición está en curso
  const [error, setError] = useState(null); // Almacena el error en caso de que ocurra
  const [history, setHistory] = useState([]); // Almacena el historial de chats
  const [isToday, setIsToday] = useState(false); // Bandera que indica si el chat es de hoy o no
  const [isAiWriting, setIsAiWriting] = useState(false); // Estado para controlar cuando la IA está escribiendo
  const { accessToken, userId } = useAuthContext();
  const [last3MonthsChats, setLast3MonthsChats] = useState([]); // Almacena los chats de los últimos tres meses

  // Al iniciar el componente, recuperamos los mensajes del AsyncStorage
  useEffect(() => {
    /**
     * Esta función se encarga de cargar los mensajes y el estado de edición guardados en AsyncStorage.
     *
     * ¿Por qué necesitamos guardar los mensajes en AsyncStorage?
     *
     * 1. Problema de persistencia entre navegaciones:
     *    - En React Native, cuando navegamos entre pantallas, los estados se reinician al volver a montar los componentes
     *    - Si el usuario navega a la pantalla de historial y luego regresa, los mensajes se perderían sin esta persistencia
     *
     * 2. Problema con la carga del chat:
     *    - La API devuelve correctamente los mensajes, pero el sistema de navegación puede causar que el estado de mensajes
     *      se reinicie cuando el usuario regresa a la pantalla de chat desde el historial
     *    - Al guardar en AsyncStorage, garantizamos que los mensajes persistan independientemente de si la navegación
     *      reinicia el estado del componente
     *
     * 3. Experiencia de usuario:
     *    - El usuario espera que los mensajes permanezcan visibles cuando regresa a la pantalla de chat
     *    - Sin esta persistencia, la conversación se mostraría vacía cada vez que el usuario regresa, lo que resulta confuso
     *
     * 4. Optimización de rendimiento:
     *    - Evitamos hacer llamadas innecesarias a la API cada vez que el usuario navega entre pantallas
     *    - Los mensajes se cargan desde el almacenamiento local mucho más rápido que hacer una petición al servidor
     */
    const loadSavedMessages = async () => {
      try {
        const savedMessagesJson = await AsyncStorage.getItem(
          CURRENT_MESSAGES_KEY
        );
        const savedIsEditable = await AsyncStorage.getItem(
          CURRENT_CHAT_EDITABLE_KEY
        );

        if (savedMessagesJson) {
          const savedMessages = JSON.parse(savedMessagesJson);
          console.log("Recuperando mensajes guardados:", savedMessages.length);
          setMessages(savedMessages);
        }

        if (savedIsEditable) {
          setIsToday(savedIsEditable === "true");
          console.log(
            "Recuperando estado editable guardado:",
            savedIsEditable === "true"
          );
        }
      } catch (error) {
        console.error("Error al cargar mensajes guardados:", error);
      }
    };

    loadSavedMessages();
  }, []);

  // Cada vez que cambian los mensajes o isToday, los guardamos en AsyncStorage
  useEffect(() => {
    /**
     * Esta función guarda el estado actual (mensajes y estado editable) en AsyncStorage.
     *
     * ¿Cuándo y por qué guardamos el estado?
     *
     * 1. Sincronización automática:
     *    - Cada vez que los mensajes o el estado editable cambian, guardamos estos cambios inmediatamente
     *    - Esto garantiza que siempre tengamos la versión más reciente de la conversación
     *
     * 2. Respaldo ante cierres inesperados:
     *    - Si la aplicación se cierra inesperadamente, los datos ya estarán guardados
     *    - Al volver a abrir la app, se cargará el último estado conocido
     *
     * 3. Navegación fluida:
     *    - Cuando el usuario navega entre pantallas, el estado ya está guardado
     *    - Esto permite una experiencia sin interrupciones al volver a la pantalla de chat
     *
     * 4. Consistencia de datos:
     *    - Mantenemos sincronizados los mensajes mostrados con lo que se ha guardado
     *    - Esto evita confusiones donde la interfaz muestra algo diferente a lo guardado
     */
    const saveCurrentState = async () => {
      try {
        if (messages.length > 0) {
          await AsyncStorage.setItem(
            CURRENT_MESSAGES_KEY,
            JSON.stringify(messages)
          );
          console.log("Guardando mensajes en AsyncStorage:", messages.length);
        }

        await AsyncStorage.setItem(CURRENT_CHAT_EDITABLE_KEY, String(isToday));
        console.log("Guardando estado editable en AsyncStorage:", isToday);
      } catch (error) {
        console.error("Error al guardar estado actual:", error);
      }
    };

    saveCurrentState();
  }, [messages, isToday]);

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
    setIsAiWriting(true); // Indicamos que la IA está escribiendo
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
            "Content-Type": "application/json",
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

      if (response.status === 200) {
        //Una vez creado tenemos que guardar la id y fecha de expiración en el AsyncStorage
        await setDailyChatId(response.data.id.toString());

        //En el caso de que el valor del chatid al hacer la llamada fuese nuelo tenemos que actualizar el historial de chats con este nuevo que se ha creado
        //En caso de que el chat ya existiese pues ya lo tenemos en el historial de chats y no hace falta meterlo
        if (storedChatId === null) {
          setHistory((prev) => [...prev, response.data]);
        }
      }
    } catch (error) {
      //Si ocurre un error se elimina el mensaje temporal de la IA y se muestra un mensaje de error
      setMessages((prev) =>
        prev.filter((message) => message.content !== "...")
      );
      setError(error);
      console.error("Error al enviar mensaje:", error);
    } finally {
      setLoading(false); //Indicamos que la petición ha terminado
      setIsAiWriting(false); // Indicamos que la IA ha terminado de escribir
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
            "Content-Type": "application/json",
          },
        }
      );
      //Guardamos el historial de chats en el estado
      if (response.status === 200) setHistory(response.data);
      console.log("Historial de chats recuperado: ", response.data);
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Endpoint para recuperar los chats que ha hecho el user en los últimos tres meses
   * Para tener esta funcionalidad se le pasa un parámetro filter con valor last3Months al endpoint
   */
  const getLast3MonthsChats = async () => {
    setError(null);
    setLoading(true);

    try {
      const response = await apiClient.get(
        `${API_BASE_URL}/users/${userId}/chats`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          params: {
            filter: "last3Months",
          },
        }
      );
      //Guardamos estos chats en el estado correspondiente
      if (response.status === 200) setLast3MonthsChats(response.data);
      console.log("Historial de chats recuperado: ", response.data);
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  /*
   * Endpoint para eliminar uno o mas chats de un user a partir de una lista de ids, en este caso se llama ids y se recibe como parámetro
   *
   * Características especiales:
   * 1. Además de eliminar los chats en el servidor, actualiza el estado local
   * 2. Si el chat de hoy está entre los chats a eliminar, también:
   *    - Elimina la referencia al chatId del día actual en AsyncStorage
   *    - Limpia los mensajes almacenados localmente
   *    - Resetea el estado de la conversación actual
   *    Esto es crucial para evitar inconsistencias donde el usuario elimina un chat
   *    pero la app sigue mostrando sus mensajes o intentando enviar mensajes a un chat ya eliminado.
   */
  const deleteChats = async (ids) => {
    setError(null);
    setLoading(true);
    try {
      // Verificamos si el chat de hoy está entre los chats que se van a eliminar
      const currentChatId = await getDailyChatId();
      const isDeletingTodaysChat =
        currentChatId && ids.includes(parseInt(currentChatId));

      console.log("¿Eliminando chat de hoy?", isDeletingTodaysChat);

      const response = await apiClient.delete(
        `${API_BASE_URL}/users/${userId}/chats`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json", //Indicamos el tipo de contenido que se está enviando
          },
          /*
           * En este caso usamos data y se envía el contenido de la petición desde aquí
           * ya que es el formato que espera axios para enviar un body en una petición DELETE
           */
          data: ids,
        }
      );

      //Si el delete se ha hecho de manera correcta
      if (response.status === 200) {
        // Actualizamos el estado eliminando los chats borrados
        setHistory((prev) => prev.filter((chat) => !ids.includes(chat.id)));

        // Si el chat de hoy está entre los chats eliminados, limpiamos toda la información relacionada
        if (isDeletingTodaysChat) {
          console.log(
            "El chat de hoy ha sido eliminado. Limpiando referencias en AsyncStorage..."
          );

          // Limpiar el chatId del día actual
          await AsyncStorage.removeItem("chatId");

          // Limpiar los mensajes y el estado actual
          await AsyncStorage.removeItem(CURRENT_MESSAGES_KEY);
          await AsyncStorage.removeItem(CURRENT_CHAT_EDITABLE_KEY);

          // Resetear los estados en memoria
          setMessages([]);
          setIsToday(true);

          console.log("Referencias del chat de hoy eliminadas correctamente");
        }
      } else {
        Alert.alert("Error", "No se ha podido eliminar el chat");
      }
    } catch (error) {
      console.error("Error al eliminar chats:", error.response || error);
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
      console.log("Recuperando conversación para chat ID:", targetChatId);

      if (!targetChatId) {
        console.error("ID de chat no válido:", targetChatId);
        throw new Error("ID de chat no válido");
      }

      const response = await apiClient.get(
        `${API_BASE_URL}/users/${userId}/chats/${targetChatId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200 && response.data) {
        console.log(
          "Respuesta de la API para chat ID",
          targetChatId,
          ":",
          response.data
        );

        // Guardamos datos en variables temporales
        const chatEditable = response.data.isEditable || false;
        let chatMessages = [];

        if (response.data.messages && Array.isArray(response.data.messages)) {
          chatMessages = response.data.messages;
          console.log("Total de mensajes recuperados:", chatMessages.length);
        } else {
          console.error(
            "No se encontraron mensajes en la respuesta o formato incorrecto"
          );
        }

        // Guardamos en AsyncStorage antes de actualizar los estados
        if (chatMessages.length > 0) {
          await AsyncStorage.setItem(
            CURRENT_MESSAGES_KEY,
            JSON.stringify(chatMessages)
          );
        }
        await AsyncStorage.setItem(
          CURRENT_CHAT_EDITABLE_KEY,
          String(chatEditable)
        );

        // Actualizamos los estados
        setIsToday(chatEditable);
        setMessages(chatMessages);
        console.log("Chat editable:", chatEditable);

        // También guardamos el chatId en el AsyncStorage si es editable/de hoy
        if (chatEditable) {
          await setDailyChatId(targetChatId.toString());
        }

        return true;
      } else {
        console.error("Error en respuesta:", response.status);
        throw new Error(`Error en la respuesta: ${response.status}`);
      }
    } catch (error) {
      console.error("Error al recuperar conversación:", error);
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  //Funcion para recuperar la conversación del posible chat de hoy al entrar en la pestaña de chat
  const getTodayChat = async () => {
    try {
      // Establecemos isToday a true por defecto para permitir crear un nuevo chat
      setIsToday(true);

      //Recuperamos el chatId del AsyncStorage mediante la función getDailyChatId
      const chatId = await getDailyChatId();

      console.log("ID de chat recuperado del almacenamiento local:", chatId);

      //Comprobamos si el chatId existe, si no existe permitimos crear uno nuevo
      if (chatId) {
        try {
          //Llamamos a la función getConversationChat pasándole el chatId
          await getConversationChat(chatId);
          console.log("Chat de hoy cargado correctamente");
        } catch (error) {
          console.error("Error al cargar el chat de hoy:", error);
          // Si hay error al cargar, limpiamos los mensajes y permitimos crear un nuevo chat
          setMessages([]);
          setIsToday(true);
          // Limpiamos el chatId del storage ya que parece que no es válido
          await AsyncStorage.removeItem("chatId");
        }
      } else {
        // No hay chat para hoy, simplemente mostramos la interfaz vacía
        setMessages([]);
        console.log(
          "No hay chat guardado para hoy, permitiendo crear uno nuevo"
        );
      }
    } catch (error) {
      console.error("Error general al recuperar chat de hoy:", error);
      // En caso de error general, configuramos para que el usuario pueda crear un nuevo chat
      setMessages([]);
      setIsToday(true);
    }
  };

  /**
   * Función para limpiar los mensajes actuales y resetear el estado del chat
   *
   * Casos de uso:
   * 1. Cuando el usuario cierra sesión para evitar que otro usuario vea sus conversaciones
   * 2. Cuando queremos forzar una nueva carga del chat desde el servidor
   * 3. Si hay problemas con el chat actual y queremos reiniciar su estado
   * 4. Como función de "nuevo chat" si queremos permitir al usuario empezar de cero
   */
  const clearCurrentChat = async () => {
    try {
      // Limpiar mensajes del AsyncStorage
      await AsyncStorage.removeItem(CURRENT_MESSAGES_KEY);
      await AsyncStorage.removeItem(CURRENT_CHAT_EDITABLE_KEY);

      // También podemos limpiar el chatId si queremos forzar la creación de un nuevo chat
      await AsyncStorage.removeItem("chatId");

      // Resetear los estados en memoria
      setMessages([]);
      setIsToday(true); // Permitimos que se pueda escribir
      setIsAiWriting(false); // Por si había una operación pendiente

      console.log("Chat actual limpiado correctamente");
      return true;
    } catch (error) {
      console.error("Error al limpiar chat actual:", error);
      return false;
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
    getLast3MonthsChats,
    last3MonthsChats,
    isAiWriting,
    clearCurrentChat,
  };
};

export default useChat;
