import {
  View,
  Text,
  Modal,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  Platform,
  Animated,
  Alert,
} from "react-native";
import React, { useEffect, useState, useRef } from "react";
import {
  X,
  Trash2,
  Check,
  MessageSquareOff,
  MessagesSquare,
  AlertCircle,
  Calendar,
  ArrowRight,
} from "lucide-react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { xorBy } from "lodash";
import ChatItem from "../components/ChatItem";
import useChat from "../hooks/useChat";
import { router } from "expo-router";

const ChatsHistory = () => {
  //Definimos los distintos estados que necesitamos para el model
  const [startDate, setStartDate] = useState(
    new Date(new Date().setDate(new Date().getDate() - 7))
  ); // Por defecto 7 días atrás
  const [endDate, setEndDate] = useState(new Date()); // Por defecto hoy
  const [filteredChats, setFilteredChats] = useState([]); //Guardaremos el chat filtrado en base a la fecha seleccionada
  const [hasSearched, setHasSearched] = useState(false);

  // Estados para controlar la visualización de los selectores de fecha
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [activeDatePicker, setActiveDatePicker] = useState(null); // 'start' o 'end'

  /*
   *Creamos estado para guardar los chats que se seleccionan en la selección múltiple para ser eliminados
   *
   * También tenemos que crear un estado el cual funcionará como bandera para saber si estamos en el modo de selección múltiple o no
   */
  const [selectedChats, setSelectedChats] = useState([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);

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
    console.log(
      "Eliminando los siguientes chats: " +
        selectedChats.map((chat) => chat.name).join(", ") //Enseñamos los name de los chats que han sido eliminados separados mediante comas
    );
    //llamamos al endpoint de eliminar chats pasandole los ids de los chats seleccionados
    deleteChats(selectedChats.map((chat) => chat.id));
    setSelectedChats([]); //Limpiamos los tips seleccionados
    setIsSelectionMode(false);
  };

  // Función para formatear fecha a YYYY-MM-DD
  const formatDate = (date) => {
    return date.toISOString().split("T")[0];
  };

  // Obtenemos los chats en el rango de fechas seleccionado
  const handleSearchByDateRange = () => {
    // Validar que la fecha de inicio sea anterior a la fecha de fin
    if (startDate > endDate) {
      Alert.alert(
        "Error en fechas",
        "La fecha de inicio debe ser anterior a la fecha de fin",
        [{ text: "Entendido" }]
      );
      return;
    }

    setHasSearched(true);

    //En el caso de que esteamos en un dispositivo IOS tenemos que cerrar el picker en el estado que guarda cual está activo
    if (Platform.OS === "ios") {
      setActiveDatePicker(null);
    }

    // Formateamos ambas fechas a YYYY-MM-DD
    const startDateString = formatDate(startDate);
    const endDateString = formatDate(endDate);

    // Filtrar los chats cuya fecha esté entre las dos fechas seleccionadas
    const filtered = history.filter((chat) => {
      const chatDate = chat.date; // Suponemos que chat.date es YYYY-MM-DD
      return chatDate >= startDateString && chatDate <= endDateString;
    });

    setFilteredChats(filtered);
  };

  // Manejador de cambio de fecha para ambos selectores
  const handleDateChange = (event, date, pickerType) => {
    // Cerramos el picker en Android después de seleccionar
    if (Platform.OS === "android") {
      setShowStartDatePicker(false);
      setShowEndDatePicker(false);
    }

    if (date) {
      if (pickerType === "start") {
        setStartDate(date);
      } else {
        setEndDate(date);
      }
    }
  };

  // Función para abrir el selector específico en Android
  const openDatePicker = (pickerType) => {
    if (Platform.OS === "android") {
      if (pickerType === "start") {
        setShowStartDatePicker(true);
        setShowEndDatePicker(false);
      } else {
        setShowStartDatePicker(false);
        setShowEndDatePicker(true);
      }
    }

    setActiveDatePicker(pickerType);
  };

  // Componente para mostrar un selector de fecha con etiqueta
  const DatePickerWithLabel = ({ label, date, pickerType }) => (
    <View className="w-[40%]">
      <Text className="mb-1 text-base text-white ">{label}</Text>
      <TouchableOpacity
        onPress={() => openDatePicker(pickerType)}
        className="flex-row items-center bg-[#1e273a] p-3 py-5 rounded-xl w-full"
      >
        <View className="flex-row items-center gap-2">
          <Calendar size={16} color="#6366ff" />
          <Text className="text-white">{date.toLocaleDateString()}</Text>
        </View>
      </TouchableOpacity>
    </View>
  );

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

      {/*Buscador de chats por rango de fechas*/}
      {/*Si existe algún chat asociado al user enseñamos el componente de selección de chats mediante rango de fechas*/}
      {history.length > 0 && (
        <View className="w-[90%] self-center bg-[#1e2a47] p-4 rounded-xl mb-4">
          <Text className="mb-3 text-lg font-semibold text-white ">
            Buscar chats por rango de fechas
          </Text>

          <View className="flex-row items-center justify-between w-full">
            <DatePickerWithLabel
              label="Desde"
              date={startDate}
              pickerType="start"
            />

            <ArrowRight size={20} color="#6366ff" />

            <DatePickerWithLabel
              label="Hasta"
              date={endDate}
              pickerType="end"
            />
          </View>

          {/* Mostrar DateTimePicker según plataforma y estado */}
          {Platform.OS === "ios" && (
            <View className="my-2">
              {activeDatePicker === "start" && (
                <DateTimePicker
                  value={startDate}
                  mode="date"
                  display="inline"
                  textColor="white"
                  themeVariant="dark"
                  maximumDate={new Date()}
                  onChange={(event, date) =>
                    handleDateChange(event, date, "start")
                  }
                />
              )}
              {activeDatePicker === "end" && (
                <DateTimePicker
                  value={endDate}
                  mode="date"
                  display="inline"
                  textColor="white"
                  themeVariant="dark"
                  maximumDate={new Date()}
                  onChange={(event, date) =>
                    handleDateChange(event, date, "end")
                  }
                />
              )}
            </View>
          )}

          {(showStartDatePicker || showEndDatePicker) &&
            Platform.OS === "android" && (
              <DateTimePicker
                value={showStartDatePicker ? startDate : endDate}
                mode="date"
                display="default"
                maximumDate={new Date()}
                onChange={(event, date) =>
                  handleDateChange(
                    event,
                    date,
                    showStartDatePicker ? "start" : "end"
                  )
                }
              />
            )}

          <TouchableOpacity
            className="bg-[#6366ff] p-4 rounded-xl w-full"
            onPress={handleSearchByDateRange}
          >
            <Text className="text-base font-semibold text-center text-white">
              Buscar
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/*Renderizamos los chats filtrados por rango de fechas*/}
      {hasSearched && filteredChats.length > 0 && (
        <View className="w-[90%] self-center mb-4">
          <Text className="mb-2 text-lg font-semibold text-white">
            Resultados de búsqueda ({filteredChats.length})
          </Text>
          <FlatList
            data={filteredChats}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => handleChatPress(item)}
                className="mb-3"
                disabled={isSelectionMode}
              >
                <ChatItem
                  item={item}
                  isSelectionMode={isSelectionMode}
                  isSelected={selectedChats.some((chat) => chat.id === item.id)}
                />
              </TouchableOpacity>
            )}
            ListEmptyComponent={null}
            scrollEnabled={filteredChats.length > 3}
            contentContainerStyle={{
              maxHeight: 300,
              paddingBottom: 10,
            }}
          />
        </View>
      )}

      {/* Mensaje de no resultados */}
      {hasSearched && filteredChats.length === 0 && (
        <View className="w-[90%] self-center mb-4 bg-[#1e273a] p-4 rounded-xl">
          <Text className="text-base text-center text-white">
            No se encontraron chats en el rango de fechas seleccionado
          </Text>
        </View>
      )}

      {/*Renderizamos los últimos chats recientes en base a los últimos x días*/}
      <View
        className={`w-[90%] flex flex-col flex-1 gap-4 self-center
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
                  Podrás buscar chats por rango de fechas
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
