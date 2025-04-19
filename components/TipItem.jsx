import { View, Text } from "react-native";
import React from "react";
import { ShieldQuestion } from "lucide-react-native";
import { Square, CheckSquare } from "lucide-react-native";

//Componente que representa un tip, recibe el título del tip y una breve descripción, más adelante podrá recibir un icono al lado del título lo que lo hace más llamativo visualmente
//En caso de que no se pase porparátros un icono para el tip, ponemos un emoticono de ?
const TipItem = ({
  title,
  description,
  icon: IconParameter = ShieldQuestion,
  color,
  isSelectionMode,
  isSelected,
}) => {
  return (
    <View
      //Si el tip se ha marcado para ser eliminado cambiamos el color de su borde a rojo
      className={`bg-[#1e273a] w-full p-6 gap-4 rounded-lg border ${
        isSelected ? " border-[#ff6b6b]" : " border-[#323d4f]"
      } `}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center flex-1 gap-6">
          {/*Gap que equivale a los mismos px del p del contenedor asi tenemos el icono centrado y bien distanciado */}
          <View className={`items-center justify-center`}>
            <IconParameter color={color} size={20} />
          </View>
          <View className="flex-1">
            <Text className="mb-1 text-xl font-bold text-white">{title}</Text>
            <Text className="text-base text-gray-300">{description}</Text>
          </View>
        </View>

        {/*Si el selection mode esta en True renderizamos el icono de selección*/}
        {isSelectionMode && (
          <View
            className={`p-2 rounded-full ${
              isSelected ? "bg-[#ff6b6b]/20" : "bg-white/5"
            }`}
          >
            {isSelected ? (
              <CheckSquare color="#ff6b6b" size={24} />
            ) : (
              <Square color="white" size={24} />
            )}
          </View>
        )}
      </View>
    </View>
  );
};

export default TipItem;
