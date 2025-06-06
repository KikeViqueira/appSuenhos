import { View, Text, Dimensions } from "react-native";
import React from "react";
import { BarChart } from "react-native-chart-kit";
import { Feather } from "@expo/vector-icons";

//CARGAMOS LOS DATOS DE MANERA ESTÁTICA PARA SIMULAR EL CAMBIO DE LOS VALORES DE BREATHING
const breathingData = {
  labels: ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"],
  datasets: [
    {
      data: [14, 13.5, 14.2, 14.2, 13.8, 14, 13.7],
    },
  ],
};

const BreathingBarChart = () => {
  const screenWidth = Dimensions.get("window").width;

  return (
    <View className="bg-[#1e2a47] rounded-2xl p-6 mx-4 mb-6 shadow-lg">
      {/* Header Section */}
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center">
          <View className="w-12 h-12 bg-[#10b981]/20 rounded-xl items-center justify-center mr-3">
            <Feather name="wind" size={24} color="#10b981" />
          </View>
          <View>
            <Text className="text-lg font-bold text-white">
              Frecuencia Respiratoria
            </Text>
            <Text className="text-[#8a94a6] text-sm">Últimos 7 días</Text>
          </View>
        </View>
      </View>

      {/* Stats Row */}
      <View className="flex-row justify-between mb-6 bg-[#2a2a4a]/50 rounded-xl p-4">
        <View className="items-center">
          <Text className="text-[#8a94a6] text-xs uppercase tracking-wide">
            Promedio
          </Text>
          <Text className="mt-1 text-xl font-bold text-white">13.9</Text>
          <Text className="text-[#8a94a6] text-xs">rpm</Text>
        </View>
        <View className="w-px bg-[#3a3a5a]" />
        <View className="items-center">
          <Text className="text-[#8a94a6] text-xs uppercase tracking-wide">
            Máximo
          </Text>
          <Text className="mt-1 text-xl font-bold text-orange-400">14.2</Text>
          <Text className="text-[#8a94a6] text-xs">rpm</Text>
        </View>
        <View className="w-px bg-[#3a3a5a]" />
        <View className="items-center">
          <Text className="text-[#8a94a6] text-xs uppercase tracking-wide">
            Mínimo
          </Text>
          <Text className="mt-1 text-xl font-bold text-green-400">13.5</Text>
          <Text className="text-[#8a94a6] text-xs">rpm</Text>
        </View>
      </View>

      {/* Chart Container */}
      <View className="bg-[#1a1f3a] rounded-xl p-4 -mx-2">
        <BarChart
          data={breathingData}
          width={screenWidth - 80}
          height={220}
          chartConfig={{
            backgroundGradientFrom: "#1a1f3a",
            backgroundGradientTo: "#1a1f3a",
            decimalPlaces: 1,
            color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            barPercentage: 0.7,
            formatYLabel: (value) => `${value}rpm`,
            propsForBackgroundLines: {
              strokeDasharray: "5,5",
              stroke: "#3a3a5a",
              strokeWidth: 1,
            },
            propsForLabels: {
              fontSize: 12,
              fontWeight: "500",
            },
          }}
          style={{
            marginLeft: -15,
            borderRadius: 12,
          }}
          showValuesOnTopOfBars={true}
          fromZero={false}
        />
      </View>

      {/* Footer Info */}
      <View className="flex-row items-center mt-4">
        <View className="w-2 h-2 bg-[#10b981] rounded-full mr-2" />
        <Text className="text-[#8a94a6] text-xs flex-1">
          Rango normal: 12-16 respiraciones por minuto en reposo
        </Text>
      </View>
    </View>
  );
};

export default BreathingBarChart;
