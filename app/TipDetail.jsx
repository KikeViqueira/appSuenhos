import {
  View,
  Text,
  SectionList,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Animated,
} from "react-native";
import React, { useEffect, useState, useRef } from "react";
import { router, useLocalSearchParams } from "expo-router";
import {
  ChevronLeft,
  Bookmark,
  BookmarkCheck,
  Shield,
  Bed,
  Activity,
  Apple,
  AlertCircle,
  Book,
  Music,
  Heart,
  ChevronDown,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import useTips from "../hooks/useTips";
import NotFound from "../components/NotFound";
import LoadingBanner from "../components/LoadingBanner";

// Mapa de iconos disponibles
const iconMap = {
  shield: Shield,
  sleep: Bed,
  fitness: Activity,
  food: Apple,
  alert: AlertCircle,
  book: Book,
  music: Music,
  heart: Heart,
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
    return iconMap[iconName] || Shield; // Si no se encuentra, usamos Shield como fallback
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
      // Actualizar estado favorito
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

    const layoutHeight = event.nativeEvent.layoutMeasurement.height; //Altura en si de la caja del scroll
    const contentHeight = event.nativeEvent.contentSize.height; //Altura total del contenido del scroll
    //Definimos donde es el final de la página para quitar el indicador de scroll
    const isEndReached = layoutHeight + offsetY >= contentHeight - 35;

    if (isEndReached && showScrollIndicator) {
      // Fade out animation when reaching the bottom
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setShowScrollIndicator(false);
      });
    } else if (!isEndReached && !showScrollIndicator) {
      // Fade in animation when not at the bottom
      setShowScrollIndicator(true);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  // Si está cargando, mostrar un indicador de carga
  if (isLoading) {
    return (
      <SafeAreaView className="items-center justify-center flex-1 bg-primary">
        <LoadingBanner />
        <Text className="mt-4 text-lg text-white">
          Cargando información del tip...
        </Text>
      </SafeAreaView>
    );
  }

  // Si no hay datos del tip después de la carga, mostrar un mensaje de error
  if (!tipSelectedDetail || Object.keys(tipSelectedDetail).length === 0) {
    return (
      <SafeAreaView className="items-center justify-center flex-1 bg-primary">
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
    <SafeAreaView className="flex-1 w-full h-full pt-3 bg-primary">
      {/* En caso de que el contenido se desborde de la pantalla, se desplazara hacia arriba gracias a flexGrow y ScrollView */}

      {/* Botón de volver junto con el icono de bookmark */}
      <View className="flex flex-row items-center justify-between px-8">
        <TouchableOpacity
          onPress={() => router.back()}
          className="flex flex-row items-center gap-2 py-4"
        >
          <ChevronLeft size={24} color="white" />
          <Text className="text-lg font-semibold color-white">
            Volver a la lista de tips
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={toggleFavorite} disabled={isLoading}>
          {isFavorite ? (
            <BookmarkCheck size={28} color="#6366ff" />
          ) : (
            <Bookmark size={28} color="white" />
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
            <View className="flex flex-row items-end justify-center gap-4">
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
            <ChevronDown size={24} color="white" />
          </View>
        </Animated.View>
      )}
    </SafeAreaView>
  );
};

export default TipDetail;
