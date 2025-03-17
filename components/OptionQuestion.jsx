import { View, Text, TouchableOpacity, SafeAreaView } from "react-native";
import React, { useState } from "react";

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
    <SafeAreaView
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
      <View className="gap-2 w-full">
        {question.options.map((item) => (
          <TouchableOpacity
            key={item.id}
            onPress={() => {
              setSelectedOption(item.id);
              onAnswer(question.id, item.option);
            }}
            className="px-8 py-4 w-full rounded-2xl"
            style={{
              backgroundColor:
                selectedOption === item.id ? "#162030" : "#1a2c46",
            }}
          >
            {selectedOption === item.id ? (
              <Text className="text-lg text-center color-[#6366ff] w-full">
                {item.option}
              </Text>
            ) : (
              <Text className="w-full text-lg text-center color-white">
                {item.option}
              </Text>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
};

export default OptionQuestion;
