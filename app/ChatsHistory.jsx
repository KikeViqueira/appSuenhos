import {
  View,
  Text,
  Modal,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  Platform,
  Animated,
} from "react-native";
import React, { useEffect, useState, useRef } from "react";
import {
  X,
  Trash2,
  Check,
  MessageSquareOff,
  MessagesSquare,
  AlertCircle,
} from "lucide-react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { xorBy } from "lodash";
import ChatItem from "../components/ChatItem";
import useChat from "../hooks/useChat";
import { router } from "expo-router";

const ChatsHistory = () => {
  //Definimos los distintos estados que necesitamos para el model
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [filteredChats, setFilteredChats] = useState([]); //Guardaremos el chat filtrado en base a la fecha seleccionada
  const [hasSearched, setHasSearched] = useState(false);
  /*
   *Creamos estado para guardar los chats que se seleccionan en la selección múltiple para ser eliminados
   *
   * También tenemos que crear un estado el cual funcionará como bandera para saber si estamos en el modo de selección múltiple o no
   */
  const [selectedChats, setSelectedChats] = useState([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false); //Estado para saber cuando estamos en android y asi manejar su comportamiento.

  // Ref para animación
  const selectionBarOpacity = useRef(new Animated.Value(0)).current;

  //Importamos del hook de chat lo que nos interesa
  const { getHistory, getConversationChat, history, deleteChats } = useChat();

  // Animar la entrada y salida de la barra de selección
  useEffect(() => {
    Animated.timing(selectionBarOpacity, {
      toValue: isSelectionMode ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isSelectionMode]);

  useEffect(() => {
    //Esto se va a ejecutar cuando se monte el componente por primera vez*/
    getHistory();
  }, []);

  const handleChatPress = async (chat) => {
    //Dependiendo del modo en el que estemos pulsar en un chat tendrá una acción asociada
    if (isSelectionMode) {
      setSelectedChats(xorBy(selectedChats, [chat], "id"));
    } else {
      console.log("Seleccionando chat para ver:", chat.id, chat.name);
      try {
        //En caso de que el user haya pinchado en el chat para ver la conversación, llamamos a la función que se encarga de recuperar la conversación del chat
        const success = await getConversationChat(chat.id); //Esperamos a que se recupere la conversación del chat

        if (success) {
          console.log("Navegando de regreso a la pantalla de chat");
          // Esperamos un poco para asegurar que AsyncStorage se ha actualizado
          setTimeout(() => {
            router.back();
          }, 100);
        }
      } catch (error) {
        console.error("Error al cargar la conversación:", error);
        // Podríamos mostrar una alerta aquí
      }
    }
  };

  //Función que se encargará de poner el modo de múltiple selección activado para su uso y ocultar los chtas que se han filtrado en caso de que el user haya hecho una búsqueda
  const handleDeletePress = () => {
    setIsSelectionMode(true);
    setFilteredChats([]);
  };

  //Función que se encarga de cancelar la eliminación múltiple y volver al estado por default
  const disableSelection = () => {
    setIsSelectionMode(false);
    setSelectedChats([]);
  };

  //Función para confirmar la eliminación de los chats que han sido seleccionados
  const confirmDeletion = async () => {
    //TODO: SI DE LOS CHATS QUE SE ELIMINAN ESTÁ EL DE LA CONVERSACIÓN ACTUAL QUE TENEMOS, HAY QUE PONER EL PLACEHOLDER DE INICIAR CONVERSACIÓN
    console.log(
      "Eliminando los siguientes chats: " +
        selectedChats.map((chat) => chat.name).join(", ") //Enseñamos los name de los chats que han sido eliminados separados mediante comas
    );
    //llamamos al endpoint de eliminar chats pasandole los ids de los chats seleccionados
    deleteChats(selectedChats.map((chat) => chat.id));
    setSelectedChats([]); //Limpiamos los tips seleccionados
    setIsSelectionMode(false);
  };

  //Obtenemos los chats en base a la fecha seleccionada por el user
  const handleSearchByDate = () => {
    setHasSearched(true); //Activamos la bandera de búsqueda para saber si el user ha hecho una búsqueda
    //Pasamos la fecha a formato ISO (YYYY-MM-DDTHH:MM:SSZ), dividimos el string para obtener la parte de la fecha mediante el separador de "T"
    const formattedDate = selectedDate.toISOString().split("T")[0];
    //De los chats que tenemos renderizamos el que tenga la fecha que el user ha seleccionado
    const filtered = history.filter((chat) => chat.date === formattedDate);
    setFilteredChats(filtered);
  };

  const handleDateChange = (event, date) => {
    /*Una vez que se abre lo ponemos en false para no renderizar seguido el picker de android
    si no estaremos en el caso de que el picker una vez abierto y elegido una fecha o intentar cerrarlo siempre se nos va a abrir continuamente*/
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }

    if (date) {
      //gestionamos posible evento nulo de Android
      const selectedDate = date || new Date();
      setSelectedDate(selectedDate);
    }
  };

  const openDatePicker = () => {
    if (Platform.OS === "android") {
      setShowDatePicker(true);
    }
  };

  return (
    <SafeAreaView className="flex-1 w-full bg-primary">
      <View className="flex flex-row items-center justify-start gap-4 p-4">
        <TouchableOpacity onPress={() => router.back()}>
          <X size={32} color={"#6366ff"} />
        </TouchableOpacity>
        <Text
          className="text-center font-bold text-[#6366ff] py-4"
          style={{ fontSize: 24 }}
        >
          Historial de Chats
        </Text>
      </View>

      {/*Buscador de un chat en base a la fecha*/}
      <View className="flex flex-row gap-4 justify-between items-center flex-wrap w-[90%] self-center">
        <Text className="text-lg text-white">Selecciona la fecha del chat</Text>

        {Platform.OS === "android" && ( //Renderizamos el botón en caso de android, en caso de apple ya viene renderizado con el propio picker
          <TouchableOpacity onPress={openDatePicker} className="w-full">
            <View className="bg-[#1e273a] p-4 rounded-xl">
              <Text className="text-center text-white">
                {selectedDate.toLocaleDateString()}
              </Text>
            </View>
          </TouchableOpacity>
        )}

        {(Platform.OS === "ios" || showDatePicker) && ( //Si estamos en ios renderizamos su picker y showDatePicker esta en false
          //En caso de que showDatePicker este en true y el SO sea android lo abrimos tambien y gestionamos
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display={Platform.OS === "ios" ? "compact" : "default"}
            textColor="white"
            themeVariant="dark" //Forzamos el tema oscuro para ios
            maximumDate={new Date()} //Máxima fecha a la que el user puede seleccionar para la búsqqueda de chats
            onChange={handleDateChange}
          />
        )}

        <TouchableOpacity
          className="bg-[#6366ff] p-4 rounded-xl w-full"
          onPress={handleSearchByDate}
        >
          <Text className="text-base font-semibold text-center text-white">
            Buscar
          </Text>
        </TouchableOpacity>
      </View>

      {/*Renderizamos el chat filtrado en base a la fecha seleccionada si el user le ha dado a buscar (hasSearched = True)*/}
      {hasSearched && (
        <View className="w-[90%] self-center mt-6">
          {/*En caso de que haya un chat filtrado mostramos su contenido: name y date.
              En otro caso lo que hacemos es mostrar un mensaje de error diciendo al user que no se ha encontrado un chat con la fecha que esta buscando*/}
          {filteredChats.length > 0 ? (
            <TouchableOpacity
              onPress={() => handleChatPress(filteredChats[0])}
              disabled={isSelectionMode}
            >
              <View className="bg-[#1e273a] w-full flex flex-col justify-between p-6 rounded-lg">
                <Text className="mb-2 text-xl font-bold text-white">
                  {filteredChats[0].name}
                </Text>
                <Text className="text-[#6366ff]">{filteredChats[0].date}</Text>
              </View>
            </TouchableOpacity>
          ) : (
            <View className="flex items-center justify-center py-4">
              <Text className="text-base text-center text-white">
                No se ha encontrado un chat correspondiente a este día
              </Text>
            </View>
          )}
        </View>
      )}

      {/*Renderizamos los últimos chats recientes en base a los últimos x días*/}
      <View
        className={`w-[90%] flex flex-col flex-1 gap-4 self-center mt-8
        ${history.length > 0 ? "justify-start" : "justify-center"}
        `}
      >
        {history.length > 0 ? (
          <>
            <View className="flex-row items-center justify-between mb-4">
              <Text className="mb-2 text-xl font-bold text-white">
                Chats Recientes
              </Text>
              {/*
               *Dependiendo de si está activada o no la bandera de isSelectionMode tenemos que rederizar el
               * botón de eliminar chats o no
               */}
              {!isSelectionMode && (
                <TouchableOpacity
                  onPress={handleDeletePress}
                  className="bg-[#1e273a] p-2 rounded-full"
                >
                  <Trash2 color="#ff6b6b" size={24} />
                </TouchableOpacity>
              )}
            </View>

            {/*En caso de que el modo de eliminar chats este activado reenderizamos el componente de la barra de selección animada*/}
            {isSelectionMode && (
              <Animated.View
                style={{
                  opacity: selectionBarOpacity,
                  transform: [
                    {
                      translateY: selectionBarOpacity.interpolate({
                        inputRange: [0, 1],
                        outputRange: [20, 0],
                      }),
                    },
                  ],
                }}
                className="mb-3"
              >
                {isSelectionMode && (
                  <View className="flex-row items-center justify-between bg-gradient-to-r from-[#1e273a] to-[#252e40] p-3 rounded-xl border border-[#323d4f]">
                    <View className="flex-row items-center">
                      <View className="bg-[#ff6b6b]/10 p-2 rounded-full mr-3">
                        <AlertCircle color="#ff6b6b" size={20} />
                      </View>
                      <Text className="text-base text-white">
                        {selectedChats.length}{" "}
                        {selectedChats.length === 1
                          ? "chat seleccionado"
                          : "chats seleccionados"}
                      </Text>
                    </View>

                    <View className="flex-row gap-3">
                      <TouchableOpacity
                        onPress={disableSelection}
                        className="bg-[#323d4f] p-2 rounded-lg"
                      >
                        <X color="white" size={20} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={confirmDeletion}
                        className="bg-[#ff6b6b] p-2 rounded-lg"
                        disabled={selectedChats.length === 0}
                        style={{
                          opacity: selectedChats.length === 0 ? 0.5 : 1,
                        }}
                      >
                        <Check color="white" size={20} />
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </Animated.View>
            )}

            <FlatList
              data={history}
              keyExtractor={(item) => item.id}
              ItemSeparatorComponent={() => <View className="h-4" />}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => handleChatPress(item)}>
                  <ChatItem
                    item={item}
                    isSelectionMode={isSelectionMode}
                    isSelected={selectedChats.some(
                      (chat) => chat.id === item.id
                    )}
                  />
                </TouchableOpacity>
              )}
            />
          </>
        ) : (
          <View className="flex items-center justify-center px-6 py-10">
            <View className="bg-gradient-to-b from-[#1e273a] to-[#101520] p-8 rounded-2xl border border-[#323d4f] w-full items-center">
              <View className="bg-[#6366ff]/10 p-5 rounded-full mb-4">
                <MessageSquareOff size={40} color="#6366ff" />
              </View>

              <Text className="mb-3 text-xl font-bold text-center text-white">
                No hay conversaciones recientes
              </Text>

              <Text className="mb-4 text-base text-center text-gray-400">
                Cuando converses con la IA, tus chats aparecerán aquí para
                facilitarte el acceso a ellos.
              </Text>

              <View className="flex-row items-center gap-2 mt-2">
                <MessagesSquare size={16} color="#6366ff" />
                <Text className="text-sm text-[#6366ff]">
                  También puedes buscar chats por fecha
                </Text>
              </View>
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

export default ChatsHistory;
