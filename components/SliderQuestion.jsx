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
      <View className="flex-col gap-2 w-full">
        <Slider
          minimumValue={question.scale.min}
          maximumValue={question.scale.max}
          step={question.scale.step}
          value={value}
          onValueChange={(val) => {
            //Guardamos el valor tanto en el componente como el componente padre
            setValue(val);
            onAnswer(question.id, val);
          }}
          style={{ width: "100%" }}
        />
        <Text className="w-full text-lg text-center color-white">
          Valor seleccionado: {value}
        </Text>
      </View>
    </View>
  );
};

export default SliderQuestion;
