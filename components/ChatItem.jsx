import { View, Text } from "react-native";
import React from "react";
import { Feather } from "@expo/vector-icons";
/*
 * Recibimos si el chat está seleccionado o no en el modo de selección múltiple y si este último está ativado o no
 */
const ChatItem = ({ item, isSelectionMode, isSelected }) => {
  return (
    <View
      className={`w-full rounded-xl border ${
        isSelected ? "border-[#ff4757]" : "border-[#323d4f]"
      }`}
    >
      <View className="flex-row items-center justify-between p-5">
        <View className="flex-row items-center flex-1">
          <View
            className={`w-10 h-10 rounded-full mr-3 items-center justify-center ${
              isSelected ? "bg-[#ff4757]/20" : "bg-[#6366ff]/20"
            }`}
          >
            <Feather
              name="message-square"
              color={isSelected ? "#ff4757" : "#6366ff"}
              size={20}
            />
          </View>
          <View className="flex-1">
            <Text className="mb-1 text-lg font-semibold text-white">
              {item.name}
            </Text>
            <Text
              className={`${isSelected ? "text-[#ff4757]" : "text-[#6366ff]"}`}
            >
              {item.date}
            </Text>
          </View>
        </View>

        {/*Si el selection mode esta en True renderizamos el icono de selección*/}
        {isSelectionMode && (
          <View
            className={`p-2 rounded-full ${
              isSelected ? "bg-[#ff4757]/20" : "bg-white/5"
            }`}
          >
            {isSelected ? (
              <Feather name="check-square" color="#ff4757" size={24} />
            ) : (
              <Feather name="square" color="white" size={24} />
            )}
          </View>
        )}
      </View>
    </View>
  );
};

export default ChatItem;
