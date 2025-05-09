import { View, Text, Dimensions, TouchableOpacity } from "react-native";
import React, { useState, useEffect } from "react";
import { PieChart } from "react-native-chart-kit";
import { Feather } from "@expo/vector-icons";

// Configuración de colores y etiquetas para cada fase del sueño
const sleepPhaseConfig = {
  deep: {
    name: "Sueño Profundo",
    color: "#7209B7", // Púrpura en lugar de azul
    description:
      "Fase más reparadora del sueño, esencial para la recuperación física",
  },
  light: {
    name: "Sueño Ligero",
    color: "#3A0CA3", // Púrpura más intenso
    description:
      "Fase de transición, representa la mayor parte del ciclo de sueño",
  },
  rem: {
    name: "REM",
    color: "#F72585", // Rosa vibrante
    description:
      "Fase asociada con los sueños y la consolidación de la memoria",
  },
  wake: {
    name: "Despierto",
    color: "#4CC9F0", // Azul claro
    description: "Períodos breves de vigilia durante la noche",
  },
};

const SleepPieChart = ({ sleepData, showAverage = false }) => {
  const [selectedPhase, setSelectedPhase] = useState(null);
  const [pieData, setPieData] = useState([]);
  const [totalSleepMinutes, setTotalSleepMinutes] = useState(0);

  useEffect(() => {
    // Procesamos los datos para el gráfico
    if (sleepData && sleepData.levels && sleepData.levels.summary) {
      const summary = sleepData.levels.summary;
      const total = Object.keys(summary).reduce(
        (acc, phase) =>
          acc +
          (showAverage
            ? summary[phase].thirtyDayAvgMinutes
            : summary[phase].minutes),
        0
      );

      setTotalSleepMinutes(total);

      // Creamos los datos para el gráfico de pastel
      const newPieData = Object.keys(summary).map((phase) => ({
        name: sleepPhaseConfig[phase].name,
        minutes: showAverage
          ? summary[phase].thirtyDayAvgMinutes
          : summary[phase].minutes,
        population: showAverage
          ? summary[phase].thirtyDayAvgMinutes
          : summary[phase].minutes,
        color: sleepPhaseConfig[phase].color,
        legendFontColor: "#FFFFFF",
        legendFontSize: 12,
        phase,
      }));

      setPieData(newPieData);
    }
  }, [sleepData, showAverage]);

  // Convierte milisegundos a formato "Xh Ym"
  const formatDuration = (milliseconds) => {
    if (!milliseconds) return "0h 0m";
    const totalMinutes = Math.floor(milliseconds / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h ${minutes}m`;
  };

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const calculatePercentage = (minutes) => {
    return totalSleepMinutes > 0
      ? Math.round((minutes / totalSleepMinutes) * 100)
      : 0;
  };

  const handlePhaseSelect = (phase) => {
    setSelectedPhase(phase === selectedPhase ? null : phase);
  };

  // Si no hay datos de sueño, mostramos un mensaje
  if (!sleepData) {
    return (
      <View
        className="bg-[#1e2a47] rounded-2xl p-4 mx-2.5 my-2.5 shadow-md items-center justify-center"
        style={{ height: 300 }}
      >
        <Text className="text-lg font-bold text-white">
          Cargando datos de sueño...
        </Text>
        <Text className="text-sm text-[#a0b0c7] mt-2">
          Por favor, espera mientras obtenemos tus datos de sueño.
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-col gap-4 self-center w-full">
      <Text className="text-base text-[#a0b0c7] text-center mt-1">
        {showAverage ? "Promedio de 30 días" : "Última noche"}
      </Text>

      {/* Información total a un lado del gráfico */}
      <View className="flex-col justify-center items-center p-3 w-full rounded-lg bg-white/5">
        <Text className="text-sm text-[#a0b0c7]">Total</Text>
        <Text className="text-base font-bold text-white">
          {formatDuration(sleepData.duration)}
        </Text>
        <Text className="text-sm text-[#F72585] mt-0.5">
          Eficiencia: {sleepData.efficiency}%
        </Text>
      </View>

      <View className="flex-col justify-center items-center">
        <PieChart
          data={pieData}
          width={Dimensions.get("window").width - 100}
          height={220}
          chartConfig={{
            backgroundColor: "#1e2a47",
            backgroundGradientFrom: "#1e2a47",
            backgroundGradientTo: "#1e2a47",
            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            strokeWidth: 2,
            useShadowColorFromDataset: false,
            decimalPlaces: 0,
          }}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="15"
          absolute
          hasLegend={false}
          //Estilo exclusivo del gráfico
          style={{
            marginVertical: 8,
            borderRadius: 16,
            paddingLeft: 50,
          }}
        />
      </View>

      <View>
        {pieData.map((item) => (
          <TouchableOpacity
            key={item.phase}
            className={`flex-row items-center py-2 px-3 rounded-lg mb-1.5 ${
              selectedPhase === item.phase ? "bg-white/10" : "bg-white/5"
            }`}
            onPress={() => handlePhaseSelect(item.phase)}
          >
            <View
              className="w-3 h-3 rounded-full mr-2.5"
              style={{ backgroundColor: item.color }}
            />
            <View className="flex-1">
              <Text className="text-sm font-medium text-white">
                {item.name}
              </Text>
              <Text className="text-xs text-[#a0b0c7]">
                {formatTime(item.minutes)} ({calculatePercentage(item.minutes)}
                %)
              </Text>
            </View>
            <Feather
              name={
                selectedPhase === item.phase ? "chevron-up" : "chevron-down"
              }
              size={16}
              color="#FFFFFF"
            />
          </TouchableOpacity>
        ))}
      </View>

      {selectedPhase && (
        <View className="p-4 rounded-lg bg-white/5">
          <Text className="mb-1 text-base font-bold text-white">
            {sleepPhaseConfig[selectedPhase].name}
          </Text>
          <Text className="text-sm text-[#a0b0c7] mb-2.5 leading-5">
            {sleepPhaseConfig[selectedPhase].description}
          </Text>
          <View className="flex-row self-start w-full">
            <View className="flex-1 items-center">
              <Text className="text-sm text-[#6366ff] mb-0.5">Episodios</Text>
              <Text className="text-sm font-bold text-white">
                {sleepData.levels.summary[selectedPhase].count}
              </Text>
            </View>
            <View className="flex-1 items-center">
              <Text className="text-sm text-[#6366ff] mb-0.5">Duración</Text>
              <Text className="text-sm font-bold text-white">
                {formatTime(sleepData.levels.summary[selectedPhase].minutes)}
              </Text>
            </View>
            <View className="flex-1 items-center">
              <Text className="text-sm text-[#6366ff] mb-0.5">
                Promedio 30 días
              </Text>
              <Text className="text-sm font-bold text-white">
                {formatTime(
                  sleepData.levels.summary[selectedPhase].thirtyDayAvgMinutes
                )}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Leyenda explicativa */}
      <View className="bg-[#0e172a] p-4 rounded-xl flex-col self-center gap-3 border border-[#6366ff]">
        <Text className="text-base font-bold color-[#6366ff]">Glosario</Text>
        <View className="flex-col gap-5">
          <View>
            <Text className="text-sm font-medium text-white">Episodios:</Text>
            <Text className="text-sm text-[#a0b0c7]">
              Número de veces que entraste en esta fase del sueño durante la
              noche.
            </Text>
          </View>
          <View>
            <Text className="text-sm font-medium text-white">
              Promedio 30 días:
            </Text>
            <Text className="text-sm text-[#a0b0c7]">
              Tiempo promedio que has pasado en esta fase durante los últimos 30
              días, útil para comparar con tu noche actual.
            </Text>
          </View>
          <View>
            <Text className="text-sm font-medium text-white">Eficiencia:</Text>
            <Text className="text-sm text-[#a0b0c7]">
              Porcentaje del tiempo en cama que realmente pasaste durmiendo. Por
              encima del 85% se considera buena eficiencia.
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default SleepPieChart;
