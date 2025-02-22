import {
  View,
  Text,
  Modal,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  Platform,
} from "react-native";
import React, { useState } from "react";
import { X, Trash2, Square, SquareCheckBig, Check } from "lucide-react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { xorBy } from "lodash";
import ChatItem from "./ChatItem";
import { router } from "expo-router";

const ChatsModal = ({ isVisible, onClose }) => {
  //Lista de chats estáticos que usaremos de prueba
  const chats = [
    { id: "1", date: "2024-04-01", summary: "Sueño sobre volar" },
    { id: "2", date: "2024-02-14", summary: "Estrés en el trabajo" },
    { id: "3", date: "2024-01-6", summary: "Sueño premonitorio" },
  ];
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

  const handleChatPress = (chat) => {
    //Dependiendo del modo en el que estemos pulsar en un chat tendrá una acción asociada
    if (isSelectionMode) {
      setSelectedChats(xorBy(selectedChats, [chat], "id"));
    } else {
      //TODO: AQUI TENDREMOS QUE LLAMAR AL ENDPOINT DE LA API QUE SE ENCARGA DE CARGAR LAS CONVERSACIONES DEL CHAT EN EL QUE SE HA PINCHADO
      console.log("Chat seleccionado: " + chat.summary);
      router.push("/Chat");
    }
  };

  //Función que se encargará de poner el modo de múltiple selección activado para su uso
  const handleDeletePress = (chat) => {
    setIsSelectionMode(true);
    setSelectedChats(xorBy(selectedChats, [chat], "id"));
  };

  //Función que se encarga de cancelar la eliminación múltiple y volver al estado por default
  const disableSelection = () => {
    setIsSelectionMode(false);
    setSelectedChats([]);
  };

  //Función para confirmar la eliminación de los chats que han sido seleccionados
  const confirmDeletion = () => {
    console.log(
      "Eliminando lo siguientes chats: " +
        selectedChats.map((chat) => chat.summary).join(", ") //Enseñamos los summary de los chats que han sido eliminados separados mediante comas
    );
    //TODO: AQUI TENDREMOS QUE LLAMAR EN EL FUTURO AL ENDPOINT DE LA API QUE SE ENCARGA DE ELIMINAR LOS TIPS SELECCIONADOS
    setSelectedChats([]); //Limpiamos los tips seleccionados
    setIsSelectionMode(false);
  };

  //Obtenemos los chats en base a la fecha seleccionada por el user
  const handleSearchByDate = () => {
    setHasSearched(true); //Activamos la bandera de búsqueda para saber si el user ha hecho una búsqueda
    //Pasamos la fecha a formato ISO (YYYY-MM-DDTHH:MM:SSZ), dividimos el string para obtener la parte de la fecha mediante el separador de "T"
    const formattedDate = selectedDate.toISOString().split("T")[0];
    //De los chats que tenemos renderizamos el que tenga la fecha que el user ha seleccionado
    const filtered = chats.filter((chat) => chat.date === formattedDate);
    setFilteredChats(filtered);
  };

  const [showDatePicker, setShowDatePicker] = useState(false); //Estado para saber cuando estamos en android y asi manejar su comportamiento.

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
    <View>
      <Modal visible={isVisible}>
        <SafeAreaView className="flex-1 w-full bg-primary">
          <View className="flex flex-row items-center justify-start gap-4 p-4">
            <TouchableOpacity onPress={onClose}>
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
            <Text className="text-lg text-white">
              Selecciona la fecha del chat
            </Text>

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
                display="default"
                textColor="white"
                maximumDate={new Date()} //Máxima fecha a la que el user puede seleccionar para la búsqqueda de chats
                //Cada vez que cambiamos la hora se guarda en el estado de tiempo
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
              {/*En caso de que haya un chat filtrado mostramos su contenido: Summary y date.
              En otro caso lo que hacemos es mostrar un mensaje de error diciendo al user que no se ha encontrado un chat con la fecha que esta buscando*/}
              {filteredChats.length > 0 ? (
                <View className="bg-[#1e273a] w-full flex flex-col justify-between p-6 rounded-lg">
                  <Text className="mb-2 text-xl font-bold text-white">
                    {filteredChats[0].summary}
                  </Text>
                  <Text className="text-[#6366ff]">
                    {filteredChats[0].date}
                  </Text>
                </View>
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
            {chats.length > 0 ? (
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
                  data={chats}
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
      </Modal>
    </View>
  );
};

export default ChatsModal;
