import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Pressable,
} from "react-native";
import React, { useEffect, useState, useRef } from "react";
import { Feather } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import useChat from "../../hooks/useChat";
import TypingIndicator from "../../components/TypingIndicator";
import { useAuthContext } from "../../context/AuthContext";
import { router } from "expo-router";
import LoadingBanner from "../../components/LoadingBanner";
import { useLocalSearchParams } from "expo-router/build/hooks";
import NotFound from "../../components/NotFound";

const Chat = () => {
  //recuperamos las funcionalidades y estados del hook de chat
  const {
    messages,
    postRequest,
    isToday,
    getTodayChat,
    isAiWriting,
    getConversationChat,
    getHasChatToday,
    setIsToday,
    conversationLoaded,
    hasAttemptedLoad,
    getDailyChatId,
  } = useChat();
  //Input que guarda el mensaje que se quiere enviar
  const [newMessage, setNewMessage] = useState("");
  // Estado para controlar si los mensajes se están cargando
  const [initializing, setInitializing] = useState(true);
  // Referencia a la FlatList para el scroll automático
  const flatListRef = useRef(null);
  //Estado para saber si el user puede hacer un chat nuevo o no
  const [canCreateNewChat, setCanCreateNewChat] = useState(false);
  //Estado para saber si no se ha podido recuperar la conversación de un chat
  const [conversationNotFound, setConversationNotFound] = useState(false);
  //Estado para saber si el user ha hecho un chat hpy y lo ha eliminado
  const [hasChatTodayButEliminated, setHasChatTodayButEliminated] =
    useState(false);

  //Tenemos que recuperar el nombre del user para enseñarlo en el mensaje inicial que se pone en el chat antes de iniciar la conversación
  const { userInfo } = useAuthContext();

  /*
   * Cuando importamos en un componente el uso de un hook, este tiene su propio contexto y no se comparte entre componentes.
   * Por eso cuando en History cuando caragamos el chat y si cambian los mensajes no se actualizan en el componente de Chat.
   *
   * Lo que tenemos que hacer es que history cuando se clicke encima de un chat se pasará por parámetro el id del chat
   * y solucionamos el problema mediante rutas dinámicas.
   *
   * Si el chatId existe, significa que venimos de History y tenemos que cargar ese chat.
   * Si no existe, significa que venimos de la pantalla principal y tenemos que cargar el chat de hoy.
   */

  const { chatId, showTomorrowMessage } = useLocalSearchParams();
  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        //Si es la primera vez que entramos en la pestaña tenemos que recuperar la bandera de si el user ha hecho un chat hoy y el posible id del chat de hoy
        const hasChatToday = await getHasChatToday();
        const dailyChatId = await getDailyChatId();

        //Si no tenemos el id del chat de hoy pero si tenemos la bandera de hasChatToday, significa que el user ha hecho un chat hoy pero lo ha eliminado
        if (hasChatToday && !dailyChatId) {
          setHasChatTodayButEliminated(true);
        }

        // Si venimos de eliminar el chat en el que estábamos y se debe mostrar el mensaje de "vuelve mañana" en caso de que el user haya borrado el chat de hoy también
        if (showTomorrowMessage === "true") {
          setCanCreateNewChat(false);
          setInitializing(false);
          return;
        }

        if (chatId) {
          // Caso especial si venimos de eliminar el chat en el que estábamos y en caso de que exista el chatId, lo cargamos también está reservado para el caso de que cargemos una conversación de un chat seleccionado del historial
          await getConversationChat(chatId);
        } else if (hasChatToday) {
          //En caso de que el user haya hecho hoy un chat pero no tenemos la id primero lo que hacemos es llamar a la función que intenta recuperarel chat de hoy
          await getTodayChat();
        } else {
          setCanCreateNewChat(true);
          setIsToday(true);
        }
      } catch (err) {
        console.error("Error cargando chat:", err);
      } finally {
        if (mounted) setInitializing(false);
      }
    };

    load();

    // Limpiamos el efecto para evitar fugas de memoria, se ejecuta cuando desmontamos el componente
    return () => {
      mounted = false;
    };
  }, [chatId, showTomorrowMessage]);

  useEffect(() => {
    const renderChat = async () => {
      //Si se ha intentado cargar la conversación y se ha logrado, dependiendo del caso setteamos el resto de estados de manera correcta en vez de hacerlo en el anterior useEffect dando lugar a carreras críticas
      if (conversationLoaded && hasAttemptedLoad) {
        if (chatId && messages.length === 0) {
          //En este caso no ha sido posible cargar la conversación
          setConversationNotFound(true);
        } else {
          //Tenemos que ver si el user ha chateado hoy aunque haya borrado el chat
          const hasChatToday = await getHasChatToday();
          //Si los mensajes que se han recuperado son cero, significa que el user ha borrado el chat de hoy y por lo tanto tiene que esperar a mañana a crear uno nuevo
          if (hasChatToday && messages.length === 0) {
            setCanCreateNewChat(false);
          }
        }
      }
    };

    renderChat();
  }, [conversationLoaded, hasAttemptedLoad]);
  // Auto-scroll cuando llega respuesta de IA
  useEffect(() => {
    if (messages.length > 0 && !initializing) {
      scrollToBottom();
    }
  }, [messages, initializing]);

  const toggleModal = () => {
    router.push("../ChatsHistory");
  };

  // Función para hacer scroll al final de manera elegante
  const scrollToBottom = () => {
    if (flatListRef.current && messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  const handleSendMessage = () => {
    //Si el mensaje no es vacío y la IA no está escribiendo, lo enviamos
    if (newMessage.trim() && !isAiWriting) {
      postRequest(newMessage.trim());
      //Reinicializamos el estado del mensaje y cerramos el teclado
      setNewMessage("");
      Keyboard.dismiss();
      // Hacer scroll al final después de enviar el mensaje
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    }
  };

  //Función que se encargará a la hora de renderizar los mensajes de darle un determinado estilo
  const renderMessage = ({ item }) => {
    //hacemos variable para saber si el sender es el usuario o no
    const isUser = item.sender === "USER";

    // Verificamos si es un indicador de escritura de la IA
    const isTyping = item.sender === "AI" && item.content === "...";

    // Si es el indicador de escritura, no aplicamos padding ni background
    // Si es un mensaje normal, aplicamos el padding y background correspondiente
    return (
      <View className={`mb-4 ${isUser ? "items-end" : "items-start"} w-full`}>
        {isTyping ? (
          // Contenedor del indicador de escritura sin fondo
          <View className="ml-2">
            <TypingIndicator />
          </View>
        ) : (
          // Contenedor normal para mensajes regulares
          <View
            className={`p-3 rounded-2xl max-w-[80%] ${
              isUser ? "bg-[#6366ff]" : "bg-[#323d4f]"
            }`}
          >
            <Text selectable={true} className="text-base text-white">
              {item.content}
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView className="w-full h-full bg-primary">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === "ios" ? 20 : 20}
      >
        {/*En caso de que no se puedacargar ka conversación, ocultamos el header de la sección para dejar la pantalla más profesional */}
        {!conversationNotFound && (
          <View className="flex flex-row gap-4 justify-start items-center p-4 android:pt-6">
            <TouchableOpacity
              //Cuando pinchemos en el menú hamburguesa se abre el modal
              onPress={toggleModal}
            >
              <Feather name="menu" size={32} color="#6366ff" />
            </TouchableOpacity>

            <Text
              className="text-center font-bold text-[#6366ff] py-4"
              style={{ fontSize: 24 }}
            >
              Diario de Sueños y Análisis AI
            </Text>
          </View>
        )}

        {/**
         * En caso de que estemos inicializando o no haya mensajes, mostramos la pantalla de bienvenida
         * En caso contrario, mostramos la conversación
         */}
        {initializing ? (
          // Pantalla de carga profesional mientras inicializamos
          <View className="flex-1 justify-center items-center px-6">
            <View className="w-full bg-[#1e2a47] rounded-xl p-8">
              <View className="flex-row w-full">
                <View className="w-2 h-full bg-[#6366ff]" />
                <View className="flex-1 items-center">
                  <LoadingBanner />
                  <Text className="mb-2 text-xl font-bold text-white">
                    Cargando entorno de ZzzTime AI
                  </Text>
                  <Text className="text-base text-center text-[#8a94a6] px-4 mb-3">
                    Estamos preparando tu diálogo con ZzzTime AI para analizar
                    tus sueños y mejorar tu descanso.
                  </Text>

                  <View className="flex flex-row gap-2 justify-center mt-2 w-full">
                    <View className="h-2 w-2 rounded-full bg-[#6366ff] opacity-30" />
                    <View className="h-2 w-2 rounded-full bg-[#6366ff] opacity-50" />
                    <View className="h-2 w-2 rounded-full bg-[#6366ff] opacity-70" />
                    <View className="h-2 w-2 rounded-full bg-[#6366ff] opacity-100" />
                  </View>
                </View>
              </View>
            </View>
          </View>
        ) : conversationNotFound ? (
          // Pantalla cuando no se puede cargar la conversación
          <View className="items-center flex-1 w-[90%] justify-center self-center">
            <NotFound />
            <Text className="mb-3 text-xl font-bold text-white">
              Conversación no encontrada
            </Text>
            <Text className="text-base text-center text-[#8a94a6] px-4 mb-6">
              No se ha podido cargar la conversación seleccionada. Es posible
              que haya sido eliminada o que haya ocurrido un error.
            </Text>

            <View className="flex flex-col gap-3 w-full">
              <TouchableOpacity
                onPress={() => {
                  //Si volvemos al inicio, eliminamos el estado de la conversación no encontrada
                  setConversationNotFound(false);
                  //Esperamos a que se renderice la pantalla para que se pueda volver al chat principal
                  setTimeout(() => {
                    router.replace("/(tabs)/Chat");
                  }, 0);
                }}
                className="bg-[#6366ff] px-12 py-4 rounded-full flex flex-row items-center justify-center"
              >
                <View className="flex-row gap-2 justify-center items-center">
                  <Feather name="home" size={16} color="#ffffff" />
                  <Text className="font-medium text-white">
                    Ir al chat principal
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.push("../ChatsHistory")}
                className="bg-[#323d4f] px-12 py-4 rounded-full flex flex-row items-center justify-center"
              >
                <View className="flex-row gap-2 justify-center items-center">
                  <Feather name="message-square" size={16} color="#ffffff" />
                  <Text className="font-medium text-white">
                    Ver historial de chats
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        ) : messages.length === 0 ? (
          canCreateNewChat ? (
            // Pantalla de bienvenida si no hay mensajes en el caso de que se abra el teclado y el user quiera cerrarlo tenemos que englobar esta vista en un Pressable para que se cierre el teclado
            <Pressable style={{ flex: 1 }} onPress={Keyboard.dismiss}>
              <View className="flex-1 justify-center items-center android:px-6">
                {/* Esquina superior izquierda */}
                <View
                  className="absolute w-16 h-16 bg-[#6366ff]/15 rounded-full"
                  style={{ top: 30, left: 20 }}
                />

                {/* Esquina superior derecha */}
                <View
                  className="absolute w-12 h-12 bg-[#6366ff]/5 rounded-full"
                  style={{ top: 50, right: 24 }}
                />

                {/* Centro izquierda */}
                <View
                  className="absolute w-10 h-10 bg-[#6366ff]/5 rounded-full"
                  style={{ top: "45%", left: 16 }}
                />

                {/* Centro derecha */}
                <View
                  className="absolute w-14 h-14 bg-[#6366ff]/15 rounded-full"
                  style={{ top: "55%", right: 20 }}
                />

                {/* Esquina inferior izquierda */}
                <View
                  className="absolute w-8 h-8 bg-[#6366ff]/15 rounded-full"
                  style={{ bottom: 100, left: 24 }}
                />

                {/* Esquina inferior derecha */}
                <View
                  className="absolute w-20 h-20 bg-[#6366ff]/5 rounded-full"
                  style={{ bottom: 80, right: 28 }}
                />

                <View className="flex-1 gap-3 justify-center items-center">
                  <Text className="text-center text-[#6366ff] text-3xl font-bold mb-2">
                    ¡Hola, {userInfo?.name || "User"}!
                  </Text>
                  <Text className="px-4 text-lg italic text-center text-white">
                    Cuéntame sobre tu sueño de anoche y te ayudaré a
                    comprenderlo
                  </Text>
                </View>
              </View>
            </Pressable>
          ) : (
            // Pantalla mejorada para cuando el usuario no puede crear un nuevo chat hoy
            <View className="flex-1 justify-center items-center px-6 android:px-4">
              <View className="w-full bg-[#1e2a47] rounded-xl p-8 border border-[#323d4f]">
                <View className="flex-row w-full">
                  <View className="w-2 h-full bg-[#6366ff]" />
                  <View className="flex-1 items-center">
                    <View className="bg-[#6366ff]/10 p-4 rounded-full mb-4">
                      <Feather name="calendar" size={32} color="#6366ff" />
                    </View>
                    <Text className="mb-3 text-xl font-bold text-white">
                      ¡Hola, {userInfo?.name || "User"}!
                    </Text>
                    <Text className="text-base text-center text-[#8a94a6] px-4 mb-3">
                      Has completado tu análisis de sueños para hoy. Vuelve
                      mañana para continuar mejorando tu descanso con ZzzTime
                      AI.
                    </Text>

                    <View className="mt-2 mb-4 w-full bg-[#283347] p-4 rounded-lg">
                      <Text className="mb-1 text-base font-medium text-white">
                        ZzzTime AI - Tu diario de sueños
                      </Text>
                      <Text className="text-sm text-[#8a94a6]">
                        ZzzTime funciona como un diario personal, permitiéndote
                        registrar y analizar un sueño cada día. Esta metodología
                        diaria está diseñada para ayudarte a construir un
                        historial de patrones de sueño y que puedas ver como
                        evoluciona tu descanso.
                      </Text>
                    </View>

                    <TouchableOpacity
                      onPress={() => router.push("../ChatsHistory")}
                      className="mt-2 bg-[#6366ff] px-6 py-3 rounded-xl flex-row items-center"
                    >
                      <View className="flex-row gap-2 justify-center items-center">
                        <Feather
                          name="message-square"
                          size={16}
                          color="#ffffff"
                        />
                        <Text className="font-medium text-white">
                          Ver historial de chats
                        </Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          )
        ) : (
          // Lista de mensajes si hay conversación
          <FlatList
            ref={flatListRef}
            className="flex-1 px-4 android:px-3"
            data={messages}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderMessage}
            contentContainerStyle={{
              paddingVertical: 16,
            }}
            showsVerticalScrollIndicator={true}
            indicatorStyle="white"
          />
        )}

        {isToday ? (
          //Si no se están cargando mensajes, el user ha hablado hoy y no tiene el id del chat que ha hecho hoy, ocultamos el input y el botón de enviar
          !initializing &&
          !hasChatTodayButEliminated && (
            <View className="flex-row items-center p-4 pb-0 border-t border-gray-700">
              <TextInput
                className="flex-1 bg-[#323d4f] text-white p-3 rounded-xl mr-2"
                value={newMessage}
                onChangeText={setNewMessage}
                placeholder="Escribe tus inquietudes a ZzzTime AI"
                placeholderTextColor="#9ca3af"
                multiline={true}
                textAlignVertical="top"
                scrollEnabled={true}
                style={{
                  maxHeight: 100,
                }}
              />

              <TouchableOpacity
                className={`${
                  isAiWriting || newMessage.trim() === ""
                    ? "bg-[#323d4f]"
                    : "bg-[#6366ff]"
                } p-3 rounded-xl`}
                onPress={handleSendMessage}
                disabled={isAiWriting || newMessage.trim() === ""}
              >
                <Text className="font-semibold text-white">Enviar</Text>
              </TouchableOpacity>
            </View>
          )
        ) : messages.length > 0 ? (
          <View className="p-4 pb-0 border-t border-gray-700">
            <Text className="p-3 text-center text-gray-400">
              Este chat no es de hoy por lo que está en modo lectura. No puedes
              enviar nuevos mensajes.
            </Text>
          </View>
        ) : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Chat;
