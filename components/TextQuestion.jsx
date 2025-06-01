import { View, Text, TextInput } from "react-native";
import React, { useState } from "react";

/*
    Text question object example
 *    
 *   "id": "drm_question6",
 *   "title": "Comentarios adicionales (opcional)",
 *   "type": "text",
 *   "maxLength": 250,
 *   "placeholder": "Escribe aquí cualquier comentario adicional..."
 *   
 */

const TextQuestion = ({ question, onAnswer }) => {
  const [value, setValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View className="flex flex-col w-full gap-4">
      <Text className=" text-xl font-semibold text-[#6366ff]">
        {question.title}
      </Text>

      <View className="w-full">
        <TextInput
          placeholder={question.placeholder}
          placeholderTextColor="#9ca3af"
          maxLength={question.maxLength}
          value={value}
          onChangeText={(val) => {
            setValue(val);
            onAnswer(question.id, val);
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          multiline={true}
          textAlignVertical="top"
          scrollEnabled={true}
          style={{
            minHeight: 80,
            maxHeight: 120,
            fontSize: 15,
            lineHeight: 20,
          }}
          className={`bg-[#0e172a] border w-full rounded-lg p-3 text-white ${
            isFocused
              ? "border-[#6366ff]"
              : value.length > 0
              ? "border-[#10b981]"
              : "border-[#252e40]"
          }`}
        />

        {/* Contador de caracteres */}
        <View className="flex-row items-center justify-between mt-2">
          <View>
            {value.length > 0 && (
              <Text className="text-[#10b981] text-base">
                Respuesta añadida ✓
              </Text>
            )}
          </View>

          <Text className="text-base text-gray-500">
            {value.length}/{question.maxLength}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default TextQuestion;
