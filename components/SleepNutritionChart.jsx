import { View, Text, Dimensions } from "react-native";
import React from "react";
import { LineChart } from "react-native-chart-kit";

//TODO: DEFINIMOS DE MANERA ESTÁTICAS LAS HORAS QUE EL USER HA DORMIDO DURANTE LA SEMANA Y LA INGESTA DIARIA DE CALORÍAS
const sleepHours = [7, 6.5, 8, 7.5, 6, 8.2, 7.8];
const rawCalories = [2000, 1800, 2200, 1900, 1700, 2300, 2100];

/*
 * NORMALIZAMOS LA INGESTA DE CALORÍAS PARA QUE SE AJUSTE AL RANGO DE HORAS DE SUEÑO
 * Esto es necesario para una comparación visual coherente
 */

const minCal = Math.min(...rawCalories);
const maxCal = Math.max(...rawCalories);
const normalizedCalories = rawCalories.map((cal) => {
  // Escalamos al rango de sleepHours (por ejemplo, de minSleep a maxSleep)
  const minSleep = Math.min(...sleepHours);
  const maxSleep = Math.max(...sleepHours);
  return (
    ((cal - minCal) / (maxCal - minCal)) * (maxSleep - minSleep) + minSleep
  );
});

//ESTRUCTURAMOS LOS DATOS PARA EL GRÁFICO, SIGUIENDO EL FORMATO QUE PIDE LA LIBRERÍA
const chartData = {
  labels: ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"],
  datasets: [
    {
      data: sleepHours,
      color: (opacity = 1) => `rgba(34, 128, 176, ${opacity})`,
      strokeWidth: 2,
      label: "Horas de Sueño",
    },
    {
      data: normalizedCalories,
      color: (opacity = 1) => `rgba(255, 100, 100, ${opacity})`,
      strokeWidth: 2,
      label: "Ingesta Calórica (normalizada)",
    },
  ],
  legend: ["Horas de Sueño", "Ingesta Calórica"],
};

const SleepNutritionChart = () => {
  return (
    <View>
      <LineChart
        data={chartData}
        width={Dimensions.get("window").width - 20}
        height={250}
        chartConfig={{
          backgroundGradientFrom: "#1e2a47",
          backgroundGradientTo: "#1e2a47",
          decimalPlaces: 1,
          color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          style: {
            borderRadius: 16,
          },
          propsForDots: {
            r: "4",
            strokeWidth: "2",
            stroke: "#fff",
          },
        }}
      />
    </View>
  );
};

export default SleepNutritionChart;
