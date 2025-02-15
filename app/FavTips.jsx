import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeft, BookmarkCheck } from "lucide-react-native";
import { router } from "expo-router";
import { tips } from "../constants/tips";

const FavTips = () => {
  // Simulamos los tips favoritos del usuario
  //TODO: Aqui mediante un useEffect tendremos que recuperar los tips favs del user
  const favoriteTips = [
    tips[0], // Example: first tip is favorited
    tips[2], // Example: third tip is favorited
  ];

  return (
    <SafeAreaView className="flex-1 bg-primary">
      {/* Header de la sección con el botón de volver */}

      <View className="p-2">
        <Text
          className="text-center font-bold text-[#6366ff] py-4 "
          style={{ fontSize: 24 }}
        >
          Tips Favoritos
        </Text>
      </View>

      <View className="flex-row items-center px-4 py-2">
        <TouchableOpacity
          /*Volvemos a la página anterior, expo sabe de donde venimos por lo que no le supone un problemas retroceder
        evitando asi tener que hacer nosotros comprobaciones manuales*/
          onPress={() => router.back()}
          className="flex-row gap-2 items-center"
        >
          <ChevronLeft size={24} color="white" />
          <Text className="text-lg text-white font-psemibold">
            Volver al perfil
          </Text>
        </TouchableOpacity>
      </View>

      {/* TODO: Los tips favs se reenderizan si de el endpoint de la api recuperamos un array lleno, si esta vacío tenemos que ponerle
      al user un mensaje de que en este momento no tiene tips en favs */}
      {favoriteTips.length === 0 ? (
        <View className="flex-1 justify-center items-center px-6">
          <Text className="text-lg text-center text-white">
            Aún no has guardado ningún tip. Explora los tips y guarda los que
            más te gusten.
          </Text>
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingVertical: 16 }}
        >
          {/* Aquí tenemos que recorrer el array de tips favs y mostrarlos en pantalla */}
          {favoriteTips.map((tip, index) => (
            <TouchableOpacity
              key={index}
              className="bg-[#1e273a] mx-4 mb-4 p-4 rounded-lg border border-[#323d4f] flex-row items-center"
              onPress={() =>
                router.push({
                  pathname: "/TipDetail",
                  params: { tipId: tip.id },
                })
              }
            >
              {tip.icon && <tip.icon color={tip.color} size={24} />}
              <Text
                //Hacemos que la box de el texto ocupe el 100% de ancho que tiene disponible a su continuación
                className="flex-1 ml-4 text-lg text-white font-psemibold"
                numberOfLines={2}
              >
                {tip.title}
              </Text>
              <BookmarkCheck color="#6366ff" size={24} />
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default FavTips;
