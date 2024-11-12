import { View, Dimensions } from "react-native";
import React from "react";
import { LineChart } from "react-native-chart-kit";

const FirstLineChart = () => {
  return (
    <View>
      <LineChart
        data={{
          labels: ["L", "M", "M", "J", "V", "S", "D"],
          datasets: [
            {
              data: [6, 7, 6.5, 8, 7.5, 9, 8.5], // Horas de sueño por día de la semana
            },
          ],
        }}
        width={Dimensions.get("window").width - 60} // Ancho de la gráfica
        height={220}
        bezier // Curva de la línea
        yAxisLabel="h"
        yAxisInterval={1} //Intervalo de horas en el eje Y
        chartConfig={{
          backgroundGradientFrom: "#1e2a47",
          backgroundGradientTo: "#1e2a47",
          //En las dos siguientes propiedades usamos backticks para poder meter el valor de la opacidad median una expresión. Además nos permite escribir en varias líneas si queremos
          color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`, // Color de la línea
          labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`, // Color de las etiquetas
          strokeWidth: 2, // Grosor de la línea
          useShadowColorFromDataset: false, // Sombra de la línea
        }}
      />
    </View>
  );
};

export default FirstLineChart;
