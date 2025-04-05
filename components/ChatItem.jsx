import { View, Text } from "react-native";
import React from "react";
import { Square, SquareCheckBig } from "lucide-react-native";
/*
 * Recibimos si el chat está seleccionado o no en el modo de selección múltiple y si este último está ativado o no
 */
const ChatItem = ({ item, isSelectionMode, isSelected }) => {
  return (
    <View
      className={`${
        isSelected ? " border-[#ff6b6b]" : " border-[#323d4f]"
      } w-full flex flex-col justify-between p-6 rounded-lg bg-[#1e273a] border`}
    >
      <View className="flex-row justify-between">
        <Text className="mb-2 text-xl font-bold text-white">{item.name}</Text>
        {/*Si el selection mode esta en True renderizamos el icono de Square*/}
        {isSelectionMode && (
          <>
            {isSelected ? (
              <SquareCheckBig color="#ff6b6b" size={28} />
            ) : (
              <Square color="white" size={28} />
            )}
          </>
        )}
      </View>
      <Text className="text-[#6366ff]">{item.date}</Text>
    </View>
  );
};

export default ChatItem;
