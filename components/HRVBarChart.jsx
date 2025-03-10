import { View, Text, Dimensions } from "react-native";
import React from "react";
import { BarChart } from "react-native-chart-kit";

//CARGAMOS LOS DATOS DE MANERA ESTÁTICA PARA SIMULAR EL CAMBIO DE LOS VALORES DE HRV
const hrvData = {
  labels: ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"],
  datasets: [
    {
      data: [45, 47, 50, 45.7, 46, 48, 49],
    },
  ],
};

const HRVBarChart = () => {
  return (
    <View>
      <BarChart
        data={hrvData}
        width={Dimensions.get("window").width - 50}
        height={220}
        chartConfig={{
          backgroundGradientFrom: "#1e2a47",
          backgroundGradientTo: "#1e2a47",
          decimalPlaces: 1,
          color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
        }}
        style={{ marginLeft: -20 }} // Ponemos valor negativo para que el gráfico se vea bien en la sección de la app
      />
    </View>
  );
};

export default HRVBarChart;
