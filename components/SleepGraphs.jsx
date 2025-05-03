import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import React, { useState, useEffect } from "react";
import { MaterialIcons, FontAwesome6, Feather } from "@expo/vector-icons";
import WeeklySleepChart from "./WeeklySleepChart";
import SleepPieChart from "./SleepPieChart";
import useSleep from "../hooks/useSleep";
import sleepRecommendations from "../utils/sleepRecommendations";
import UserSleepVsRecommended from "./UserSleepVsRecommended";

const SleepGraphs = ({ userInfo }) => {
  const { sleepLogsDuration, getSleepLogEndpoint } = useSleep();
  const [loading, setLoading] = useState(true);
  const [sleepStats, setSleepStats] = useState({
    averageSleep: 0,
    bestDay: { day: "", hours: 0 },
    worstDay: { day: "", hours: 0 },
    recommendation: { min: 0, ideal: 0, max: 0 },
    sleepQuality: "Buena", // Buena, Regular, Mala
    sleepDeficit: 0,
    daysAboveRecommended: 0,
    daysBelowRecommended: 0,
    sleepData: [], // Añadir los datos de sueño para la gráfica
  });

  useEffect(() => {
    // Obtener datos de sueño de la última semana
    getSleepLogEndpoint("7");
  }, []);

  useEffect(() => {
    if (
      sleepLogsDuration &&
      Object.keys(sleepLogsDuration).length > 0 &&
      userInfo
    ) {
      // Obtener recomendaciones según la edad del usuario
      const userAge = userInfo.age || 30; // Valor por defecto si no hay edad
      const recommendation = getSleepRecommendationByAge(userAge);

      // Procesar datos de sueño
      const sleepData = Object.entries(sleepLogsDuration).map(
        ([day, duration]) => {
          // Convertir minutos a horas
          const hours = Number(duration) / 60;
          return { day, hours };
        }
      );

      // Calcular estadísticas
      const totalSleep = sleepData.reduce((sum, day) => sum + day.hours, 0); //la suma debe empezar en cero, para cada uno de los objetos del mapa se suma el valor de hours
      const averageSleep = totalSleep / sleepData.length;

      // Encontrar mejor y peor día
      const bestDay = sleepData.reduce(
        (best, current) => (current.hours > best.hours ? current : best),
        { day: "", hours: 0 }
      );

      const worstDay = sleepData.reduce(
        (worst, current) =>
          worst.hours === 0 || current.hours < worst.hours ? current : worst,
        { day: "", hours: Number.MAX_VALUE }
      );

      // Calcular déficit de sueño (diferencia entre promedio y recomendado ideal)
      const sleepDeficit = recommendation.ideal - averageSleep;

      // Contar días por encima y por debajo de lo recomendado
      const daysAboveRecommended = sleepData.filter(
        (day) => day.hours >= recommendation.min
      ).length;
      const daysBelowRecommended = sleepData.length - daysAboveRecommended;

      // Determinar calidad del sueño
      let sleepQuality = "Buena";
      if (averageSleep < recommendation.min) {
        sleepQuality = "Mala";
      } else if (averageSleep < recommendation.ideal) {
        sleepQuality = "Regular";
      }

      // Actualizar estado
      setSleepStats({
        averageSleep,
        bestDay,
        worstDay: {
          day: worstDay.day,
          hours: worstDay.hours === Number.MAX_VALUE ? 0 : worstDay.hours,
        },
        recommendation,
        sleepQuality,
        sleepDeficit,
        daysAboveRecommended,
        daysBelowRecommended,
        sleepData, // Añadir los datos de sueño para la gráfica
      });
      setLoading(false);
    }
  }, [sleepLogsDuration, userInfo]);

  // Función para obtener recomendaciones de sueño según la edad
  const getSleepRecommendationByAge = (age) => {
    // Encontrar el rango de edad correspondiente
    for (const rec of sleepRecommendations.sleepRecommendations) {
      const range = rec.ageRange.split("-");

      /*
       * En base a la edad del user conseguimos la recomendación de sueño
       */

      if (range.length === 2) {
        const minAge = parseInt(range[0]);
        const maxAge = parseInt(range[1]);

        if (age >= minAge && age <= maxAge) {
          return {
            min: rec.hours.minHours,
            ideal: rec.hours.idealHours,
            max: rec.hours.maxHours,
          };
        }
      } else if (rec.ageRange === "65+") {
        if (age >= 65) {
          return {
            min: rec.hours.minHours,
            ideal: rec.hours.idealHours,
            max: rec.hours.maxHours,
          };
        }
      }
    }

    // Valor por defecto para adultos si no se encuentra un rango específico
    return { min: 7, ideal: 8, max: 9 };
  };

  // Función para formatear horas con un decimal
  const formatHours = (hours) => {
    return hours.toFixed(1);
  };

  return (
    <ScrollView>
      <View className="flex justify-center w-full gap-6 px-4 py-5 rounded-lg bg-[#1e2a47] mb-6">
        <View className="flex flex-row gap-4 justify-start">
          <MaterialIcons name="bed" size={24} color="#fff" />
          <Text
            className="text-center font-bold color-[#6366ff]"
            style={{ fontSize: 24 }}
          >
            Horas de Sueño Semanal
          </Text>
        </View>
        <View className="flex items-center">
          {/* Gráfica de horas de sueño semanales */}
          <WeeklySleepChart sleepLogsDuration={sleepLogsDuration} />
        </View>

        {/* Estadísticas de sueño */}
        <View className="mt-4">
          <View className="flex flex-row gap-4 justify-start mb-4">
            <Feather name="trending-up" size={24} color="#fff" />
            <Text
              className="text-center font-bold color-[#6366ff]"
              style={{ fontSize: 24 }}
            >
              Estadísticas
            </Text>
          </View>

          {/* Tarjetas de estadísticas */}
          <View className="flex flex-row flex-wrap justify-between">
            {/* Promedio de sueño */}
            <View className="bg-[#0e172a] p-4 rounded-xl mb-4 w-[48%] border border-[#6366ff]">
              <Text className="text-sm color-[#a0b0c7] mb-1">
                Promedio diario
              </Text>
              <View className="flex flex-row items-center">
                <Text className="mr-2 text-xl font-bold color-white">
                  {formatHours(sleepStats.averageSleep)}h
                </Text>
                {sleepStats.sleepDeficit > 0 ? (
                  <Feather name="alert-triangle" size={16} color="#ff6b6b" />
                ) : (
                  <Feather name="award" size={16} color="#4ade80" />
                )}
              </View>
              <Text className="text-xs color-[#a0b0c7] mt-1">
                {sleepStats.sleepDeficit > 0
                  ? `${sleepStats.sleepDeficit.toFixed(1)}h menos de lo ideal`
                  : "Por encima de lo recomendado"}
              </Text>
            </View>

            {/* Recomendado para tu edad */}
            <View className="bg-[#0e172a] p-4 rounded-xl mb-4 w-[48%] border border-[#6366ff]">
              <Text className="text-sm color-[#a0b0c7] mb-1">Recomendado</Text>
              <Text className="text-xl font-bold color-white">
                {sleepStats.recommendation.min}-{sleepStats.recommendation.max}h
              </Text>
              <Text className="text-xs color-[#a0b0c7] mt-1">
                Ideal: {sleepStats.recommendation.ideal}h
              </Text>
            </View>

            {/* Mejor día */}
            <View className="bg-[#0e172a] p-4 rounded-xl mb-4 w-[48%] border border-[#6366ff]">
              <Text className="text-sm color-[#a0b0c7] mb-1">Mejor día</Text>
              <Text className="text-xl font-bold color-white">
                {sleepStats.bestDay.hours > 0
                  ? formatHours(sleepStats.bestDay.hours) + "h"
                  : "N/A"}
              </Text>
              <Text className="text-xs color-[#a0b0c7] mt-1">
                {sleepStats.bestDay.day || "Sin datos"}
              </Text>
            </View>

            {/* Calidad del sueño */}
            <View className="bg-[#0e172a] p-4 rounded-xl mb-4 w-[48%] border border-[#6366ff]">
              <Text className="text-sm color-[#a0b0c7] mb-1">Calidad</Text>
              <Text
                className={`text-xl font-bold ${
                  sleepStats.sleepQuality === "Buena"
                    ? "color-[#4ade80]"
                    : sleepStats.sleepQuality === "Regular"
                    ? "color-[#fbbf24]"
                    : "color-[#ff6b6b]"
                }`}
              >
                {sleepStats.sleepQuality}
              </Text>
              <Text className="text-xs color-[#a0b0c7] mt-1">
                {sleepStats.daysAboveRecommended} días adecuados
              </Text>
            </View>
          </View>

          {/* Consejos personalizados */}
          <View className="bg-[#0e172a] p-4 rounded-xl mt-2 border border-[#6366ff]">
            <View className="flex flex-row items-center mb-2">
              <Feather
                name="info"
                size={18}
                color="#6366ff"
                style={{ marginRight: 8 }}
              />
              <Text className="font-bold color-white">
                Consejo personalizado
              </Text>
            </View>
            <Text className="color-[#a0b0c7] text-sm">
              {sleepStats.sleepDeficit > 1
                ? `Estás durmiendo considerablemente menos de lo recomendado para tu edad. Intenta acostarte ${Math.round(
                    sleepStats.sleepDeficit
                  )} hora(s) antes para alcanzar las ${
                    sleepStats.recommendation.ideal
                  } horas ideales.`
                : sleepStats.sleepDeficit > 0
                ? `Estás cerca del tiempo de sueño recomendado. Intenta acostarte ${Math.round(
                    sleepStats.sleepDeficit * 60
                  )} minutos antes para optimizar tu descanso.`
                : `¡Excelente! Estás durmiendo el tiempo recomendado para tu edad. Mantén esta rutina para seguir beneficiándote de un buen descanso.`}
            </Text>
          </View>
        </View>

        {/* Gráfica que compara lo que ha dormido el user vs lo que debería de dormir vs un user ideal de su rango de edad */}
        <View className="flex flex-row gap-4 justify-start mt-4">
          <Feather name="heart" size={24} color="#fff" />
          <Text
            className="text-center font-bold color-[#6366ff]"
            style={{ fontSize: 24 }}
          >
            Tu sueño vs Recomendado
          </Text>
        </View>
        <View className="flex items-center">
          <UserSleepVsRecommended
            sleepLogsDuration={sleepLogsDuration}
            userAge={userInfo.age}
          />
        </View>

        {/* Fases del sueño */}
        <View className="flex flex-row gap-4 justify-start mt-4">
          <FontAwesome6 name="boxes-stacked" size={24} color="#fff" />
          <Text
            className="text-center font-bold color-[#6366ff]"
            style={{ fontSize: 24 }}
          >
            Fases del Sueño
          </Text>
        </View>
        <View className="flex items-center">
          <SleepPieChart />
        </View>
      </View>
    </ScrollView>
  );
};

export default SleepGraphs;
