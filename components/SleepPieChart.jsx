import { View, Text, Dimensions } from "react-native";
import React from "react";
import { PieChart } from "react-native-chart-kit";

//TODO: Implementar un gráfico de pastel para mostrar las distintas fases del sueño y cuanto ha estado el user en cada una de ellas
const sleepSummary = {
  deep: 60,
  light: 180,
  rem: 90,
  wake: 30,
};

//TODO: HACEMOS UN ARRAY DE LOS OBJETOS QUE VAMOS A ENSEÑAR EN EL GRÁFICO, SIGUIENDO EL FORMATO QUE PIDE LA LIBRERÍA
const pieData = [
  {
    name: "Profundo",
    population: sleepSummary.deep,
    color: "#003f5c",
    legendFontColor: "#7F7F7F",
    legendFontSize: 15,
  },
  {
    name: "Ligero",
    population: sleepSummary.light,
    color: "#58508d",
    legendFontColor: "#7F7F7F",
    legendFontSize: 15,
  },
  {
    name: "REM",
    population: sleepSummary.rem,
    color: "#bc5090",
    legendFontColor: "#7F7F7F",
    legendFontSize: 15,
  },
  {
    name: "Despierto",
    population: sleepSummary.wake,
    color: "#ff6361",
    legendFontColor: "#7F7F7F",
    legendFontSize: 15,
  },
];

const SleepPieChart = () => {
  return (
    <View>
      <PieChart
        data={pieData}
        width={Dimensions.get("window").width - 20}
        height={220}
        chartConfig={{
          backgroundGradientFrom: "#1e2a47",
          backgroundGradientTo: "#1e2a47",
          color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          strokeWidth: 2,
          useShadowColorFromDataset: false,
          decimalPlaces: 0, // Solo mostrar números enteros en el eje Y
        }}
        //Indicamos el campo de donde el pie chart va a sacar los valores a representar
        accessor="population"
        backgroundColor="transparent" //Color de fondo del gráfico
        paddingLeft="15"
        absolute
        style={{ marginVertical: 8, borderRadius: 16, marginHorizontal: 10 }}
      />
    </View>
  );
};

export default SleepPieChart;
