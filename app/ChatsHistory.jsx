import {
  View,
  Text,
  Modal,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  Platform,
} from "react-native";
import React, { useEffect, useState } from "react";
import { X, Trash2, Check } from "lucide-react-native";
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

  //Importamos del hook de chat lo que nos interesa
  const { getHistory, getConversationChat, history, deleteChats } = useChat();

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
          <View className="w-full">
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              textColor="white"
              themeVariant="dark" //Forzamos el tema oscuro para ios
              maximumDate={new Date()} //Máxima fecha a la que el user puede seleccionar para la búsqqueda de chats
              onChange={handleDateChange}
            />
          </View>
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
      <View className="w-[90%] flex flex-col flex-1 gap-4 self-center mt-8">
        {history.length > 0 ? (
          <>
            <View className="flex-row items-center justify-between mb-4">
              <Text className="mb-2 text-xl font-bold text-white">
                Chats Recientes
              </Text>
              {/*
               *Dependiendo de si está activada o no la bandera de isSelectionMode tenemos que rederizar un botón o el otro
               *Si está activada tenemos que cambiar el icono por uno de confirmar la eliminación
               *Si no lo está la papelera activará el modo de selección múltiple para eliminar tips
               */}
              {isSelectionMode ? (
                <View className="flex-row justify-between gap-5">
                  <TouchableOpacity onPress={disableSelection}>
                    <X color="white" size={28} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={confirmDeletion}>
                    <Check color="#ff6b6b" size={28} />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity onPress={handleDeletePress}>
                  <Trash2 color="#ff6b6b" size={28} />
                </TouchableOpacity>
              )}
            </View>
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
          <View className="flex items-center justify-center py-8">
            <Text className="text-lg text-center text-white">
              No hay chats registrados en estos momentos
            </Text>
            <Text className="text-base text-[#6366ff] text-center mt-2">
              Los chats aparecerán aquí cuando los registres
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

export default ChatsHistory;
