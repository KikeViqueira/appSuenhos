import { View, Text } from "react-native";
import React from "react";
import { Bed, Boxes } from "lucide-react-native";
import FirstLineChart from "./FirstLineChart";
import SleepPieChart from "./SleepPieChart";

const SleepGraphs = () => {
  return (
    <View className="flex justify-center w-[95%] gap-6 px-4 py-5 rounded-lg bg-[#1e2a47]">
      <View className="flex flex-row gap-4 justify-start">
        <Bed size={24} color="#fff" />
        <Text
          className="text-center font-bold color-[#6366ff]"
          style={{ fontSize: 24 }}
        >
          Horas de Sueño Semanal
        </Text>
      </View>
      <View className="flex items-center">
        {/* Segunda sección de la pestaña de estadísticas, que hace referencia a la gráfica que recoge las horas que el usario a dormido a lo largo de los días de la semana*/}
        <FirstLineChart />
      </View>

      {/*GRÁFICA QUE MUESTRA EL PORCENTAJE EN LAS QUE HA ESTADO EL USER EN CADA UNA DE LAS POSIBLES FASES DEL SUEÑO */}
      <View className="flex flex-row gap-4 justify-start">
        <Boxes size={24} color="#fff" />
        <Text
          className="text-center font-bold color-[#6366ff]"
          style={{ fontSize: 24 }}
        >
          Fases del Sueño
        </Text>
      </View>
      <View className="flex items-center">
        <SleepPieChart />
      </View>
    </View>
  );
};

export default SleepGraphs;
