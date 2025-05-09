import { View, Text, Dimensions, Modal, TouchableOpacity } from "react-native";
import React, { useState, useEffect } from "react";
import { LineChart } from "react-native-chart-kit";
import Icon from "react-native-vector-icons/FontAwesome";

const SleepNutritionChart = ({ foodFitbitData, sleepWeeklyFitbitData }) => {
  const [chartData, setChartData] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [rawData, setRawData] = useState([]);

  useEffect(() => {
    // Si no tenemos datos, no hacemos nada
    if (!foodFitbitData?.calories || !sleepWeeklyFitbitData?.sleep) return;

    // Obtenemos las claves (días) del objeto sleep
    const days = Object.keys(sleepWeeklyFitbitData.sleep);

    // Creamos un array con los datos procesados
    const processedData = days.map((day) => {
      const sleepMinutes = sleepWeeklyFitbitData.sleep[day] || 0;
      const calories = foodFitbitData.calories[day] || 0;

      return {
        day,
        dayShort: day.substring(0, 3),
        sleepMinutes,
        sleepHours: sleepMinutes / 60,
        calories,
      };
    });

    setRawData(processedData);

    // Extraemos solo los valores para el gráfico
    const sleepHours = processedData.map((item) => item.sleepHours);
    const caloriesValues = processedData.map((item) => item.calories);

    // Normalizamos las calorías para que se ajusten al rango de horas de sueño
    const minCal = Math.min(...caloriesValues);
    const maxCal = Math.max(...caloriesValues);
    const minSleep = Math.min(...sleepHours);
    const maxSleep = Math.max(...sleepHours);

    const normalizedCalories = caloriesValues.map((cal) => {
      return (
        ((cal - minCal) / (maxCal - minCal)) * (maxSleep - minSleep) + minSleep
      );
    });

    // Creamos los datos para el gráfico
    const newChartData = {
      labels: processedData.map((item) => item.dayShort),
      datasets: [
        {
          data: sleepHours,
          color: (opacity = 1) => `rgba(114, 9, 183, ${opacity})`, // Púrpura que coincide con el tema
          strokeWidth: 2,
          label: "Horas de Sueño",
        },
        {
          data: normalizedCalories,
          color: (opacity = 1) => `rgba(247, 37, 133, ${opacity})`, // Rosa que coincide con el tema
          strokeWidth: 2,
          label: "Ingesta Calórica (normalizada)",
        },
      ],
      legend: ["Horas de Sueño", "Calorías"],
    };

    setChartData(newChartData);
  }, [foodFitbitData, sleepWeeklyFitbitData]);

  const handleDataPointClick = ({ index, dataset }) => {
    const datasetIndex = chartData.datasets.indexOf(dataset);
    const dataPoint = rawData[index];

    setSelectedPoint({
      day: dataPoint.day,
      sleepHours: Math.floor(dataPoint.sleepHours),
      sleepMinutes: Math.round(
        (dataPoint.sleepHours - Math.floor(dataPoint.sleepHours)) * 60
      ),
      calories: dataPoint.calories,
      isCaloriesDataset: datasetIndex === 1,
    });

    setModalVisible(true);
  };

  // Si no hay datos, mostramos un mensaje de carga
  if (!chartData) {
    return (
      <View
        className="bg-[#1e2a47] rounded-2xl p-4 mx-2.5 my-2.5 shadow-md items-center justify-center"
        style={{ height: 250 }}
      >
        <Text className="text-lg font-bold text-white">Cargando datos...</Text>
        <Text className="text-sm text-[#AAAAAA] mt-2">
          Por favor, espera mientras obtenemos tus datos de sueño y nutrición.
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-col gap-4 self-center">
      <LineChart
        data={chartData}
        width={Dimensions.get("window").width - 40}
        height={220}
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
            stroke: "#1e2a47",
          },
        }}
        bezier
        style={{
          borderRadius: 16,
        }}
        onDataPointClick={handleDataPointClick}
      />

      {/* Leyenda explicativa */}
      <View className="bg-[#0e172a] p-4 rounded-xl flex-col self-center gap-2 border border-[#6366ff]">
        <Text className="text-base font-bold text-white">Información</Text>

        <Text className="text-sm text-[#a0b0c7] leading-5">
          Esta visualización muestra la relación entre tus horas de sueño y tu
          ingesta calórica durante la semana. Los valores de calorías han sido
          normalizados para facilitar la comparación visual.
        </Text>
        <View className="flex-row justify-between mt-2">
          <View className="flex-row items-center">
            <View
              className="mr-2 w-3 h-3 rounded-full"
              style={{ backgroundColor: "rgba(114, 9, 183, 1)" }}
            />
            <Text className="text-sm text-white">Horas de sueño</Text>
          </View>
          <View className="flex-row items-center">
            <View
              className="mr-2 w-3 h-3 rounded-full"
              style={{ backgroundColor: "rgba(247, 37, 133, 1)" }}
            />
            <Text className="text-sm text-white">Calorías (normalizado)</Text>
          </View>
        </View>
        <Text className="text-sm text-[#a0b0c7] mt-3 italic">
          Pulsa en cualquier punto de la gráfica para ver los datos exactos.
        </Text>
      </View>

      {/* Modal para mostrar información detallada */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          className="flex-1 justify-center items-center bg-black/50"
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View className="bg-[#1e2a47] p-6 rounded-xl w-[80%] max-w-[300px]">
            {selectedPoint && (
              <>
                <View className="flex-row justify-between items-center mb-4">
                  <Text className="text-lg font-bold text-[#F72585]">
                    Detalles del día
                  </Text>
                  <TouchableOpacity onPress={() => setModalVisible(false)}>
                    <Icon name="times" size={20} color="#fff" />
                  </TouchableOpacity>
                </View>
                <View className="gap-2">
                  <Text className="text-base text-white">
                    Día: {selectedPoint.day}
                  </Text>
                  <Text className="text-base text-white">
                    Tiempo dormido: {selectedPoint.sleepHours}h{" "}
                    {selectedPoint.sleepMinutes}min
                  </Text>
                  <Text className="text-base text-white">
                    Calorías consumidas: {selectedPoint.calories}
                  </Text>
                </View>
              </>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default SleepNutritionChart;
