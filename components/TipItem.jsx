import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { ShieldQuestion } from "lucide-react-native";
import { Trash2 } from "lucide-react-native";

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
      <View className="flex flex-row gap-4 justify-between items-center">
        <View className="flex flex-row gap-4 justify-between items-center">
          <IconParameter color={color} />
          <Text className="text-xl italic font-bold text-white">{title}</Text>
        </View>
        {/*Tenemos que hacer que cuando se pulsa el icono no se ejecute el comprotamiento del TouchableOpacity padre que engloba a todo el tip */}
        <TouchableOpacity
          onPress={(e) => {
            e.stopPropagation(); //hacemos que la funcionalidad del botón no afecte al componente padre
            //TODO: Aquí llamaríamos a la funcionalidad de la api para borrar el tip
          }}
        >
          <Trash2 color="#ff6b6b" size={28} />
        </TouchableOpacity>
      </View>
      <Text className="text-base text-white">{description}</Text>
    </View>
  );
};

export default TipItem;
