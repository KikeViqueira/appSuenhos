import { View, Text } from "react-native";
import React, { useEffect } from "react";
import {
  MaterialCommunityIcons,
  Feather,
  FontAwesome6,
} from "@expo/vector-icons";
import SleepNutritionChart from "./SleepNutritionChart";
import HRVBarChart from "./HRVBarChart";
import BreathingBarChart from "./BreathingBarChart ";
import SleepPieChart from "./SleepPieChart";
import useFitbit from "../hooks/useFitbit";

const FitbitUserGraphs = () => {
  const {
    sleepTodayFitbitData,
    foodFitbitData,
    sleepWeeklyFitbitData,
    getSleepTodayFitbitData,
    getFoodFitbitData,
    getSleepWeeklyFitbitData,
  } = useFitbit();

  useEffect(() => {
    //Cuando se monta y reenderiza el componente se ejecutan obtenemos la info de la API
    getSleepTodayFitbitData();
    getFoodFitbitData();
    getSleepWeeklyFitbitData();
  }, []);

  return (
    <View className="flex justify-center w-full gap-6 px-4 py-5 rounded-lg bg-[#1e2a47]">
      {/*GRÁFICA QUE MUESTRA LA CORRELACIÓN DE COMO INFLUYEN LAS CALORIAS CONSUMIDAS EN LAS HORAS QUE DUERME EL USER*/}
      <View className="flex flex-row gap-4 justify-start">
        <MaterialCommunityIcons
          name="food-apple-outline"
          size={24}
          color="#fff"
        />
        <Text
          className="text-center font-bold color-[#6366ff]"
          style={{ fontSize: 24 }}
        >
          Calorías vs Horas de Sueño
        </Text>
      </View>
      <View className="flex items-center">
        <SleepNutritionChart
          foodFitbitData={foodFitbitData}
          sleepWeeklyFitbitData={sleepWeeklyFitbitData}
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
        <SleepPieChart sleepData={sleepTodayFitbitData} showAverage={false} />
      </View>

      {/*GRÁFICA QUE MUESTRA COMO HA VARIADO EL HRV A LO LARGO DE LA SEMANA*/}
      <View className="flex flex-row gap-4 justify-start">
        <Feather name="activity" size={24} color="#fff" />
        <Text
          className="text-center font-bold color-[#6366ff]"
          style={{ fontSize: 24 }}
        >
          Variación del Ritmo Cardíaco
        </Text>
      </View>
      <View className="flex items-center">
        <HRVBarChart />
      </View>

      {/*GRÁFICA QUE MUESTRA COMO HA VARIADO EL BREATHING RATE A LO LARGO DE LA SEMANA*/}

      <View className="flex flex-row gap-4 justify-start">
        <Feather name="wind" size={24} color="#fff" />
        <Text
          className="text-center font-bold color-[#6366ff]"
          style={{ fontSize: 24 }}
        >
          Respiraciones por Minuto
        </Text>
      </View>
      <View className="flex items-center">
        <BreathingBarChart />
      </View>
    </View>
  );
};

export default FitbitUserGraphs;
