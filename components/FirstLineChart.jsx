import { View, Dimensions, Modal, Text, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import { LineChart } from "react-native-chart-kit";
import Icon from "react-native-vector-icons/FontAwesome";

const FirstLineChart = () => {
  // Estado para controlar la visibilidad del popup y la información seleccionada
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState(null);

  // Datos de ejemplo con horas y minutos
  const sleepData = [
    { day: "L", hours: 6, minutes: 30, entireDay: "Lunes" },
    { day: "M", hours: 7, minutes: 15, entireDay: "Martes" },
    { day: "M", hours: 6, minutes: 45, entireDay: "Miercoles" },
    { day: "J", hours: 8, minutes: 0, entireDay: "Jueves" },
    { day: "V", hours: 7, minutes: 30, entireDay: "Viernes" },
    { day: "S", hours: 9, minutes: 0, entireDay: "Sabado" },
    { day: "D", hours: 8, minutes: 30, entireDay: "Domingo" },
  ];

  const handleDataPointClick = ({ index }) => {
    //Recuperamos la entrada del array con la info del día selecccionado para poder usar su info en el modal de una manera centralizada
    setSelectedPoint(sleepData[index]);
    //Enseñamos el modal al user
    setModalVisible(true);
  };

  return (
    <View>
      <LineChart
        data={{
          labels: sleepData.map((data) => data.day),
          datasets: [
            {
              data: sleepData.map((data) => data.hours + data.minutes / 60),
            },
          ],
        }}
        width={Dimensions.get("window").width - 20} //Reducimos el padding lateral
        height={220}
        bezier
        yAxisLabel=""
        fromZero
        yAxisInterval={2} // Intervalo de 2 horas para mostrar valores enteros
        yAxisSuffix=""
        onDataPointClick={handleDataPointClick}
        chartConfig={{
          backgroundGradientFrom: "#1e2a47",
          backgroundGradientTo: "#1e2a47",
          color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          strokeWidth: 2,
          useShadowColorFromDataset: false,
          decimalPlaces: 0, // Solo mostrar números enteros en el eje Y
          count: 5, // Mostrar aproximadamente 5 valores en el eje Y
          // Personalizar los valores del eje Y para mostrar rangos enteros
          formatYLabel: (value) => Math.round(value).toString(),
          propsForDots: {
            r: "6",
            strokeWidth: "1",
            stroke: "#ffffff",
          },
        }}
      />

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
                    Tiempo dormido: {selectedPoint.hours}h{" "}
                    {selectedPoint.minutes}min
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

export default FirstLineChart;
