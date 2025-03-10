import { View, Text, Dimensions } from "react-native";
import React from "react";
import { ContributionGraph } from "react-native-chart-kit";

//TODO: CARGAMOS LA DATA DE MANERA ESTÁTICA, EL VALOR DEL COUNT PUEDE SER EL NÚMERO DE MENSAJES QUE HA MANDADO EL USER EN EL CHAT DE ESE MISMO DÍA
const chatData = [
  { date: "2023-04-02", count: 1 },
  { date: "2023-04-05", count: 1 },
  { date: "2023-04-12", count: 1 },
  { date: "2023-04-18", count: 1 },
  { date: "2023-04-25", count: 1 },
];

const ChatContributionGraph = () => {
  return (
    <View>
      <ContributionGraph
        values={chatData}
        endDate={"2023-04-30"}
        numDays={94}
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
