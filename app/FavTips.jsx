import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import React, { useCallback, useEffect, useRef } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Feather,
  MaterialCommunityIcons,
  FontAwesome5,
} from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import useTips from "../hooks/useTips";

const FavTips = () => {
  const { getFavoriteTips, favoriteTips } = useTips();

  //Declaramos las referencias para saber si tenemos que actualizar el useFocus o no
  const isMounted = useRef(false);
  const lastFocusTime = useRef(0);
  const initializedDone = useRef(false);

  useEffect(() => {
    getFavoriteTips();
    isMounted.current = true;
    lastFocusTime.current = Date.now();
    initializedDone.current = true;
  }, []);

  useFocusEffect(
    useCallback(() => {
      //Evitamos múltiples llamadas en un corto período de tiempo
      const now = Date.now();
      if (
        isMounted.current &&
        initializedDone.current &&
        now - lastFocusTime.current > 1000
      ) {
        getFavoriteTips();
        lastFocusTime.current = Date.now();
      }
      return () => {
        //Función de limpiado
      };
    }, [getFavoriteTips, favoriteTips.length])
  );

  return (
    <SafeAreaView className="w-full h-full bg-primary">
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
          <Feather name="chevron-left" size={24} color="white" />
          <Text className="text-lg text-white font-psemibold">
            Volver al perfil
          </Text>
        </TouchableOpacity>
      </View>

      {favoriteTips.length === 0 ? (
        <View className="flex-1 items-center justify-center gap-4 px-8 max-h-[75%]">
          <FontAwesome5
            name="lightbulb"
            color="#6366ff"
            size={80}
            strokeWidth={1.5}
          />
          <Text className="text-2xl font-bold text-[#6366ff] mb-2 text-center">
            No tienes tips favoritos
          </Text>
          <Text className="text-base text-center text-white">
            Explora tu colección de consejos personalizada para mejorar tu
            descanso y guarda los que más te gusten.
          </Text>
          <TouchableOpacity
            className="mt-6 bg-[#6366ff] px-12 py-4 rounded-full flex flex-row items-center justify-center"
            onPress={() => router.push("./(tabs)/Tips")}
          >
            <Text className="text-lg text-white font-psemibold">
              Ver todos los tips
            </Text>
          </TouchableOpacity>
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
              <MaterialCommunityIcons
                name="bookmark-check-outline"
                size={24}
                color="#6366ff"
              />
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default FavTips;
