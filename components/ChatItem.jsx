import { View, Text } from "react-native";
import React from "react";
import { Feather } from "@expo/vector-icons";
/*
 * Recibimos si el chat está seleccionado o no en el modo de selección múltiple y si este último está ativado o no
 * También recibimos si es un chat filtrado para aplicar estilos visuales distintos
 */
const ChatItem = ({
  item,
  isSelectionMode,
  isSelected,
  isFiltered = false,
}) => {
  return (
    <View
      className={`bg-[#1e2a47] w-full p-6 gap-4 rounded-lg border ${
        isSelected ? "border-[#ff4757]" : "border-[#323d4f]"
      } ${isFiltered ? "bg-[#1e273a]" : ""}`}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center flex-1 gap-6">
          <View
            className={`p-3 rounded-full items-center justify-center ${
              isFiltered ? "bg-[#6366ff]/30" : "bg-[#6366ff]/20"
            }`}
          >
            <Feather
              name={isFiltered ? "filter" : "message-square"}
              color="#6366ff"
              size={24}
            />
          </View>
          <View className="flex-1">
            <Text className="mb-1 text-xl font-bold text-white">
              {item.name}
            </Text>
            <View className="flex-row items-center gap-2 mb-2">
              <Feather
                name={isFiltered ? "search" : "calendar"}
                size={14}
                color={isFiltered ? "#9ca3af" : "#6366ff"}
              />
              <Text
                className={`text-base ${
                  isFiltered ? "text-gray-400" : "text-[#6366ff]"
                }`}
              >
                {item.date}
              </Text>
              {isFiltered && (
                <View className="bg-[#6366ff]/20 px-2 py-1 rounded-full ml-2">
                  <Text className="text-xs text-[#6366ff] font-semibold">
                    Filtrado
                  </Text>
                </View>
              )}
            </View>
            {/* Línea decorativa debajo de la fecha */}
            <View
              className={`h-px w-16 ${
                isFiltered ? "bg-[#6366ff]/30" : "bg-[#323d4f]"
              }`}
            />
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
