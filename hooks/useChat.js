import { useEffect, useState } from "react";
import { Alert } from "react-native";
import { apiClient } from "../services/apiClient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "../config/config";
import { useAuthContext } from "../context/AuthContext";
import {
  getMidnightToday,
  getLocalDateTimeString,
} from "../services/timeHelper";

const CURRENT_CHAT_ID_KEY = "current_chat_id";

/*
 * Funciones internas para guardar el chatId en el AsyncStorage junto a una marca temporal de cuando se ha hecho el chat,
 * y función para recuperar el chatId del AsyncStorage y comprobar si es de hoy o no.
 */

const setDailyChatId = async (id) => {
  try {
    //Creamos el objeto que vamos a guardar en el AsyncStorage
    const data = {
      chatId: id.toString(),
      expiry_chatId: getMidnightToday(),
    };
    await AsyncStorage.setItem("chatId", JSON.stringify(data));
    //Tenemos que crear bandera de si el user ha hecho un chat en el día de hoy o no
    //Cremaos el objeto de la misma manera
    const hasChatToday = {
      hasChatToday: true,
      expiry_hasChatToday: getMidnightToday(),
    };

    await AsyncStorage.setItem("hasChatToday", JSON.stringify(hasChatToday));
  } catch (error) {
    console.error("Error al guardar el chatId en el AsyncStorage: ", error);
  }
};

const getDailyChatId = async () => {
  try {
    const data = await AsyncStorage.getItem("chatId");

    if (data) {
      const { chatId, expiry_chatId } = JSON.parse(data);

      //Comprobamos si el tiempo actual es mayor que el tiempo de expiración del chatId
      if (getLocalDateTimeString() > expiry_chatId) {
        //Si ha expirado eliminamos el chatId del AsyncStorage
        await AsyncStorage.removeItem("chatId");
        return null;
      }
      return chatId;
    }
    return null; // Si no hay datos, devolvemos null
  } catch (error) {
    console.error("Error al recuperar el chatId del AsyncStorage: ", error);
    return null;
  }
};

//Funciones para saber si el user ya ha hecho un chat en el día de hoy o no
const getHasChatToday = async () => {
  try {
    const data = await AsyncStorage.getItem("hasChatToday");

    if (data) {
      const { hasChatToday, expiry_hasChatToday } = JSON.parse(data);

      if (getLocalDateTimeString() > expiry_hasChatToday) {
        await AsyncStorage.removeItem("hasChatToday");
        return false;
      }
      return hasChatToday;
    }
    return false; // Si no hay bandera devolvemos false
  } catch (error) {
    console.error("Error al recuperar la bandera de chat de hoy: ", error);
    return false;
  }
};

//Funciones para guardar y recuperar el id del chat en el que estamos actualmente
const setCurrentChatId = async (id) => {
  try {
    await AsyncStorage.setItem(CURRENT_CHAT_ID_KEY, id.toString());
  } catch (error) {
    console.error("Error al guardar el chatId en el AsyncStorage: ", error);
  }
};

const getCurrentChatId = async () => {
  try {
    const id = await AsyncStorage.getItem(CURRENT_CHAT_ID_KEY);
    return id;
  } catch (error) {
    console.error("Error al recuperar el chatId del AsyncStorage: ", error);
    return null;
  }
};

const useChat = () => {
  const [messages, setMessages] = useState([]); // Estado que guarda todos los mensajes
  const [loading, setLoading] = useState(false); // Indica si la petición está en curso
  const [error, setError] = useState(null); // Almacena el error en caso de que ocurra
  const [history, setHistory] = useState([]); // Almacena el historial de chats
  const [isToday, setIsToday] = useState(false); // Bandera que indica si el chat es de hoy o no
  const [isAiWriting, setIsAiWriting] = useState(false); // Estado para controlar cuando la IA está escribiendo

  // Estados específicos para evitar condiciones de carrera
  const [conversationLoaded, setConversationLoaded] = useState(false); // Indica si se ha completado la carga de conversación
  const [hasAttemptedLoad, setHasAttemptedLoad] = useState(false); // Indica si ya se intentó cargar conversación

  const { accessToken, userId } = useAuthContext();
  const [last3MonthsChats, setLast3MonthsChats] = useState([]); // Almacena los chats de los últimos tres meses
  const [filteredChats, setFilteredChats] = useState([]); // Almacena los chats filtrados

  // Estado para guardar las fechas de búsqueda actuales (para paginación de chats filtrados)
  const [currentSearchDates, setCurrentSearchDates] = useState({
    startDate: null,
    endDate: null,
  });

  //hacemos los estados para la paginación tanto para el historial de chats como para los chats filtrados
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const [currentPageFiltered, setCurrentPageFiltered] = useState(0);
  const [totalPagesFiltered, setTotalPagesFiltered] = useState(0);
  const [totalElementsFiltered, setTotalElementsFiltered] = useState(0);

  const [pageSize, setPageSize] = useState(7);

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

      console.log("MENSAJES TEMPORALES CUANDO HABLAMOS CON LA IA :", messages);

      /*
       * recuperamos el id del chat de hoy almacenado en el AsyncStorage si existe el mensaje se envía a ese chat
       * si no existe se crea un nuevo chat con el mensaje del user y después se guarda el valor del id con la fecha en la que se ha creado
       * en el asyncStorage (mediante la función setDailyChatId) para llamadas futuras.
       */

      //Recuperamos el chatId del AsyncStorage mediante la función getDailyChatId
      const chatId = await getDailyChatId();

      console.log("ID DE CHAT RECUPERADO EN EL ASYNC:", chatId);

      //Si el id es null sabemos que es el primer mensaje que se manda a ese chat en el día de hoy y por lo tanto es un nuevo chat
      //Lo guardamos en una vraible para llamar después al getHistory y actualizar el historial de chats
      const storedChatId = chatId ? chatId : null;
      console.log("id del chat de hoy: ", storedChatId);

      //Hacemos la petición POST al endpoint
      const response = await apiClient.post(
        `${API_BASE_URL}/chats/${userId}/${storedChatId}/messages`,
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

      console.log("id del chat que acabamos de crear: ", response.data.id);

      /*
       * IMPORTANTE: La respuesta de la API puede variar dependiendo de si se ha creado un nuevo chat o se ha enviado un mensaje a uno existente.
       * Si se ha creado un nuevo chat, la respuesta incluirá el DTO de creación.
       * Si se ha enviado un mensaje a un chat existente, la respuesta devuelve el mensaje de la IA.
       *
       * En ambos casos la respuesta de la api es un 201 ya que el chat o el mensaje en el chat se ha creado correctamente.
       */
      if (response.status === 201 && response.data) {
        //Una vez hemos recibido la respuesta de la IA, eliminamos el mensaje temporal de la IA y añadimos el mensaje de la IA
        setMessages((prev) => {
          const tempMessage = prev.filter(
            (message) => message.id !== tempAIMessageId
          );
          return [
            ...tempMessage, //llamamos a la función que nos devuelve el array de mensajes sin el mensaje temporal de la IA
            {
              id: Date.now() + 2,
              content: response.data.response,
              sender: "AI",
            }, //Añadimos el nuevo objeto mensaje al estado de los mensajes
          ];
        });

        //Si el id del chat que hemos mandado el mensaje es null sabemos que se ha creado un nuevo chat por lo que en la respuesta de la api vamos a recibir el DTO de creación
        if (storedChatId === null) {
          setDailyChatId(response.data.id.toString());
          await setCurrentChatId(response.data.id.toString());
        }
      }
    } catch (error) {
      //Si ocurre un error se elimina el mensaje temporal de la IA y también el mensaje del usuario para evitar que quede "flotando"
      setMessages((prev) =>
        prev.filter(
          (message) => message.content !== "..." && message.content !== message
        )
      );

      setError(error);
      console.error("Error al enviar mensaje:", error);

      // Mostrar alerta nativa y recargar chat al confirmar
      Alert.alert(
        "Error de conexión",
        "Ha ocurrido un error al comunicarse con ZzzTime AI. Se recargará el chat para intentar nuevamente.",
        [
          {
            text: "OK",
            onPress: async () => {
              // Recargar el chat
              await reloadChatAfterError();
            },
          },
        ],
        { cancelable: false }
      );
    } finally {
      setLoading(false); //Indicamos que la petición ha terminado
      setIsAiWriting(false); // Indicamos que la IA ha terminado de escribir
    }
  };

  // Función para recargar el chat después de un error
  const reloadChatAfterError = async () => {
    try {
      // Limpiar estados
      setError(null);
      setIsAiWriting(false);

      // Recargar el chat actual
      const chatId = await getDailyChatId();
      if (chatId) {
        // Si hay un chat de hoy, lo recargamos
        await getTodayChat();
      } else {
        // Si no hay chat de hoy, limpiamos y permitimos crear uno nuevo
        setMessages([]);
        setIsToday(true);
        setConversationLoaded(true);
        setHasAttemptedLoad(true);
      }
    } catch (error) {
      console.error("Error al recargar chat:", error);
      // En caso de error, configuramos para chat nuevo
      setMessages([]);
      setIsToday(true);
      setConversationLoaded(true);
      setHasAttemptedLoad(true);
    }
  };

  /*
   * Endpoint para recuperar el historial de chats que tiene un user asociados a su id
   * @param page - Número de página (opcional, por defecto 0)
   * @param size - Tamaño de página (opcional, por defecto 7)
   * @param sortBy - Campo por el que ordenar (opcional, por defecto 'date')
   * @param direction - Dirección del ordenamiento (opcional, por defecto 'desc')
   * @param append - Si es true, anexa los resultados a los existentes (para scroll infinito)
   */
  const getHistory = async (
    page = 0,
    size = 7,
    sortBy = "date",
    direction = "desc",
    append = false
  ) => {
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
            filter: "history",
            page: page.toString(),
            size: size.toString(),
            sort: sortBy,
            direction: direction,
          },
        }
      );
      //Guardamos el historial de chats en el estado
      if (response.status === 200) {
        const pageData = response.data;

        // Actualizar estados de paginación
        setCurrentPage(pageData.number);
        setTotalPages(pageData.totalPages);
        setTotalElements(pageData.totalElements);
        setPageSize(pageData.size);

        //Actualizamos según sea append o no
        if (append && page > 0) {
          setHistory((prev) => [...prev, ...pageData.content]);
        } else {
          setHistory(pageData.content);
        }
      }

      if (response.status === 204) {
        //No hay contenido
        setHistory([]);
        setCurrentPage(0);
        setTotalPages(0);
        setTotalElements(0);
      }
    } catch (error) {
      setError(error);
      console.error("Error al recuperar historial de chats: ", error);
    } finally {
      setLoading(false);
    }
  };

  // Función para cargar la siguiente página dependiendo de si es para el historial de chats o para los chats filtrados
  const loadNextPage = async (isFiltered = false) => {
    if (isFiltered) {
      if (currentPageFiltered + 1 < totalPagesFiltered && !loading) {
        await getChatsByRangePaginated(
          currentPageFiltered + 1,
          pageSize,
          "date",
          "desc",
          true
        );
      }
    } else {
      if (currentPage + 1 < totalPages && !loading) {
        await getHistory(currentPage + 1, pageSize, "date", "desc", true);
      }
    }
  };

  // Función para recargar la primera página del historial
  const refreshHistory = async () => {
    await getHistory(0, pageSize, "date", "desc", false);
  };

  // Función para recargar la primera página de chats filtrados
  const refreshFilteredChats = async () => {
    // Resetear estados de paginación filtrados
    setCurrentPageFiltered(0);
    setTotalPagesFiltered(0);
    setTotalElementsFiltered(0);
    setFilteredChats([]);
  };

  /*
   * Endpoint para recuperar los chats que ha hecho el user en los últimos tres meses
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
      if (response.status === 204) setLast3MonthsChats([]);
      console.log("Chats últimos 3 meses recuperados: ", response.data);
    } catch (error) {
      setError(error);
      console.error("Error al recuperar chats de últimos 3 meses: ", error);
    } finally {
      setLoading(false);
    }
  };

  /*
   * Endpoint para recuperar los chats que ha hecho el user en un rango de fechas
   */
  const getChatsByRange = async (startDateValue, endDateValue) => {
    // Resetear estados de paginación filtrados antes de la nueva búsqueda
    setCurrentPageFiltered(0);
    setTotalPagesFiltered(0);
    setTotalElementsFiltered(0);
    setFilteredChats([]);

    await getChatsByRangePaginated(
      0,
      pageSize,
      "date",
      "desc",
      false,
      startDateValue,
      endDateValue
    );
  };

  /*
   * Función interna para manejar paginación de chats por rango de fechas
   */
  const getChatsByRangePaginated = async (
    page = 0,
    size = 7,
    sortBy = "date",
    direction = "desc",
    append = false,
    startDateValue = null,
    endDateValue = null
  ) => {
    setError(null);
    setLoading(true);

    try {
      // Si estamos en append, usar las fechas ya almacenadas en algún estado o props
      if (startDateValue && endDateValue) {
        // Guardar las fechas para futuras cargas de página
        setCurrentSearchDates({
          startDate: startDateValue,
          endDate: endDateValue,
        });
      } else if (currentSearchDates.startDate && currentSearchDates.endDate) {
        // Usar fechas guardadas para cargas posteriores
        startDateValue = currentSearchDates.startDate;
        endDateValue = currentSearchDates.endDate;
      }

      const response = await apiClient.get(
        `${API_BASE_URL}/users/${userId}/chats`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          params: {
            filter: "range",
            startDate: startDateValue,
            endDate: endDateValue,
            page: page.toString(),
            size: size.toString(),
            sort: sortBy,
            direction: direction,
          },
        }
      );

      //Guardamos estos chats en el estado correspondiente
      if (response.status === 200) {
        const pageData = response.data;

        setCurrentPageFiltered(pageData.number);
        setTotalPagesFiltered(pageData.totalPages);
        setTotalElementsFiltered(pageData.totalElements);

        if (append && page > 0) {
          setFilteredChats((prev) => [...prev, ...pageData.content]);
        } else {
          setFilteredChats(pageData.content);
        }
      }

      //Si la respuesta por parte del server es un 204 significa que no hay chats en el rango de fechas
      if (response.status === 204) {
        setFilteredChats([]);
        setCurrentPageFiltered(0);
        setTotalPagesFiltered(0);
        setTotalElementsFiltered(0);
      }
      console.log("Chats filtrados por rango recuperados: ", response.data);
    } catch (error) {
      setError(error);
      console.error("Error al recuperar chats por rango: ", error);
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
   * 3. Si el chat actualmente abierto en la pantalla principal se elimina (pero no es el de hoy),
   *    cargar el chat de hoy o mostrar la pantalla de bienvenida en caso de que no lo haya hecho. Si ha completado el de hoy,
   *    y lo ha borrado en algún punto lo llevamos a una pantalla diciendole que vuelva mañana a hacer un nuevo chat.
   *
   *  Devolveremos un objeto indicando todo lo que ha pasado en la función
   */

  const deleteChats = async (ids) => {
    setError(null);
    setLoading(true);

    // Default return object structure
    const result = {
      deletedOpenChat: false,
      nextChatId: undefined,
      error: false,
      hasChatToday: false,
    };

    try {
      // Verificamos si el chat de hoy está entre los chats que se van a eliminar
      const dailyChatId = await getDailyChatId();
      const currentOpenChatId = await getCurrentChatId(); // ID del chat actualmente abierto
      const hasChatToday = await getHasChatToday(); // Verificamos si el usuario ha hecho un chat hoy

      result.hasChatToday = hasChatToday;

      const isDeletingTodaysChat =
        dailyChatId && ids.includes(parseInt(dailyChatId));
      const isDeletingOpenChat =
        currentOpenChatId && ids.includes(parseInt(currentOpenChatId));

      // Información de diagnóstico
      console.log("Ids de chats a eliminar:", ids);
      console.log("Id del chat abierto:", currentOpenChatId);
      console.log("¿Eliminando chat de hoy?", isDeletingTodaysChat);
      console.log("¿Eliminando chat abierto?", isDeletingOpenChat);
      console.log("¿Usuario ha hecho chat hoy?", hasChatToday);

      // Realizar la solicitud de eliminación a la API
      const response = await apiClient.delete(
        `${API_BASE_URL}/users/${userId}/chats`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          /*
           * En este caso usamos data y se envía el contenido de la petición desde aquí
           * ya que es el formato que espera axios para enviar un body en una petición DELETE
           */
          data: ids,
        }
      );

      // Si la eliminación fue exitosa
      if (response.status === 200) {
        // Actualizamos el estado eliminando los chats borrados del historial
        setHistory((prev) => prev.filter((chat) => !ids.includes(chat.id)));

        //Actualizamos el total de elementos
        setTotalElements((prevTotal) => prevTotal - ids.length);

        //Tenemos que actualizar también el estado de los chats filtrados para una mayor consistencia
        setFilteredChats((prev) =>
          prev.filter((chat) => !ids.includes(chat.id))
        );

        // Preparamos el objeto de resultado
        result.deletedOpenChat = isDeletingOpenChat;

        // Si estamos eliminando el chat de hoy
        if (isDeletingTodaysChat) {
          console.log(
            "El chat de hoy ha sido eliminado. Limpiando referencias..."
          );

          // Eliminar referencia en AsyncStorage
          await AsyncStorage.removeItem("chatId");
          setMessages([]);
          setIsAiWriting(false);
        }

        // Si estamos eliminando el chat actualmente abierto
        if (isDeletingOpenChat) {
          console.log("El chat abierto ha sido eliminado.");

          //Limpiamos info del chat actual
          await clearCurrentChat();

          // Si hay un chat de hoy disponible, lo cargamos
          if (dailyChatId && !isDeletingTodaysChat) {
            console.log("Intentando cargar el chat de hoy en su lugar...");
            result.nextChatId = dailyChatId;
          }
        }
      } else {
        // Error en la eliminación
        console.error("Error en la respuesta de eliminación:", response.status);
        Alert.alert("Error", "No se ha podido eliminar el chat");
        result.error = true;
      }
    } catch (error) {
      console.error("Error al eliminar chats:", error.response || error);
      setError(error);
      result.error = true;
    } finally {
      setLoading(false);
    }

    console.log("Objeto de resultado final:", result);
    return result;
  };

  /*
   * Endpoint para recuperar la conversación de un chat a partir de su id y recuperar una bandera que nos dice
   * si el chat es de hoy o no, para permitir escribir o no en el respectivamente.
   */
  const getConversationChat = async (targetChatId) => {
    setError(null);
    setLoading(true);
    setHasAttemptedLoad(true);
    setConversationLoaded(false);

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

        // Actualizamos los estados de forma atómica
        setIsToday(chatEditable);
        setMessages(chatMessages);
        setConversationLoaded(true);
        console.log("Chat editable:", chatEditable);

        // También guardamos el id del chat en la bandera aux para saber en que chat está el user, esto solo si los mensajes no están vacíos
        if (chatMessages.length > 0) {
          await setCurrentChatId(targetChatId.toString());
        }

        return true;
      } else {
        console.error("Error en respuesta:", response.status);
        setConversationLoaded(true); // Marcar como cargado aunque haya error
        throw new Error(`Error en la respuesta: ${response.status}`);
      }
    } catch (error) {
      console.error(
        "Error al recuperar conversación, valor del id del chat que se esta intentando buscar: ",
        targetChatId
      );
      setError(error);
      setConversationLoaded(true); // Marcar como cargado aunque haya error
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /*
   * Funcion para recuperar la conversación del posible chat de hoy
   */
  const getTodayChat = async () => {
    setHasAttemptedLoad(true);
    setConversationLoaded(false);

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
          setConversationLoaded(true);
          // Limpiamos el chatId del storage ya que parece que no es válido
          await AsyncStorage.removeItem("chatId");
        }
      } else {
        setMessages([]);
        setConversationLoaded(true);
      }
    } catch (error) {
      console.error("Error general al recuperar chat de hoy:", error);
      // En caso de error general, configuramos para que el usuario pueda crear un nuevo chat
      setMessages([]);
      setIsToday(true);
      setConversationLoaded(true);
    }
    console.log("Valor de si se puede crear un chat:", isToday);
  };

  const clearCurrentChat = async () => {
    try {
      await AsyncStorage.removeItem(CURRENT_CHAT_ID_KEY);
      // Resetear los estados en memoria
      setMessages([]);
      setIsToday(true); // Permitimos que se pueda escribir
      setIsAiWriting(false); // Por si había una operación pendiente
      setConversationLoaded(false);
      setHasAttemptedLoad(false);

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
    getCurrentChatId,
    getDailyChatId,
    getHasChatToday,
    filteredChats,
    getChatsByRange,
    setIsToday,
    // Estados específicos para manejar condiciones de carrera
    conversationLoaded,
    hasAttemptedLoad,
    // Estados de paginación para historial
    currentPage,
    totalPages,
    totalElements,
    pageSize,
    // Estados de paginación para chats filtrados
    currentPageFiltered,
    totalPagesFiltered,
    totalElementsFiltered,
    // Funciones de paginación
    loadNextPage,
    refreshHistory,
    refreshFilteredChats,
    setFilteredChats,
    setTotalElementsFiltered,
  };
};

export default useChat;
