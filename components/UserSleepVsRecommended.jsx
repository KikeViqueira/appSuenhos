import { View, Dimensions, Modal, Text, TouchableOpacity } from "react-native";
import React, { useState, useEffect } from "react";
import { LineChart } from "react-native-chart-kit";
import sleepRecommendations from "../utils/sleepRecommendations";
import Icon from "react-native-vector-icons/FontAwesome";

const UserSleepVsRecommended = ({ sleepLogsDuration, userAge }) => {
  const [formattedSleepData, setFormattedSleepData] = useState([]);
  const [recommendation, setRecommendation] = useState({
    min: 7,
    ideal: 8,
    max: 9,
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState(null);

  // Procesamos los datos de los logs de sueño y obtenemos la recomendación en base a la edad del user
  useEffect(() => {
    // Buscamos la recomendación de sueño para la edad del user
    const ageRecommendation =
      sleepRecommendations.sleepRecommendations.find(
        (rec) => rec.ageRange === userAge
      ) ||
      sleepRecommendations.sleepRecommendations.find(
        (rec) => rec.ageRange === "26-64" // Si no encuentra la edad del user, se usa la recomendación para adultos
      );

    if (ageRecommendation) {
      setRecommendation({
        min: ageRecommendation.hours.minHours,
        ideal: ageRecommendation.hours.idealHours,
        max: ageRecommendation.hours.maxHours,
      });
    }

    // Formateamos los datos de los logs de sueño para la gráfica
    if (sleepLogsDuration && Object.keys(sleepLogsDuration).length > 0) {
      const data = Object.entries(sleepLogsDuration).map(([day, duration]) => {
        const dayAbbreviation = day.substring(0, 3);

        // Convertimos minutos a horas
        const totalMinutes = Math.round(Number(duration));
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;

        return {
          day: dayAbbreviation,
          hours: hours + minutes / 60,
          entireDay: day,
          hoursRaw: hours,
          minutes: minutes,
          status:
            hours + minutes / 60 >= recommendation.ideal
              ? "óptimo"
              : hours + minutes / 60 >= recommendation.min
              ? "aceptable"
              : "insuficiente",
        };
      });

      setFormattedSleepData(data);
    }
  }, [sleepLogsDuration, userAge]);

  // Función para formatear las etiquetas del eje Y como horas:minutos
  const formatYLabel = (value) => {
    const hours = Math.floor(value);
    const minutes = Math.round((value - hours) * 60);

    if (minutes === 0) {
      return `${hours}h`;
    }
    return `${hours}:${minutes.toString().padStart(2, "0")}`;
  };

  const handleDataPointClick = ({ index }) => {
    setSelectedPoint(formattedSleepData[index]);
    setModalVisible(true);
  };

  if (formattedSleepData.length === 0) {
    return (
      <View className="items-center justify-center w-full h-[220px]">
        <Text className="text-center color-white">
          No hay datos disponibles
        </Text>
      </View>
    );
  }

  // Crear el rango ideal de sueño para la zona sombreada
  const minSleepLine = Array(formattedSleepData.length).fill(
    recommendation.min
  );
  const idealSleepLine = Array(formattedSleepData.length).fill(
    recommendation.ideal
  );
  const maxSleepLine = Array(formattedSleepData.length).fill(
    recommendation.max
  );

  return (
    <View className="flex-col self-center gap-4">
      <LineChart
        data={{
          labels: formattedSleepData.map((data) => data.day),
          datasets: [
            {
              data: formattedSleepData.map((data) => data.hours),
              color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`,
              strokeWidth: 3,
            },
            {
              // Línea de mínimo recomendado
              data: minSleepLine,
              color: (opacity = 1) => `rgba(255, 107, 107, 0.9)`,
              strokeWidth: 2,
              strokeDashArray: [5, 5],
              withDots: false,
            },
            {
              // Línea ideal recomendada - ahora continua y más visible
              data: idealSleepLine,
              color: (opacity = 1) => `rgba(77, 222, 128, 1)`,
              strokeWidth: 2.5,
              withDots: false,
            },
            {
              // Línea de máximo recomendado
              data: maxSleepLine,
              color: (opacity = 1) => `rgba(99, 102, 255, 0.9)`,
              strokeWidth: 2,
              strokeDashArray: [5, 5],
              withDots: false,
            },
          ],
        }}
        width={Dimensions.get("window").width - 20}
        height={220}
        bezier
        yAxisLabel=""
        fromZero
        yAxisInterval={1}
        yAxisSuffix="h"
        onDataPointClick={handleDataPointClick}
        chartConfig={{
          backgroundGradientFrom: "#1e2a47",
          backgroundGradientTo: "#1e2a47",
          decimalPlaces: 1,
          color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          strokeWidth: 2,
          formatYLabel,
          propsForDots: {
            r: "6",
            strokeWidth: "1",
            stroke: "#ffffff",
          },
          fillShadowGradientFrom: "rgba(99, 102, 255, 0.15)",
          fillShadowGradientTo: "rgba(99, 102, 255, 0.05)",
        }}
        segments={5}
        withHorizontalLines={true}
        withVerticalLines={true}
        withInnerLines={true}
        withShadow={false}
        getDotColor={(dataPoint, index) => {
          const sleepHours = formattedSleepData[index].hours;
          if (sleepHours >= recommendation.ideal) return "#15db44";
          if (sleepHours >= recommendation.min) return "#fbbf24";
          return "#ff6b6b";
        }}
        hidePointsAtIndex={[]}
        renderDotContent={() => null}
      />

      <View className="bg-[#0e172a] p-4 w-[80%] rounded-xl flex-col self-center gap-2 border border-[#6366ff]">
        <View className="flex-col justify-start gap-4">
          <Text className="text-base font-bold color-[#6366ff]">
            Parámetros de sueño recomendados
          </Text>

          <View className="flex-row justify-between">
            <View className="flex-row items-center">
              <View
                style={{
                  width: 15,
                  height: 3,
                  backgroundColor: "rgba(255, 107, 107, 0.9)",
                  marginRight: 8,
                }}
              />
              <Text className="color-[#a0b0c7] text-sm">
                Mínimo: {recommendation.min}h
              </Text>
            </View>

            <View className="flex-row items-center">
              <View
                style={{
                  width: 15,
                  height: 3,
                  backgroundColor: "rgba(77, 222, 128, 1)",
                  marginRight: 8,
                }}
              />
              <Text className="color-[#a0b0c7] text-sm">
                Ideal: {recommendation.ideal}h
              </Text>
            </View>

            <View className="flex-row items-center">
              <View
                style={{
                  width: 15,
                  height: 3,
                  backgroundColor: "rgba(99, 102, 255, 0.9)",
                  marginRight: 8,
                }}
              />
              <Text className="color-[#a0b0c7] text-sm">
                Máximo: {recommendation.max}h
              </Text>
            </View>
          </View>
        </View>

        <View className="flex-col justify-start gap-4">
          <Text className="text-base font-bold color-white">
            Tu calidad de sueño
          </Text>

          <View className="flex-row justify-between gap-4">
            <View className="flex-row items-center">
              <View
                style={{
                  width: 12,
                  height: 12,
                  backgroundColor: "#15db44",
                  borderRadius: 6,
                  marginRight: 4,
                }}
              />
              <Text className="color-[#a0b0c7] text-sm">
                Óptimo (≥{recommendation.ideal}h)
              </Text>
            </View>

            <View className="flex-row items-center">
              <View
                style={{
                  width: 12,
                  height: 12,
                  backgroundColor: "#fbbf24",
                  borderRadius: 6,
                  marginRight: 4,
                }}
              />
              <Text className="color-[#a0b0c7] text-sm">
                Aceptable (≥{recommendation.min}h)
              </Text>
            </View>

            <View className="flex-row items-center">
              <View
                style={{
                  width: 12,
                  height: 12,
                  backgroundColor: "#ff6b6b",
                  borderRadius: 6,
                  marginRight: 4,
                }}
              />
              <Text className="color-[#a0b0c7] text-sm">Insuficiente</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Modal para mostrar información detallada */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          className="items-center justify-center flex-1 bg-black/50"
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View className="bg-[#1e2a47] p-6 rounded-xl w-[80%] max-w-[300px]">
            {selectedPoint && (
              <>
                <View className="flex-row items-center justify-between mb-4">
                  <Text className="text-lg font-bold color-[#6366ff]">
                    Detalles del sueño
                  </Text>
                  <TouchableOpacity onPress={() => setModalVisible(false)}>
                    <Icon name="times" size={20} color="#fff" />
                  </TouchableOpacity>
                </View>
                <View className="gap-2">
                  <Text className="text-base color-white">
                    Día: {selectedPoint.entireDay}
                  </Text>
                  <Text className="text-base color-white">
                    Tiempo dormido: {selectedPoint.hoursRaw}h{" "}
                    {selectedPoint.minutes}min
                  </Text>
                  <View className="flex-row items-center mt-1">
                    <View
                      style={{
                        width: 10,
                        height: 10,
                        backgroundColor:
                          selectedPoint.hours >= recommendation.ideal
                            ? "#15db44"
                            : selectedPoint.hours >= recommendation.min
                            ? "#fbbf24"
                            : "#ff6b6b",
                        borderRadius: 5,
                        marginRight: 6,
                      }}
                    />
                    <Text className="color-[#a0b0c7] text-sm">
                      Estado: {selectedPoint.status}
                    </Text>
                  </View>
                </View>
                <View className="mt-4 pt-3 border-t border-[#323d4f]">
                  <Text className="text-xs color-[#a0b0c7]">
                    Recomendado para tu edad ({userAge} años):{" "}
                    {recommendation.min}-{recommendation.max}h (Ideal:{" "}
                    {recommendation.ideal}h)
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

export default UserSleepVsRecommended;
