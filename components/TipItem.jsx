import { View, Text } from "react-native";
import React from "react";
import { Clock } from "lucide-react-native";

const TipItem = () => {
  return (
    <View className="bg-[#1e273a] w-full flex flex-col justify-between p-6 gap-4 rounded-lg">
      <View className="flex flex-row gap-4 justify-start items-center">
        <Clock />
        <Text className="text-xl italic font-bold text-white">
          Mantén un horario constante
        </Text>
      </View>
      <Text className="text-base text-white">
        Acuéstate y levántate a la misma hora todos los días, incluso los fines
        de semana.
      </Text>
    </View>
  );
};

export default TipItem;
