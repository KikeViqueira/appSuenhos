import { View, Dimensions } from "react-native";
import React from "react";
import { ContributionGraph } from "react-native-chart-kit";

//TODO: TENEMOS QUE HACER UN ENDPOINT QUE NOS DEVUELVA LOS CHATS QUE SE HAN HECHO EN LOS ÚLTIMOS TRES MESES
const chatData = [
  { date: "2023-04-02", count: 1 },
  { date: "2023-04-05", count: 1 },
  { date: "2023-04-12", count: 1 },
  { date: "2023-04-18", count: 1 },
  { date: "2023-04-25", count: 1 },
];

// Función para obtener el último día del mes actual
const getEndDate = () => {
  const now = new Date();
  // new Date(año, mes+1, 0) devuelve el último día del mes actual
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return end.toISOString().split("T")[0];
};

// Función para calcular el número de días entre el primer día del mes hace dos meses y el último día del mes actual
const getNumDays = () => {
  const now = new Date();
  // Primer día del mes que está dos meses atrás
  const start = new Date(now.getFullYear(), now.getMonth() - 2, 1);
  // Último día del mes actual
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  // Diferencia en milisegundos convertida a días
  const diffTime = end.getTime() - start.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return diffDays;
};

const ChatContributionGraph = () => {
  return (
    <View>
      <ContributionGraph
        values={chatData}
        endDate={getEndDate()}
        numDays={getNumDays()}
        width={Dimensions.get("window").width - 20}
        height={220}
        chartConfig={{
          backgroundGradientFrom: "#1e2a47",
          backgroundGradientTo: "#1e2a47",
          decimalPlaces: 1,
          color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
        }}
        squareSize={17}
        gutterSize={5}
      />
    </View>
  );
};

export default ChatContributionGraph;
