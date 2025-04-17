import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from "react-native";
import React, { useEffect, useState, useCallback } from "react";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import TipItem from "../../components/TipItem";
import { xorBy } from "lodash";
import {
  Shield,
  Bed,
  Activity,
  Apple,
  AlertCircle,
  Book,
  Music,
  Heart,
  Trash2,
  Check,
  X,
  LightbulbOff,
  PieChart,
} from "lucide-react-native";
import useTips from "../../hooks/useTips";

//Declaramos el mapeo entre los iconos que se pueden usar en el tip y su correspondiente icono de lucide react-native
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

/**
 * Función que servirá para mappear los iconos del objeto tip que se reciben en String en su correspondiente icono de lucide react-native
 * @param {string} iconName - Nombre del icono que se quiere mapear
 * @returns {React.Component} - Icono correspondiente al nombre pasado por parámetro
 */
const getIcon = (iconName) => {
  const IconComponent = iconMap[iconName] || Shield; // Si no se encuentra el icono, se usa un icono por defecto
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
  const { tips, getTips, deleteTips, loading } = useTips();

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

  // Cargar los tips cuando se monta el componente
  useEffect(() => {
    getTips();
  }, []);

  // Función para refrescar los tips manualmente
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await getTips();
    setRefreshing(false);
  }, []);

  //Función que se encarga de poner el modo de múltiple selección activado para su uso
  const handleDeletePress = () => {
    setIsSelectionMode(true);
  };

  //Función que se encarga de cancelar la eliminación múltiple y volver al estado por default
  const disableSelection = () => {
    setIsSelectionMode(false);
    setSelectedTips([]);
  };

  //Función para confirmar la eliminación de los tips que han sido seleccionados
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
        <LightbulbOff color="#6366ff" size={80} strokeWidth={1.5} />
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
            <PieChart color="white" size={20} />
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
            //Dejamos eliminar los tips cuando haya
            tips.length > 0 && (
              <TouchableOpacity onPress={handleDeletePress}>
                <Trash2 color="#ff6b6b" size={28} />
              </TouchableOpacity>
            )
          )}
        </View>

        {tips.length > 0 ? (
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1, //Puede crecer y adaptarse al nuevo tamaño y scroll
              gap: 16,
              alignItems: "center", // Centramos los elementos
            }}
            showsVerticalScrollIndicator={true}
            indicatorStyle="white"
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={["#6366ff"]}
                tintColor="#6366ff"
              />
            }
            className="w-full"
          >
            {tips.map((tip, index) => (
              <TouchableOpacity
                //Para cada uno de los tips hacemos un botón que nos lleve a la página del tip detallado
                key={index}
                style={{ width: "90%" }}
                onPress={() => handleTipPress(tip)}
              >
                <TipItem
                  key={index}
                  title={tip.title}
                  description={tip.description}
                  icon={getIcon(tip.icon)} //Pasamos el icono correspondiente al tip
                  color={tip.color}
                  isSelectionMode={isSelectionMode}
                  /*
                   *Recorre el arreglo selectedTips con .some(), devuelve true si encuentra un elemento con el mismo id que el tip actual.
                   */
                  isSelected={selectedTips.some((t) => t.id === tip.id)}
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
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
