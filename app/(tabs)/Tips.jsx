import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Animated,
  ActivityIndicator,
  FlatList,
} from "react-native";
import React, { useEffect, useState, useCallback, useRef } from "react";
import { router, useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import TipItem from "../../components/TipItem";
import { xorBy } from "lodash";
import { Feather, Entypo, AntDesign } from "@expo/vector-icons";
import useTips from "../../hooks/useTips";

//Declaramos el mapeo entre los iconos que se pueden usar en el tip y su correspondiente icono de Feather
const iconMap = {
  shield: (props) => <Feather name="shield" {...props} />,
  sleep: (props) => <Feather name="moon" {...props} />,
  fitness: (props) => <Feather name="activity" {...props} />,
  food: (props) => <Feather name="coffee" {...props} />,
  alert: (props) => <Feather name="alert-circle" {...props} />,
  book: (props) => <Feather name="book" {...props} />,
  music: (props) => <Feather name="music" {...props} />,
  heart: (props) => <Feather name="heart" {...props} />,
};

/**
 * Función que servirá para mappear los iconos del objeto tip que se reciben en String en su correspondiente icono de Feather
 * @param {string} iconName - Nombre del icono que se quiere mapear
 * @returns {React.Component} - Icono correspondiente al nombre pasado por parámetro
 */
const getIcon = (iconName) => {
  const IconComponent =
    iconMap[iconName] || ((props) => <Feather name="shield" {...props} />); // Si no se encuentra el icono, se usa un icono por defecto
  return IconComponent;
};

const Tips = () => {
  /*
   *Creamos estado para guardar los tips que se seleccionan en la selección múltiple para ser eliminados
   *
   * También tenemos que crear un estado el cual funcionará como bandera para saber si estamos en el modo de selección múltiple o no
   */
  const [selectedTips, setSelectedTips] = useState([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const {
    tips,
    getTips,
    deleteTips,
    loading,
    currentPage,
    totalPages,
    totalElements,
    loadNextPage,
  } = useTips();

  // Ref para animación
  const selectionBarOpacity = useRef(new Animated.Value(0)).current;

  // Animar la entrada y salida de la barra de selección de eliminación de tips
  useEffect(() => {
    Animated.timing(selectionBarOpacity, {
      toValue: isSelectionMode ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isSelectionMode]);

  //hacemos la función para que al presionarse un tip nos lleve a la página del tip detallado correspondiente
  const handleTipPress = (tip) => {
    //Dependiendo del modo en el que estemos pulsar en un tip tendrá una acción asociada
    if (isSelectionMode) {
      setSelectedTips(xorBy(selectedTips, [tip], "id"));
    } else {
      router.push({
        pathname: "../TipDetail",
        params: { tipId: tip.id.toString() }, //Pasamos solo el id del tip para evitar problemas de serialización
      });
    }
  };

  // Ref para controlar si debemos actualizar en el focus
  const isMounted = useRef(false);
  const lastFocusTime = useRef(0);
  const isRefreshing = useRef(false);
  const initializedDone = useRef(false);

  // Cargar los tips cuando se monta el componente
  useEffect(() => {
    if (!initializedDone.current) {
      getTips();
      console.log("useEffect mounted");
      initializedDone.current = true;
      lastFocusTime.current = Date.now();
    }
    isMounted.current = true; //Ha finalizado el montaje inicial
  }, []);

  //useEffect que se ejecutará cada vez que la pantalla reciba el foco
  useFocusEffect(
    useCallback(() => {
      // Evitar múltiples llamadas en un corto período de tiempo
      const now = Date.now();
      if (
        isMounted.current &&
        now - lastFocusTime.current > 1000 &&
        !isRefreshing.current &&
        initializedDone.current
      ) {
        console.log("TIPS SCREEN FOCUSED - RELOADING TIPS");
        getTips();
        lastFocusTime.current = now;
      }
      return () => {
        //Función de limpiado
      };
    }, [getTips])
  );

  // Función para refrescar los tips manualmente
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    isRefreshing.current = true;
    await getTips();
    console.log("onRefresh");
    setRefreshing(false);
    //Desactivamos la referencia después de un breve retraso para evitar llamada del useFocusEffect
    setTimeout(() => {
      isRefreshing.current = false;
      lastFocusTime.current = Date.now();
    }, 1000);
  }, []);

  // Función para confirmar la eliminación de los tips que han sido seleccionados
  const confirmDeletion = async () => {
    if (selectedTips.length > 0) {
      console.log(
        "Eliminando lo siguientes tips: " +
          selectedTips.map((tip) => tip.title).join(", ") //Enseñamos los title de los tips que han sido eliminados separados mediante comas
      );
      //llamamos al endpoint de eliminar tips pasandole un array que contiene solo los ids de los tips que se han seleccionado y están en el estado
      await deleteTips(selectedTips.map((tip) => tip.id));
      setSelectedTips([]); //Limpiamos los tips seleccionados
      setIsSelectionMode(false);
    }
  };

  //Función que se encarga de poner el modo de múltiple selección activado para su uso
  const handleDeletePress = () => {
    setIsSelectionMode(true);
  };

  //Función que se encarga de cancelar la eliminación múltiple y volver al estado por default
  const disableSelection = () => {
    setIsSelectionMode(false);
    setSelectedTips([]);
  };

  // Componente para el footer con información de paginación y loading
  const PaginationFooter = () => {
    if (tips.length === 0) return null;

    return (
      <View className="items-center px-4 py-6">
        {/* Indicador de carga cuando se están cargando más tips */}
        {loadingMore && (
          <View className="flex-row items-center mb-4">
            <ActivityIndicator size="small" color="#6366ff" />
            <Text className="ml-2 text-sm text-white">
              Cargando más tips...
            </Text>
          </View>
        )}

        {/* Información de paginación */}
        <View className="bg-[#1e273a]/50 px-4 py-2 rounded-full border border-[#323d4f]/30">
          <Text className="text-xs text-center text-white/70">
            {tips.length} de {totalElements} tips • Página {currentPage + 1} de{" "}
            {totalPages}
          </Text>
        </View>

        {/* Mensaje cuando no hay más contenido */}
        {currentPage + 1 >= totalPages && totalElements > 7 && !loadingMore && (
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

  // tips de ejemplo para el fondo del placeholder
  const sampleTips = [
    {
      id: "sample1",
      title: "Mantén un horario regular",
      description: "Acuéstate y levántate a la misma hora todos los días.",
      icon: "sleep",
      color: "#9C7CF4",
    },
    {
      id: "sample2",
      title: "Evita la cafeína",
      description: "No consumas cafeína al menos 6 horas antes de acostarte.",
      icon: "food",
      color: "#7CB4F4",
    },
    {
      id: "sample3",
      title: "Ambiente tranquilo",
      description: "Mantén tu habitación oscura, fresca y silenciosa.",
      icon: "heart",
      color: "#F47CB4",
    },
  ];

  // Componente que representa el placeholder cuando no hay tips
  const EmptyTipsPlaceholder = () => (
    <View className="flex flex-col items-center justify-end w-full h-[85%]">
      {/* Blurred background with sample tips */}
      <View style={styles.blurredBackground} className="absolute w-full h-full">
        <View className="mt-10 opacity-20">
          {sampleTips.map((tip, index) => (
            <View key={index} className="mx-4 my-2">
              <TipItem
                title={tip.title}
                description={tip.description}
                icon={getIcon(tip.icon)}
                color={tip.color}
                isSelectionMode={false}
                isSelected={false}
              />
            </View>
          ))}
        </View>
      </View>

      {/* Foreground content */}
      <View className="z-10 flex flex-col items-center justify-center gap-6 px-8">
        <Entypo name="light-bulb" color="#6366ff" size={80} />
        <View className="items-center">
          <Text className="text-2xl font-bold text-[#6366ff] mb-2 text-center">
            No tienes tips disponibles
          </Text>
          <Text className="text-base text-center text-white">
            Aquí aparecerán consejos personalizados para mejorar la calidad de
            tu sueño basados en tus datos de descanso.
          </Text>
          <Text className="mt-4 text-base text-center text-white">
            Continúa usando la aplicación para recibir sugerencias que te
            ayudarán a descansar mejor.
          </Text>
        </View>

        {/* Button to navigate to Stats */}
        <TouchableOpacity
          onPress={() => router.push("./Stats")}
          className="mt-6 bg-[#6366ff] px-12 py-4 rounded-full flex flex-row items-center justify-center"
        >
          <View className="flex flex-row items-center justify-center gap-4">
            <Feather name="pie-chart" color="white" size={20} />
            <Text className="text-lg text-white font-psemibold">
              Ir a Estadísticas
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="w-full h-full bg-primary">
      <View className="flex flex-col items-center self-center justify-start w-full h-full gap-4 mt-3">
        {/*Header*/}
        <View className="flex-row items-center justify-between w-[90%]">
          <Text
            className="text-center font-bold text-[#6366ff] py-4"
            style={{ fontSize: 24 }}
          >
            Tips para un mejor Sueño
          </Text>

          {/*
           * Mostramos el botón de eliminar solo si no estamos en modo selección
           * y si hay tips disponibles
           */}
          {!isSelectionMode && tips.length > 0 && (
            <TouchableOpacity
              onPress={handleDeletePress}
              className="bg-[#1e273a] p-2 rounded-full"
            >
              <Feather name="trash-2" color="#ff4757" size={24} />
            </TouchableOpacity>
          )}
        </View>

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
            }}
            className="mb-3"
          >
            <View className="flex-row items-center justify-between bg-[#1e273a] p-3 rounded-xl border border-[#323d4f]">
              <View className="flex-row items-center">
                <View className="bg-[#ff4757]/10 p-2 rounded-full mr-3">
                  <Feather name="alert-circle" color="#ff4757" size={20} />
                </View>
                <Text className="text-base text-white">
                  {selectedTips.length}{" "}
                  {selectedTips.length === 1
                    ? "tip seleccionado"
                    : "tips seleccionados"}
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
                  disabled={selectedTips.length === 0}
                  style={{ opacity: selectedTips.length === 0 ? 0.5 : 1 }}
                >
                  <Feather name="check" color="white" size={20} />
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        )}

        {tips.length > 0 ? (
          <FlatList
            data={tips}
            keyExtractor={(item, index) => `${item.id}-${index}`}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={{ width: "90%", alignSelf: "center" }}
                onPress={() => handleTipPress(item)}
              >
                <TipItem
                  title={item.title}
                  description={item.description}
                  icon={getIcon(item.icon)}
                  color={item.color}
                  isSelectionMode={isSelectionMode}
                  isSelected={selectedTips.some((t) => t.id === item.id)}
                />
              </TouchableOpacity>
            )}
            ItemSeparatorComponent={() => <View className="h-4" />}
            ListFooterComponent={PaginationFooter}
            onEndReached={async () => {
              if (!loadingMore && !loading && currentPage + 1 < totalPages) {
                setLoadingMore(true);
                console.log("LLAMANDO A LA FUNCIÓN loadNextPage");
                await loadNextPage();
                setLoadingMore(false);
              }
            }}
            onEndReachedThreshold={0.3} //Se llama a la función loadNextPage cuando se ha llegado al 30% del final de la lista
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={["#6366ff"]}
                tintColor="#6366ff"
              />
            }
            showsVerticalScrollIndicator={true}
            indicatorStyle="white"
            contentContainerStyle={{
              paddingVertical: 16,
              flexGrow: 1,
            }}
            removeClippedSubviews={true} //Solo los tips visibles y algunos cercanos están en memoria, no todos
            initialNumToRender={7} //Cantidad de tips que se renderizan al inicio
            maxToRenderPerBatch={7} //Cantidad de tips que se renderizan en cada batch
            windowSize={10} //Cantidad de tips que se renderizan en el viewport
            className="flex-1 w-full"
          />
        ) : (
          <EmptyTipsPlaceholder />
        )}
      </View>
    </SafeAreaView>
  );
};

// Estilos para el fondo desenfocado
const styles = StyleSheet.create({
  blurredBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.35,
  },
});

export default Tips;
