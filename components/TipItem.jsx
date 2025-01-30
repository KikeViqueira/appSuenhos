import { View, Text } from "react-native";
import React from "react";
import { ShieldQuestion } from "lucide-react-native";

//Componente que representa un tip, recibe el título del tip y una breve descripción, más adelante podrá recibir un icono al lado del título lo que lo hace más llamativo visualmente
//En caso de que no se pase porparátros un icono para el tip, ponemos un emoticono de ?
const TipItem = ({
  title,
  description,
  icon: IconParameter = ShieldQuestion,
  color,
}) => {
  return (
    <View className="bg-[#1e273a] min-w-[100%] self-center flex flex-col justify-between p-6 gap-4 rounded-lg border border-[#323d4f]">
      <View className="flex flex-row gap-4 justify-start items-center">
        <IconParameter color={color} />
        <Text className="text-xl italic font-bold text-white">{title}</Text>
      </View>
      <Text className="text-base text-white">{description}</Text>
    </View>
  );
};

export default TipItem;
