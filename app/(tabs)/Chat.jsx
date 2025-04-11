import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Keyboard, //para cerrar el teclado despues de enviar un mensaje tenemos que usar la API de Keyboard
} from "react-native";
import React, { useEffect, useState } from "react";
import { Menu } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import useChat from "../../hooks/useChat";
import TypingIndicator from "../../components/TypingIndicator";
import { useAuthContext } from "../../context/AuthContext";
import { router } from "expo-router";

const Chat = () => {
  //recuperamos las funcionalidades y estados del hook de chat
  const { messages, postRequest, isToday, getTodayChat, isAiWriting } =
    useChat();
  //Input que guarda el mensaje que se quiere enviar
  const [newMessage, setNewMessage] = useState("");
  // Estado para controlar si los mensajes se están cargando
  const [initializing, setInitializing] = useState(true);

  //Tenemos que recuperar el nombre del user para enseñarlo en el mensaje inicial que se pone en el chat antes de iniciar la conversación
  const { userInfo } = useAuthContext();

  // Al montar el componente, intentamos cargar el chat de hoy
  useEffect(() => {
    const initialize = async () => {
      try {
        // Solo cargamos del servidor si no hay mensajes guardados
        if (messages.length === 0) {
          await getTodayChat();
        }
      } catch (error) {
        console.error("Error en la inicialización:", error);
      } finally {
        // Marcamos como inicializado después de intentar cargar
        setInitializing(false);
      }
    };

    initialize();
  }, []);

  // Mostramos logs de depuración
  useEffect(() => {
    console.log("Mensajes desde el useEffect: ", messages);
    console.log("¿El chat es de hoy?", isToday);
    console.log("¿IA escribiendo?", isAiWriting);
    console.log("¿Inicializando?", initializing);
  }, [messages, isToday, isAiWriting, initializing]);

  const toggleModal = () => {
    router.push("../ChatsHistory");
  };

  const handleSendMessage = () => {
    //Si el mensaje no es vacío y la IA no está escribiendo, lo enviamos
    if (newMessage.trim() && !isAiWriting) {
      postRequest(newMessage.trim());
      //Reinicializamos el estado del mensaje y cerramos el teclado
      setNewMessage("");
      Keyboard.dismiss();
    }
  };

  //Función que se encargará a la hora de renderizar los mensajes de darle un determinado estilo
  const renderMessage = ({ item }) => {
    //hacemos variable para saber si el sender es el usuario o no
    const isUser = item.sender === "USER";

    /*
     * Definimos el padding para el caso en el que la IA está escribiendo el mensaje de respuesta al user:
     * En caso de que así sea lo que tenemos que hacer es eliminarlo para que la caja que contiene el mensaje no sea muy grande
     * Cuando el mensaje es en si la respuesta de manera completa ponemos el mismo estilo que los mensajes del user
     */
    const paddingClass =
      item.sender === "AI" && item.content === "..." ? "p-0" : "p-3";

    return (
      <View className={`mb-4 ${isUser ? "items-end" : "items-start"} w-full`}>
        <View
          //Dependiendo de si el mensaje es del usuario o no le damos un estilo diferente
          //Usamos la clase de padding personalizada para que dependiendo del contexto se aplique uno o el otro
          className={`${paddingClass} rounded-2xl max-w-[80%] ${
            isUser ? "bg-[#6366ff]" : "bg-[#323d4f]"
          }`}
        >
          {/*Comprobamos si se va a renderizar un mensaje o si la ia esta generando la respuesta*/}
          {item.sender === "AI" && item.content === "..." ? (
            <TypingIndicator />
          ) : (
            //Con selectable true hacemos que el texto sea seleccionable y se pueda copiar por parte del user
            <Text selectable={true} className="text-base text-white">
              {item.content}
            </Text>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView className="w-full h-full bg-primary">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <View className="flex flex-row items-center justify-start gap-4 p-4">
          <TouchableOpacity
            //Cuando pinchemos en el menú hamburguesa se abre el modal
            onPress={toggleModal}
          >
            <Menu size={32} color="#6366ff" />
          </TouchableOpacity>

          <Text
            className="text-center font-bold text-[#6366ff] py-4"
            style={{ fontSize: 24 }}
          >
            Diario de Sueños y Análisis AI
          </Text>
        </View>

        {/**
         * En caso de que estemos inicializando o no haya mensajes, mostramos la pantalla de bienvenida
         * En caso contrario, mostramos la conversación
         */}
        {initializing ? (
          // Pantalla de carga mientras inicializamos
          <View className="items-center justify-center flex-1">
            <Text className="text-lg text-white">Cargando...</Text>
          </View>
        ) : messages.length === 0 ? (
          // Pantalla de bienvenida para iniciar la conversación
          <View className="items-center justify-center flex-1">
            <View className="items-center justify-center flex-1">
              <Text className="text-center text-[#6366ff] text-3xl font-bold mb-2">
                Hola, {userInfo?.name || "User"}!
              </Text>
              <Text className="text-lg italic text-center text-white">
                ¿Coméntame sobre tu sueño de hoy y te ayudaré a comprenderlo?
              </Text>
            </View>
          </View>
        ) : (
          // Lista de mensajes si hay conversación
          <FlatList
            className="flex-1 px-4"
            data={messages}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderMessage}
            contentContainerStyle={{
              paddingVertical: 16,
            }}
          />
        )}

        {isToday ? (
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
                isAiWriting ? "bg-[#6366ff]/60" : "bg-[#6366ff]"
              } p-3 rounded-xl`}
              onPress={handleSendMessage}
              disabled={isAiWriting}
            >
              <Text className="font-semibold text-white">Enviar</Text>
            </TouchableOpacity>
          </View>
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
