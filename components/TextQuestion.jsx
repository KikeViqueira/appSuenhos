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

  return (
    <View
      className="flex flex-col gap-5 justify-center items-center w-full"
      style={{
        height: "auto",
      }}
    >
      <Text
        className="text-center font-bold color-[#6366ff]"
        style={{ fontSize: 18 }}
      >
        {question.title}
      </Text>
      <TextInput
        placeholder={question.placeholder}
        placeholderTextColor="#9ca3af"
        maxLength={question.maxLength} //Solo dejamos escribir el máximo permitido
        value={value}
        onChangeText={(val) => {
          setValue(val);
          onAnswer(question.id, val);
        }}
        multiline={true}
        textAlignVertical="top"
        scrollEnabled={true}
        style={{
          maxHeight: 100,
        }}
        className="bg-[#1e2a47] border w-full border-gray-500 rounded-xl p-2 text-white"
      />
    </View>
  );
};

export default TextQuestion;
