import { View, Dimensions, Modal, Text, TouchableOpacity } from "react-native";
import React, { useState, useEffect } from "react";
import { LineChart } from "react-native-chart-kit";
import Icon from "react-native-vector-icons/FontAwesome";

const WeeklySleepChart = ({ sleepLogsDuration }) => {
  // Estado para controlar la visibilidad del popup y la información seleccionada
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [formattedSleepData, setFormattedSleepData] = useState([]);

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
          // Convertimos la duración de minutos totales a horas con decimales para la gráfica
          duration: hours + minutes / 60,
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

  // Función para formatear las etiquetas del eje Y como horas:minutos
  const formatYLabel = (value) => {
    const hours = Math.floor(value);
    const minutes = Math.round((value - hours) * 60);

    if (minutes === 0) {
      return `${hours}h`;
    }
    return `${hours}:${minutes.toString().padStart(2, "0")}`;
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
        yAxisInterval={1} // Intervalo de 1 hora para mostrar valores enteros
        yAxisSuffix=""
        onDataPointClick={handleDataPointClick}
        chartConfig={{
          backgroundGradientFrom: "#1e2a47",
          backgroundGradientTo: "#1e2a47",
          color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          strokeWidth: 2,
          useShadowColorFromDataset: false,
          formatYLabel: formatYLabel,
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

export default WeeklySleepChart;
