import {
  View,
  Text,
  SectionList,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Animated,
  InteractionManager,
} from "react-native";
import React, { useEffect, useState, useRef } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import useTips from "../hooks/useTips";
import NotFound from "../components/NotFound";
import LoadingBanner from "../components/LoadingBanner";

// Mapa de iconos disponibles usando exclusivamente Feather
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

/*De la lista de tips, al seleccionar uno se accede a este componente y se muestra la información del tip seleccionado,
de una manera completa donde el user puede obtener más información sobre el tip en el que está interesado.
*/
const TipDetail = () => {
  const { getTipById, tipSelectedDetail, addFavoriteTip, removeFavoriteTip } =
    useTips();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(true); //Estado para controlar que el user presione el botón de favorito varias veces sin que se haya completado la petición
  const [sections, setSections] = useState([]); // Estado para almacenar las secciones
  const [showScrollIndicator, setShowScrollIndicator] = useState(true);
  const scrollY = useRef(new Animated.Value(0)).current; //Guarda la posición del scroll de manera vertical
  const scrollViewRef = useRef(null); //Referencia para el scrollView
  const fadeAnim = useRef(new Animated.Value(1)).current; //Animación para el indicador de scroll

  //Obtenemos el tipId que hemos recibido como parámetro
  const { tipId } = useLocalSearchParams();

  // Función para obtener el icono según su nombre
  const getIcon = (iconName) => {
    return (
      iconMap[iconName] || ((props) => <Feather name="shield" {...props} />)
    ); // Si no se encuentra, usamos Shield como fallback
  };

  useEffect(() => {
    const loadTipData = async () => {
      setIsLoading(true);
      if (tipId) {
        await getTipById(tipId);
      }
      setIsLoading(false);
    };

    loadTipData();
  }, [tipId]);

  // Actualizar el estado de favorito y secciones cuando se carga el detalle del tip
  useEffect(() => {
    if (tipSelectedDetail && Object.keys(tipSelectedDetail).length > 0) {
      // Actualizar estado favorito según el valor que esté en el objeto tipSelectedDetail
      if (tipSelectedDetail.isFavorite !== undefined) {
        setIsFavorite(tipSelectedDetail.isFavorite);
      }

      // Actualizar secciones para el SectionList
      const updatedSections = [];

      if (
        tipSelectedDetail.benefits &&
        Array.isArray(tipSelectedDetail.benefits) &&
        tipSelectedDetail.benefits.length > 0
      ) {
        updatedSections.push({
          title: "Beneficios",
          data: tipSelectedDetail.benefits,
          type: "bullet",
        });
      }

      if (
        tipSelectedDetail.steps &&
        Array.isArray(tipSelectedDetail.steps) &&
        tipSelectedDetail.steps.length > 0
      ) {
        updatedSections.push({
          title: "Cómo aplicarlo",
          data: tipSelectedDetail.steps,
          type: "number",
        });
      }

      setSections(updatedSections);
    }
  }, [tipSelectedDetail]);

  // Función para alternar el estado de favorito
  const toggleFavorite = async () => {
    if (!tipId || isLoading) return;

    setIsLoading(true);
    try {
      if (isFavorite) {
        await removeFavoriteTip(tipId);
      } else {
        await addFavoriteTip(tipId);
      }
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error("Error al cambiar estado de favorito:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Función para detectar si estamos al final del scroll
  const handleScroll = (event) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    scrollY.setValue(offsetY);

    const layoutHeight = event.nativeEvent.layoutMeasurement.height; // Altura de la caja del scroll
    const contentHeight = event.nativeEvent.contentSize.height; // Altura total del contenido

    // Si el scroll está cerca del final, ocultar el indicador (similar a Stats.jsx)
    if (layoutHeight + offsetY >= contentHeight - 35) {
      setShowScrollIndicator(false);
    } else {
      setShowScrollIndicator(true);
    }
  };

  // Efecto para manejar la animación del indicador cuando cambia su visibilidad
  useEffect(() => {
    if (showScrollIndicator) {
      // Mostrar con animación
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      // Ocultar con animación
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [showScrollIndicator, fadeAnim]);

  // Si está cargando, mostrar un indicador de carga
  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-primary">
        <View className="flex flex-row justify-between items-center px-8 pt-3">
          <TouchableOpacity
            onPress={() => router.back()}
            className="flex flex-row gap-2 items-center py-4"
          >
            <Feather name="chevron-left" size={24} color="white" />
            <Text className="text-lg font-semibold color-white">
              Volver a la lista de tips
            </Text>
          </TouchableOpacity>
        </View>

        <View className="flex-1 justify-center items-center px-6">
          <View className="w-full bg-[#1e2a47] rounded-xl p-8">
            <View className="flex-row w-full">
              <View className="w-2 h-full bg-[#6366ff]" />
              <View className="flex-1 items-center">
                <LoadingBanner />
                <Text className="mb-2 text-xl font-bold text-white">
                  Cargando información del tip
                </Text>
                <Text className="text-base text-center text-[#8a94a6] px-4 mb-3">
                  Estamos preparando todos los detalles para que puedas mejorar
                  tu calidad de sueño.
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
      </SafeAreaView>
    );
  }

  // Si no hay datos del tip después de la carga, mostrar un mensaje de error
  if (!tipSelectedDetail || Object.keys(tipSelectedDetail).length === 0) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-primary">
        <NotFound />
        <Text className="mb-2 text-lg font-bold text-center text-white">
          No se pudo cargar la información del tip
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="mt-6 bg-[#6366ff] px-12 py-4 rounded-full flex flex-row items-center justify-center"
        >
          <Text className="text-white text-md font-psemibold">
            Volver a la lista de tips
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // Obtener el componente de icono según el nombre guardado en tipSelectedDetail
  const IconComponent = getIcon(tipSelectedDetail.icon);

  return (
    <SafeAreaView className="flex-1 pt-3 w-full h-full bg-primary">
      {/* En caso de que el contenido se desborde de la pantalla, se desplazara hacia arriba gracias a flexGrow y ScrollView */}

      {/* Botón de volver junto con el icono de bookmark */}
      <View className="flex flex-row justify-between items-center px-8">
        <TouchableOpacity
          onPress={() => router.back()}
          className="flex flex-row gap-2 items-center py-4"
        >
          <Feather name="chevron-left" size={24} color="white" />
          <Text className="text-lg font-semibold color-white">
            Volver a la lista de tips
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={toggleFavorite} disabled={isLoading}>
          {isFavorite ? (
            <MaterialCommunityIcons
              name="bookmark-check-outline"
              size={28}
              color="#6366ff"
            />
          ) : (
            <MaterialCommunityIcons
              name="bookmark-outline"
              size={28}
              color="white"
            />
          )}
        </TouchableOpacity>
      </View>
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 30 }}
        indicatorStyle="white"
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <View className="relative flex-1 w-full h-full">
          {/* Contenido */}
          <View className="flex flex-col gap-6 justify-center items-center w-[90%] self-center">
            {/* Icono y Título */}
            <View className="flex flex-row gap-4 justify-center items-end">
              {IconComponent && (
                <IconComponent
                  color={tipSelectedDetail.color || "#6366ff"}
                  size={30}
                />
              )}
              <Text
                className="font-bold text-[#6366ff] pt-4"
                style={{ fontSize: 24 }}
              >
                {tipSelectedDetail.title}
              </Text>
            </View>

            {/* Descripción */}
            <Text className="text-base text-white">
              {tipSelectedDetail.fullDescription}
            </Text>

            {/* Secciones - Solo mostrar si hay secciones */}
            {sections.length > 0 ? (
              <SectionList
                sections={sections}
                keyExtractor={(item, index) => item + index}
                renderSectionHeader={({ section: { title } }) => (
                  <View className="bg-[#1e273a] min-w-[100%] self-center flex flex-col justify-between p-4 gap-4 rounded-lg border border-[#323d4f] mb-2">
                    <Text className="text-[#6366ff] font-bold text-lg">
                      {title}
                    </Text>
                  </View>
                )}
                renderItem={({ item, index, section }) => (
                  <View className="flex flex-row gap-3 items-start p-4 mb-2 w-[90%]">
                    <Text className="font-bold text-[#6366ff] pt-[2px]">
                      {section.type === "number" ? `${index + 1}.` : "•"}
                    </Text>
                    <Text className="text-base text-white">{item}</Text>
                  </View>
                )}
                scrollEnabled={false} // Desactiva el scroll de SectionList
              />
            ) : null}
          </View>
        </View>
      </ScrollView>

      {/* Indicador de scroll animado */}
      {showScrollIndicator && (
        <Animated.View
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            opacity: fadeAnim,
            alignItems: "center",
            paddingBottom: 20,
          }}
        >
          <LinearGradient
            colors={["transparent", "rgba(18, 24, 38, 0.9)"]}
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: 100,
              borderRadius: 20,
            }}
          />
          <View className="bg-[#6366ff] p-2 rounded-full absolute bottom-10">
            <Feather name="chevron-down" size={24} color="white" />
          </View>
        </Animated.View>
      )}
    </SafeAreaView>
  );
};

export default TipDetail;
