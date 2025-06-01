import { View, Text, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import { Feather } from "@expo/vector-icons";

/* Options question object example
 *    "id": "drm_question2",
 *     "title": "¿Percibiste que tu estado de ánimo y descanso influyeron en las decisiones que tomaste hoy?",
 *     "type": "options",
 *     "options": [
 *       { "id": 1, "option": "Mucho" },
 *       { "id": 2, "option": "Algo" },
 *       { "id": 3, "option": "Poco" },
 *       { "id": 4, "option": "Nada" }
 *     ]
 */

const OptionQuestion = ({ question, onAnswer }) => {
  const [selectedOption, setSelectedOption] = useState(null);

  return (
    <View className="w-full">
      <Text className="mb-4 text-xl font-semibold text-[#6366ff]">
        {question.title}
      </Text>

      <View className="gap-3">
        {question.options.map((item) => (
          <TouchableOpacity
            key={item.id}
            onPress={() => {
              setSelectedOption(item.id);
              onAnswer(question.id, item.option);
            }}
            className={`flex-row items-center justify-between p-4 border rounded-lg ${
              selectedOption === item.id
                ? "bg-[#6366ff]/20 border-[#6366ff]"
                : "bg-[#0e172a] border-[#252e40]"
            }`}
            activeOpacity={0.7}
          >
            <Text
              className={`text-base ${
                selectedOption === item.id
                  ? "text-white font-semibold"
                  : "text-gray-300"
              }`}
            >
              {item.option}
            </Text>

            {selectedOption === item.id && (
              <Feather name="check-circle" color="#6366ff" size={20} />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default OptionQuestion;
