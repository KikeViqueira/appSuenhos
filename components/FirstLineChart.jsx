import {
  View,
  Dimensions,
  Modal,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import React, { useState, useEffect } from "react";
import { LineChart } from "react-native-chart-kit";
import Icon from "react-native-vector-icons/FontAwesome";
import useSleep from "../hooks/useSleep";

const FirstLineChart = () => {
  // Estado para controlar la visibilidad del popup y la información seleccionada
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [formattedSleepData, setFormattedSleepData] = useState([]);

  // Obtenemos los datos del hook useSleep
  const { getSleepLogEndpoint, sleepLogsDuration, loading, error } = useSleep();

  // Al cargar el componente, obtenemos los datos de sueño de la última semana
  useEffect(() => {
    getSleepLogEndpoint("7");
  }, []);

  // Cuando tenemos los datos, los formateamos para el gráfico
  useEffect(() => {
    //Comprobamos que el tamaño del objeto SleepLogsDuration tiene mas de cero keys [Lunes, Martes, etc] en el array que devuelve la clase de Object.keys y exista el propio objeto
    if (sleepLogsDuration && Object.keys(sleepLogsDuration).length > 0) {
      //Si es así, recorremos el objeto y formateamos los datos para el gráfico
      const data = Object.entries(sleepLogsDuration).map(([day, duration]) => {
        //Abreviamos el nombre de el día de la semana
        const dayAbbreviation = day.substring(0, 3);

        // Calculamos horas y minutos para poder mostrarlos en el modal
        const totalMinutes = Math.round(Number(duration));
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;

        //Devolvemos el obejeto que se va a reenderizar en el gráfico
        return {
          day: dayAbbreviation,
          duration: duration,
          entireDay: day,
          hours: hours,
          minutes: minutes,
        };
      });

      setFormattedSleepData(data);
    }
  }, [sleepLogsDuration]);

  const handleDataPointClick = ({ index }) => {
    //Recuperamos la entrada del array con la info del día selecccionado para poder usar su info en el modal de una manera centralizada
    setSelectedPoint(formattedSleepData[index]);
    //Enseñamos el modal al user
    setModalVisible(true);
  };

  if (loading) {
    return (
      <View className="items-center justify-center w-full h-[220px]">
        <ActivityIndicator size="large" color="#6366ff" />
        <Text className="mt-2 text-center color-white">
          Cargando datos de sueño...
        </Text>
      </View>
    );
  }

  if (error || formattedSleepData.length === 0) {
    return (
      <View className="items-center justify-center w-full h-[220px]">
        <Text className="text-center color-white">
          No hay datos disponibles
        </Text>
      </View>
    );
  }

  return (
    <View>
      <LineChart
        data={{
          labels: formattedSleepData.map((data) => data.day),
          datasets: [
            {
              data: formattedSleepData.map((data) => data.duration),
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
