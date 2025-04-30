import { View, Text } from "react-native";
import React from "react";
import { LineChart } from "react-native-chart-kit";

const userOptimalSleep = () => {
  return (
    <View>
      {/* Gráfica comparativa de sueño real vs recomendado */}
      <View className="flex flex-row gap-4 justify-start mt-6">
        <BarChart size={24} color="#fff" />
        <Text
          className="text-center font-bold color-[#6366ff]"
          style={{ fontSize: 24 }}
        >
          Tu sueño vs Recomendado
        </Text>
      </View>

      <View className="mt-4">
        <Text className="color-[#a0b0c7] text-sm mb-4">
          Esta gráfica compara tus horas de sueño diarias con el rango
          recomendado para tu edad.
        </Text>

        {sleepStats.sleepData && sleepStats.sleepData.length > 0 ? (
          <LineChart
            data={{
              labels: sleepStats.sleepData.map((day) =>
                day.day.substring(0, 3)
              ),
              datasets: [
                {
                  data: sleepStats.sleepData.map((day) => day.hours),
                  color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`,
                  strokeWidth: 2,
                },
                {
                  data: Array(sleepStats.sleepData.length).fill(
                    sleepStats.recommendation.min
                  ),
                  color: (opacity = 1) => `rgba(255, 107, 107, ${opacity})`,
                  strokeWidth: 2,
                  strokeDashArray: [5, 5],
                },
                {
                  data: Array(sleepStats.sleepData.length).fill(
                    sleepStats.recommendation.ideal
                  ),
                  color: (opacity = 1) => `rgba(77, 222, 128, ${opacity})`,
                  strokeWidth: 2,
                  strokeDashArray: [5, 5],
                },
              ],
              legend: ["Tu sueño", "Mínimo", "Ideal"],
            }}
            width={Dimensions.get("window").width - 20}
            height={220}
            yAxisLabel=""
            yAxisSuffix="h"
            yAxisInterval={1}
            fromZero
            chartConfig={{
              backgroundGradientFrom: "#1e2a47",
              backgroundGradientTo: "#1e2a47",
              decimalPlaces: 1,
              color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              style: {
                borderRadius: 16,
              },
              propsForDots: {
                r: "6",
                strokeWidth: "1",
                stroke: "#ffffff",
              },
              formatYLabel: (value) => {
                const hours = Math.floor(value);
                const minutes = Math.round((value - hours) * 60);
                if (minutes === 0) {
                  return `${hours}h`;
                }
                return `${hours}:${minutes.toString().padStart(2, "0")}`;
              },
            }}
            bezier
            style={{
              marginVertical: 8,
              borderRadius: 16,
            }}
            renderDotContent={({ x, y, index, indexData }) => {
              const isAboveIdeal = indexData >= sleepStats.recommendation.ideal;
              const isAboveMin = indexData >= sleepStats.recommendation.min;
              const color = isAboveIdeal
                ? "#4ade80"
                : isAboveMin
                ? "#fbbf24"
                : "#ff6b6b";

              return (
                <View
                  key={index}
                  style={{
                    position: "absolute",
                    top: y - 10,
                    left: x - 10,
                    width: 20,
                    height: 20,
                    borderRadius: 10,
                    backgroundColor: color,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{ color: "#fff", fontSize: 10, fontWeight: "bold" }}
                  >
                    {indexData.toFixed(1)}
                  </Text>
                </View>
              );
            }}
            segments={5}
          />
        ) : (
          <View
            className="bg-[#1e2a47] p-4 rounded-xl items-center justify-center"
            style={{ height: 200 }}
          >
            <Text className="text-base color-white">
              No hay datos suficientes
            </Text>
          </View>
        )}

        {/* Leyenda de la gráfica */}
        <View className="flex-row justify-around mt-2 bg-[#162030] p-3 rounded-xl">
          <View className="flex-row items-center">
            <View
              style={{
                width: 12,
                height: 12,
                backgroundColor: "#4ade80",
                borderRadius: 6,
                marginRight: 6,
              }}
            />
            <Text className="color-[#a0b0c7] text-xs">Óptimo</Text>
          </View>
          <View className="flex-row items-center">
            <View
              style={{
                width: 12,
                height: 12,
                backgroundColor: "#fbbf24",
                borderRadius: 6,
                marginRight: 6,
              }}
            />
            <Text className="color-[#a0b0c7] text-xs">Aceptable</Text>
          </View>
          <View className="flex-row items-center">
            <View
              style={{
                width: 12,
                height: 12,
                backgroundColor: "#ff6b6b",
                borderRadius: 6,
                marginRight: 6,
              }}
            />
            <Text className="color-[#a0b0c7] text-xs">Insuficiente</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default userOptimalSleep;
