import { View, Text } from "react-native";
import React, { useState } from "react";
import Slider from "@react-native-community/slider";

/*
 * Question object example
 *"id": "drm_question1",
 *     "title": "¿Cómo calificarías tu nivel de concentración durante el día?",
 *     "type": "scale",
 *     "scale": {
 *       "min": 1,
 *       "max": 10,
 *       "step": 1,
 *       "description": "1 = Muy baja, 10 = Excelente"
 *     }
 */

const SliderQuestion = ({ question, onAnswer }) => {
  const [value, setValue] = useState(question.scale.min); //Por default el valor es el minimo

  // Función para obtener emoji según el valor y rango
  const getValueEmoji = (val) => {
    const percentage =
      (val - question.scale.min) / (question.scale.max - question.scale.min);

    // Sistema de emojis que funciona bien en iOS y Android
    if (percentage <= 0.2) return "😔"; // Muy bajo - 20%
    if (percentage <= 0.4) return "😐"; // Bajo - 40%
    if (percentage <= 0.6) return "🙂"; // Medio - 60%
    if (percentage <= 0.8) return "😊"; // Alto - 80%
    return "😄"; // Muy alto - 100%
  };

  // Función para obtener descripción del estado
  const getValueDescription = (val) => {
    const percentage =
      (val - question.scale.min) / (question.scale.max - question.scale.min);

    if (percentage <= 0.2) return "Muy bajo";
    if (percentage <= 0.4) return "Bajo";
    if (percentage <= 0.6) return "Medio";
    if (percentage <= 0.8) return "Alto";
    return "Muy alto";
  };

  return (
    <View className="flex flex-col w-full gap-4">
      <Text className=" text-xl font-semibold text-[#6366ff]">
        {question.title}
      </Text>

      {question.scale.description && (
        <Text className="text-sm text-gray-400">
          {question.scale.description}
        </Text>
      )}

      <View className="flex-col w-full gap-3">
        {/* Slider */}
        <View className="px-1">
          <Slider
            minimumValue={question.scale.min}
            maximumValue={question.scale.max}
            step={question.scale.step}
            value={value}
            onValueChange={(val) => {
              setValue(val);
              onAnswer(question.id, val);
            }}
            style={{ width: "100%", height: 40 }}
            minimumTrackTintColor="#6366ff"
            maximumTrackTintColor="#252e40"
            thumbStyle={{
              backgroundColor: "#6366ff",
              width: 20,
              height: 20,
            }}
          />
        </View>

        {/* Indicadores min/max */}
        <View className="flex-row justify-between px-1">
          <Text className="text-sm text-gray-500">{question.scale.min}</Text>
          <Text className="text-sm text-gray-500">{question.scale.max}</Text>
        </View>

        {/* Valor seleccionado */}
        <View className="items-center px-6 py-3 rounded-xl bg-[#6366ff]/10 border border-[#6366ff]/30 gap-2">
          {/* Emoji principal */}
          <Text style={{ fontSize: 32 }}>{getValueEmoji(value)}</Text>

          {/* Valor numérico */}
          <Text className="text-lg font-bold text-[#6366ff]">{value}</Text>

          {/* Descripción del estado */}
          <Text className="text-sm text-gray-400">
            {getValueDescription(value)}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default SliderQuestion;
