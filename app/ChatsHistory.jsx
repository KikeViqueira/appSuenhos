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
  ActivityIndicator,
  ScrollView,
} from "react-native";
import React, { useEffect, useState, useRef, useMemo } from "react";
import {
  Feather,
  AntDesign,
  Entypo,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
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
  const [hasSearched, setHasSearched] = useState(false);
  //Estado para saber si el user puede hacer un chat o no
  const [hasDoneChat, setHasDoneChat] = useState(false); // Por defecto indicamos que el user no ha hecho un chat hoy

  // Estados para controlar la visualización de los selectores de fecha
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [activeDatePicker, setActiveDatePicker] = useState(null); // 'start' o 'end'

  //Estados para manejar de que manera se tiene que ir a la pantalla de chat y que parámetros son necesarios (en este caso por ahora solo tenemos que hacer un estado para nextChatId)
  const [mode, setMode] = useState("normal");
  const [nextChatId, setNextChatId] = useState(null);

  /*
   *Creamos estado para guardar los chats que se seleccionan en la selección múltiple para ser eliminados
   *
   * También tenemos que crear un estado el cual funcionará como bandera para saber si estamos en el modo de selección múltiple o no
   */
  const [selectedChats, setSelectedChats] = useState([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  // Estados para manejar scroll infinito
  const [loadingMoreHistory, setLoadingMoreHistory] = useState(false);
  const [loadingMoreFiltered, setLoadingMoreFiltered] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Ref para animación
  const selectionBarOpacity = useRef(new Animated.Value(0)).current;

  //Importamos del hook de chat lo que nos interesa
  const {
    getHistory,
    history,
    deleteChats,
    getHasChatToday,
    getChatsByRange,
    filteredChats,
    loading,
    // Estados de paginación
    currentPage,
    totalPages,
    totalElements,
    currentPageFiltered,
    totalPagesFiltered,
    totalElementsFiltered,
    // Funciones de paginación
    loadNextPage,
    refreshHistory,
    refreshFilteredChats,
    setFilteredChats,
    setTotalElementsFiltered,
  } = useChat();

  // Animar la entrada y salida de la barra de selección
  useEffect(() => {
    Animated.timing(selectionBarOpacity, {
      toValue: isSelectionMode ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isSelectionMode]);

  const loadHistoryData = async () => {
    await getHistory(); //Recuperamos el historial de chats
    const hasChat = await getHasChatToday(); //Recuperamos el estado de si el user puede hacer un nuevo chat o no
    setHasDoneChat(hasChat); //Guardamos el estado de si el user ha hecho un chat hoy o no
  };

  useEffect(() => {
    //Cargamos la información necesaria al iniciar el componente
    loadHistoryData();
  }, []);

  // Función para manejar el refresh manual (pull to refresh)
  const onRefreshHistory = async () => {
    setRefreshing(true);
    await refreshHistory();
    const hasChat = await getHasChatToday();
    setHasDoneChat(hasChat);

    // Si había búsqueda activa, también refrescamos los filtrados
    if (hasSearched) {
      const startDateString = formatDate(startDate);
      const endDateString = formatDate(endDate);
      await getChatsByRange(startDateString, endDateString);
    }
    setRefreshing(false);
  };

  // Función para cargar más chats del historial
  const handleLoadMoreHistory = async () => {
    if (loadingMoreHistory || loading || currentPage + 1 >= totalPages) return;

    setLoadingMoreHistory(true);
    await loadNextPage(false); // false = historial, no filtrados
    setLoadingMoreHistory(false);
  };

  // Función para cargar más chats filtrados
  const handleLoadMoreFiltered = async () => {
    if (
      loadingMoreFiltered ||
      loading ||
      currentPageFiltered + 1 >= totalPagesFiltered
    )
      return;

    setLoadingMoreFiltered(true);
    await loadNextPage(true); // true = filtrados
    setLoadingMoreFiltered(false);
  };

  // Componente footer para historial con paginación
  const HistoryFooter = () => {
    if (history.length === 0) return null;

    return (
      <View className="items-center px-4 py-6">
        {/* Indicador de carga cuando se están cargando más chats */}
        {loadingMoreHistory && (
          <View className="flex-row items-center mb-4">
            <ActivityIndicator size="small" color="#6366ff" />
            <Text className="ml-2 text-sm text-white">
              Cargando más chats...
            </Text>
          </View>
        )}

        {/* Información de paginación */}
        <View className="bg-[#1e273a]/50 px-4 py-2 rounded-full border border-[#323d4f]/30">
          <Text className="text-xs text-center text-white/70">
            {history.length} de {totalElements} chats en total
          </Text>
        </View>

        {/* Mensaje cuando no hay más contenido */}
        {currentPage + 1 >= totalPages &&
          totalElements > 7 &&
          !loadingMoreHistory && (
            <View className="flex-row items-center mt-4">
              <View className="h-px bg-[#323d4f] flex-1" />
              <Text className="mx-4 text-base text-white/50">
                Has llegado al final
              </Text>
              <View className="h-px bg-[#323d4f] flex-1" />
            </View>
          )}
      </View>
    );
  };

  // Componente footer para chats filtrados con paginación
  const FilteredFooter = () => {
    if (filteredChats.length === 0) return null;

    return (
      <View className="items-center px-4 py-6">
        {/* Indicador de carga cuando se están cargando más chats */}
        {loadingMoreFiltered && (
          <View className="flex-row items-center mb-4">
            <ActivityIndicator size="small" color="#6366ff" />
            <Text className="ml-2 text-sm text-white">
              Cargando más resultados...
            </Text>
          </View>
        )}

        {/* Información de paginación */}
        <View className="bg-[#1e273a]/50 px-4 py-2 rounded-full border border-[#323d4f]/30">
          <Text className="text-xs text-center text-white/70">
            {filteredChats.length} de {totalElementsFiltered} chats filtrados
          </Text>
        </View>

        {/* Mensaje cuando no hay más contenido */}
        {currentPageFiltered + 1 >= totalPagesFiltered &&
          totalElementsFiltered > 7 &&
          !loadingMoreFiltered && (
            <View className="flex-row items-center mt-4">
              <View className="h-px bg-[#323d4f] flex-1" />
              <Text className="mx-4 text-base text-white/50">
                No hay más chats en este rango de fechas
              </Text>
              <View className="h-px bg-[#323d4f] flex-1" />
            </View>
          )}
      </View>
    );
  };

  const handleChatPress = async (chat) => {
    //Dependiendo del modo en el que estemos pulsar en un chat tendrá una acción asociada
    if (isSelectionMode) {
      setSelectedChats(xorBy(selectedChats, [chat], "id"));
    } else {
      console.log("Seleccionando chat para ver:", chat.id, chat.name);
      console.log("Navegando de regreso a la pantalla de chat");
      // Esperamos un poco para asegurar que AsyncStorage se ha actualizado
      setTimeout(() => {
        /*
         * Tenemos que reemplazar el chat actual por el que ha seleccionado el user
         * Y mandarle por params el id del chat seleccionado
         * para que se dispare el useEffect del componente de chat y cargar así la conversación de dicho chat
         */
        router.replace({
          pathname: "./(tabs)/Chat",
          params: { chatId: chat.id.toString() },
        });
      }, 100);
    }
  };

  //Función que se encargará de poner el modo de múltiple selección activado para su uso y ocultar los chtas que se han filtrado en caso de que el user haya hecho una búsqueda, además tenemos que reiniciar el estado de búsqueda para no estar en estados inconsistentes
  const handleDeletePress = () => {
    setIsSelectionMode(true);
    setFilteredChats([]);
    setHasSearched(false);
  };

  //Función que se encarga de cancelar la eliminación múltiple y volver al estado por default
  const disableSelection = () => {
    setIsSelectionMode(false);
    setSelectedChats([]);
  };

  //Función para confirmar la eliminación de los chats que han sido seleccionados
  const confirmDeletion = async () => {
    if (selectedChats.length === 0) return;

    try {
      // Mostrar los chats que se van a eliminar en la consola para depuración
      console.log(
        "Eliminando chats: " + selectedChats.map((chat) => chat.name).join(", ")
      );

      // Llamamos a la función de eliminar chats y esperamos su resultado
      const result = await deleteChats(selectedChats.map((chat) => chat.id));
      console.log("Resultado de eliminación:", result);

      // Limpiamos la selección y desactivamos el modo de selección
      setSelectedChats([]);
      setIsSelectionMode(false);

      // Si se eliminó el chat que estaba abierto, necesitamos navegar
      if (result.deletedOpenChat) {
        if (result.nextChatId) {
          // Si hay un chat disponible (normalmente el de hoy), navegamos a él
          console.log("Navegando al chat con ID:", result.nextChatId);
          setMode("goToChatToday");
          setNextChatId(result.nextChatId);
        } else if (!result.hasChatToday) {
          // Si no hay un chat de hoy disponible, navegamos a la pantalla principal sin chatId
          // Esto mostrará la pantalla de bienvenida para crear un nuevo chat
          console.log("Navegando a pantalla principal para crear nuevo chat");
          setMode("goToCreateChat");
          setNextChatId(undefined);
        } else {
          // El usuario ya ha hecho un chat hoy pero lo ha borrado,
          // mostrará la pantalla de "vuelve mañana"
          console.log("Navegando a pantalla de 'vuelve mañana'");
          setMode("goToTomorrowMessage");
        }
      } else {
        // Si no se eliminó el chat abierto, recargamos la lista de chats para actualizar la UI

        //TODO: TAL Y COMO ESTAN LOS ENDPOINTS CREO QUE ESTO SOBRA PERO BUENO

        await refreshHistory();

        // Si había búsqueda activa, también refrescamos los filtrados
        if (hasSearched) {
          const startDateString = formatDate(startDate);
          const endDateString = formatDate(endDate);
          await getChatsByRange(startDateString, endDateString);
        }
      }
    } catch (error) {
      console.error("Error en la eliminación de chats:", error);
      Alert.alert(
        "Error",
        "Ocurrió un problema al eliminar los chats seleccionados."
      );
    }
  };

  //Función que cuando se cierre el historial de chats volverá a la pantalla de chat de la manera correcta
  const handleBackToChat = () => {
    switch (mode) {
      case "goToChatToday":
        router.replace({
          pathname: "./(tabs)/Chat",
          params: { chatId: nextChatId.toString() },
        });
        break;
      case "goToCreateChat":
        router.replace({
          pathname: "./(tabs)/Chat",
          params: { chatId: undefined },
        });
        break;
      case "goToTomorrowMessage":
        router.replace({
          pathname: "./(tabs)/Chat",
          params: { showTomorrowMessage: "true" },
        });
        break;
      default:
        //En caso de que no se cumplan ninguna de las condiciones hacemos la acción por default
        router.back();
        break;
    }
    setMode("normal");
    setNextChatId(null);
  };

  // Función para formatear fecha a YYYY-MM-DD
  const formatDate = (date) => {
    return date.toISOString().split("T")[0];
  };

  // Obtenemos los chats en el rango de fechas seleccionado
  const handleSearchByDateRange = async () => {
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

    // Obtenemos los chats cuyas fechas están entre las dos que ha introducido el user
    await getChatsByRange(startDateString, endDateString);
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
      <Text className="mb-1 text-base text-white">{label}</Text>
      <TouchableOpacity
        onPress={() => openDatePicker(pickerType)}
        className="flex-row items-center bg-[#1e273a] p-3 py-5 rounded-xl w-full"
      >
        <View className="flex-row gap-2 items-center">
          <Feather name="calendar" size={16} color="#6366ff" />
          <Text className="text-white">{date.toLocaleDateString()}</Text>
        </View>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 w-full bg-primary">
      <View className="flex flex-row gap-4 justify-start items-center p-4">
        <TouchableOpacity onPress={handleBackToChat}>
          <AntDesign name="close" size={32} color={"#6366ff"} />
        </TouchableOpacity>
        <Text
          className="text-center font-bold text-[#6366ff] py-4"
          style={{ fontSize: 24 }}
        >
          Historial de Chats
        </Text>
        {/*Botón que se eneseñará cuando el user no haya hecho un chat en el día de hoy*/}
        {!hasDoneChat && (
          <TouchableOpacity
            onPress={() => router.replace("./(tabs)/Chat")}
            className="absolute right-5 bg-[#6366ff] p-3 rounded-full"
          >
            <Entypo name="new-message" size={24} color="white" />
          </TouchableOpacity>
        )}
      </View>

      {/*Buscador de chats por rango de fechas*/}
      {/*Si existe algún chat asociado al user enseñamos el componente de selección de chats mediante rango de fechas*/}

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={true}
        indicatorStyle="white"
        refreshing={refreshing}
        onRefresh={onRefreshHistory}
        contentContainerStyle={{
          paddingBottom: 20,
        }}
      >
        {/*En caso de que esté el modo eliminación activado no dejamos hacer la búsqueda*/}
        {history.length > 0 && !isSelectionMode && (
          <View className="w-[90%] self-center bg-[#1e2a47] border-[#323d4f] p-4 rounded-xl mb-4">
            <Text className="mb-3 text-lg font-semibold text-white">
              Buscar chats por rango de fechas
            </Text>

            <View className="flex-row justify-between items-center w-full">
              <DatePickerWithLabel
                label="Desde"
                date={startDate}
                pickerType="start"
              />

              <Feather name="arrow-right" size={20} color="#6366ff" />

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

        {/* Barra de selección animada */}
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
              width: "90%",
              alignSelf: "center",
            }}
            className="mb-3"
          >
            <View className="flex-row items-center justify-between bg-[#1e273a] p-3 rounded-xl border border-[#323d4f]">
              <View className="flex-row items-center">
                <View className="bg-[#ff4757]/10 p-2 rounded-full mr-3">
                  <Feather name="alert-circle" color="#ff4757" size={20} />
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
                  <AntDesign name="close" color="white" size={20} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={confirmDeletion}
                  className="bg-[#ff4757] p-2 rounded-lg"
                  disabled={selectedChats.length === 0}
                  style={{ opacity: selectedChats.length === 0 ? 0.5 : 1 }}
                >
                  <Feather name="check" color="white" size={20} />
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        )}

        {/*Renderizamos los chats filtrados por rango de fechas*/}
        {hasSearched && filteredChats.length > 0 && (
          <View className="w-[90%] self-center mb-4">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-semibold text-white">
                Resultados de búsqueda (
                {totalElementsFiltered || filteredChats.length})
              </Text>

              <TouchableOpacity
                onPress={() => {
                  setFilteredChats([]);
                  setHasSearched(false);
                  setTotalElementsFiltered(0);
                }}
                className="bg-[#ff4757]/10 px-3 py-2 rounded-full flex-row items-center gap-1"
              >
                <Feather name="x" size={16} color="#ff4757" />
                <Text className="text-base font-medium text-[#ff4757]">
                  Limpiar filtros
                </Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={filteredChats}
              keyExtractor={(item) => `filtered-${item.id}`}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => handleChatPress(item)}
                  className="mb-3"
                  disabled={isSelectionMode}
                >
                  <ChatItem
                    item={item}
                    isSelectionMode={isSelectionMode}
                    isSelected={selectedChats.some(
                      (chat) => chat.id === item.id
                    )}
                    isFiltered={true}
                  />
                </TouchableOpacity>
              )}
              ListEmptyComponent={null}
              ListFooterComponent={FilteredFooter}
              onEndReached={handleLoadMoreFiltered}
              onEndReachedThreshold={0.3}
              scrollEnabled={false}
              nestedScrollEnabled={true}
              contentContainerStyle={{
                paddingBottom: 10,
              }}
              showsVerticalScrollIndicator={false}
              removeClippedSubviews={true}
              initialNumToRender={7}
              maxToRenderPerBatch={7}
              windowSize={10}
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

        {/*Renderizamos los últimos chats recientes*/}
        {history.length > 0 ? (
          <View className="w-[90%] self-center">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-bold text-white">
                Chats Recientes
              </Text>
              {/*
               *Dependiendo de si está activada o no la bandera de isSelectionMode tenemos que renderizar el
               * botón de eliminar chats o no
               */}
              {!isSelectionMode && (
                <TouchableOpacity
                  onPress={handleDeletePress}
                  className="bg-[#ff4757]/10 p-3 rounded-full border border-[#ff4757]/20"
                >
                  <Feather name="trash-2" color="#ff4757" size={24} />
                </TouchableOpacity>
              )}
            </View>

            <FlatList
              data={history}
              keyExtractor={(item) => `history-${item.id}`}
              ItemSeparatorComponent={() => <View className="h-4" />}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => handleChatPress(item)}>
                  <ChatItem
                    item={item}
                    isSelectionMode={isSelectionMode}
                    isSelected={selectedChats.some(
                      (chat) => chat.id === item.id
                    )}
                    isFiltered={false}
                  />
                </TouchableOpacity>
              )}
              ListFooterComponent={HistoryFooter}
              onEndReached={handleLoadMoreHistory}
              onEndReachedThreshold={0.3}
              scrollEnabled={false}
              nestedScrollEnabled={true}
              showsVerticalScrollIndicator={false}
              removeClippedSubviews={true}
              initialNumToRender={7}
              maxToRenderPerBatch={7}
              windowSize={10}
              contentContainerStyle={{
                paddingBottom: 10,
              }}
            />
          </View>
        ) : (
          <View className="flex-1 items-center justify-center px-6 py-10 min-h-[400px]">
            <View className="bg-gradient-to-b from-[#1e273a] to-[#101520] p-8 rounded-2xl border border-[#323d4f] w-full items-center">
              <View className="bg-[#6366ff]/10 p-5 rounded-full mb-4">
                <MaterialCommunityIcons
                  name="message-off-outline"
                  size={40}
                  color="#6366ff"
                />
              </View>

              <Text className="mb-3 text-xl font-bold text-center text-white">
                No hay conversaciones recientes
              </Text>

              <Text className="mb-4 text-base text-center text-gray-400">
                Cuando converses con la IA, tus chats aparecerán aquí para
                facilitarte el acceso a ellos.
              </Text>

              <View className="flex-row gap-2 items-center mt-2">
                <Feather name="message-square" size={16} color="#6366ff" />
                <Text className="text-sm text-[#6366ff]">
                  Podrás buscar chats por rango de fechas
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default ChatsHistory;
