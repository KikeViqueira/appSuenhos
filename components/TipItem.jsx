import { View, Text } from "react-native";
import React from "react";
import { ShieldQuestion } from "lucide-react-native";
import { Square, SquareCheckBig } from "lucide-react-native";

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
      className={`bg-[#1e273a] min-w-[100%] self-center flex flex-col justify-between p-6 gap-4 rounded-lg border ${
        isSelected ? " border-[#ff6b6b]" : " border-[#323d4f]"
      } `}
    >
      <View className="flex flex-row items-center justify-between gap-4">
        <View className="flex flex-row items-center justify-between gap-4">
          <IconParameter color={color} />
          <Text className="text-xl italic font-bold text-white">{title}</Text>
        </View>
        {/*Si el selection mode esta en True renderizamos el icono de Square*/}
        {isSelectionMode && (
          <>
            {isSelected ? ( //DEPENDIENDO DE SI EL TIP ESTÁ SELECCIONADO O NO PONEMOS UN ICONO VISUAL DIFERENTE
              <SquareCheckBig color="#ff6b6b" size={28} />
            ) : (
              <Square color="white" size={28} />
            )}
          </>
        )}
      </View>
      <Text className="text-base text-white">{description}</Text>
    </View>
  );
};

export default TipItem;
