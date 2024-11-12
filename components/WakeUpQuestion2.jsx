import { SafeAreaView, Text, View, TouchableOpacity } from "react-native";
import React, { useState } from "react";

const WakeUpQuestion2 = ({ setQuestion }) => {
  //Definimos las opciones de respuesta
  const options = [
    { id: 1, option: "Muy descansado" },
    { id: 2, option: "Descansado" },
    { id: 3, option: "Ni descansado ni cansado" },
    { id: 4, option: "Cansado" },
    { id: 5, option: "Muy cansado" },
  ];

  //Estado para saber si se ha seleccionado una respuesta
  const [selected, setSelected] = useState(null);

  return (
    <SafeAreaView
      className="flex flex-col w-[90%] justify-center items-center gap-5"
      style={{
        height: "auto",
      }}
    >
      <Text
        className="text-center font-bold color-[#6366ff]"
        style={{ fontSize: 24 }}
      >
        ¿Cómo ha sido la calidad de tu sueño?
      </Text>
      <View className="w-full gap-2">
        {options.map((item) => (
          <TouchableOpacity
            key={item.id}
            onPress={() => {
              setSelected(item.id);
              setQuestion(item.option);
            }}
            className="w-full px-8 py-4 rounded-2xl"
            style={{
              backgroundColor: selected === item.id ? "#162030" : "#1a2c46",
            }}
          >
            {selected === item.id ? (
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

export default WakeUpQuestion2;
