import { View, Dimensions } from "react-native";
import React, { useEffect } from "react";
import { ContributionGraph } from "react-native-chart-kit";
import useChat from "../hooks/useChat";

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
  const { last3MonthsChats, getLast3MonthsChats, history } = useChat();

  useEffect(() => {
    // Llamamos a la función para obtener los chats de los últimos 3 meses
    getLast3MonthsChats();
  }, [history]);

  return (
    <View>
      <ContributionGraph
        values={last3MonthsChats}
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
