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

const Chat = () => {
  //Creamos los mensajes de modo estático para la simulación de un chat y ver como queda visualmente
  const [messages, setMessages] = useState([
    { id: 1, text: "Hola como estas?", sender: "user" },
    {
      id: 2,
      text: "Hola de nuevo user, me encuentro genial. Tu como estas? Cuéntame tu sueño de hoy",
      sender: "AI",
    },
    {
      id: 3,
      text: "Soñé que podía volar pero después me caía de repente",
      sender: "user",
    },
  ]);

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
      setMessages([
        ...messages,
        {
          id: messages.length + 1,
          text: newMessage,
          sender: "user",
        },
      ]);
      //Reinicializamos el estado del mensaje y cerramos el teclado
      setNewMessage("");
      Keyboard.dismiss();
    }
  };

  //Función que se encargará a la hora de renderizar los mensajes de darle un determinado estilo
  const renderMessage = ({ item }) => {
    //hacemos variable para saber si el sender es el usuario o no
    const isUser = item.sender === "user";
    return (
      <View className={`mb-4 ${isUser ? "items-end" : "items-start"} w-full`}>
        <View
          //Dependiendo de si el mensaje es del usuario o no le damos un estilo diferente
          className={`p-3 rounded-2xl max-w-[80%] ${
            isUser ? "bg-[#6366ff]" : "bg-[#323d4f]"
          }`}
        >
          <Text className="text-base text-white">{item.text}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-primary">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <View className="flex flex-row gap-4 justify-start items-center p-4">
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

        <FlatList
          className="flex-1 px-4"
          data={messages}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderMessage}
          contentContainerStyle={{
            paddingVertical: 16,
          }}
        />

        <View className="flex-row items-center p-4 border-gray-700 pb-0border-t">
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
