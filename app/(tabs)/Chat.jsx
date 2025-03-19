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
import React, { useState } from "react";
import { Menu } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ChatsModal from "../../components/ChatsModal";
import useChat from "../../hooks/useChat";
import TypingIndicator from "../../components/TypingIndicator";

const Chat = () => {
  //recuperamos las funcionalidades del hook de chat
  const { messages, postRequest } = useChat();
  //Input que guarda el mensaje que se quiere enviar
  const [newMessage, setNewMessage] = useState("");
  //Estado para saber si el modal en el que se eligen los chats está abierto o no
  const [showModal, setShowModal] = useState(false);

  const toggleModal = () => {
    setShowModal(!showModal);
  };

  const handleSendMessage = () => {
    //Si el mensaje no es vacío lo enviamos
    if (newMessage.trim()) {
      /*setMessages([
        ...messages,
        {
          id: messages.length + 1,
          text: newMessage,
          sender: "user",
        },
      ]);*/
      /*
       * Una vez que enviamos el mensaje tenemos que usar la función del useChat para enviar el mensaje a la IA y guardarlo en la BD
       */
      postRequest(newMessage);
      //Reinicializamos el estado del mensaje y cerramos el teclado
      setNewMessage("");
      Keyboard.dismiss();
    }
  };

  //Función que se encargará a la hora de renderizar los mensajes de darle un determinado estilo
  const renderMessage = ({ item }) => {
    //hacemos variable para saber si el sender es el usuario o no
    const isUser = item.sender === "user";

    /*
     * Definimos el padding para el caso en el que la IA está escribiendo el mensaje de respuesta al user:
     * En caso de que así sea lo que tenemos que hacer es eliminarlo para que la caja que contiene el mensaje no sea muy grande
     * Cuando el mensaje es en si la respuesta de manera completa ponemos el mismo estilo que los mensajes del user
     */
    const paddingClass =
      item.sender === "AI" && item.text === "..." ? "p-0" : "p-3";

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
          {item.sender === "AI" && item.text === "..." ? (
            <TypingIndicator />
          ) : (
            //Con selectable true hacemos que el texto sea seleccionable y se pueda copiar por parte del user
            <Text selectable={true} className="text-base text-white">
              {item.text}
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

        {/*Modal para la selección de los chats*/}
        <ChatsModal isVisible={showModal} onClose={toggleModal} />

        {/**
         * En caso de que no se haya empezado la conversación con la IA, tenemos que poner un mensaje en el medio de la
         *  pantalla animando al user a comentar sus inquietudes sobre el sueño
         *
         * En caso contrario lo que hacemos es mostrar la conversación que tiene el user
         * */}
        {messages.length === 0 ? (
          <View className="items-center justify-center flex-1">
            <View className="items-center justify-center flex-1">
              <Text className="text-center text-[#6366ff] text-3xl font-bold mb-2">
                Hola, User!
              </Text>
              <Text className="text-lg italic text-center text-white">
                ¿Coméntame sobre tu sueño de hoy y te ayudaré a comprenderlo?
              </Text>
            </View>
          </View>
        ) : (
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
            className="bg-[#6366ff] p-3 rounded-xl"
            onPress={handleSendMessage}
          >
            <Text className="font-semibold text-white">Enviar</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Chat;
