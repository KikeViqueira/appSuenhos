import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import React from "react";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import TipItem from "../../components/TipItem";
import { tips } from "../../constants/tips";

const Tips = () => {
  //hacemos la función para que al presionarse un tip nos lleve a la página del tip detallado correspondiente
  const handleTipPress = (tip) => {
    router.push({
      pathname: "../TipDetail",
      params: { tipId: tip.id.toString() }, //Pasamos solo el id del tip para evitar problamas de serialización
    });
  };

  return (
    <SafeAreaView className="w-full h-full bg-primary">
      <View className="flex flex-col gap-8 justify-center items-center self-center w-full">
        <Text
          className="text-center font-bold text-[#6366ff] py-4"
          style={{ fontSize: 24 }}
        >
          Tips para un mejor Sueño
        </Text>
        <ScrollView
          contentContainerStyle={{
            display: "flex",
            justifyContent: "start",
            gap: 16,
            width: "90%",
            height: "100%",
          }}
        >
          {tips.map((tip, index) => (
            <TouchableOpacity
              //Para cada uno de los tips hacemos un botón que nos lleve a la página del tip detallado
              key={index}
              onPress={() => handleTipPress(tip)}
            >
              <TipItem
                key={index}
                title={tip.title}
                description={tip.description}
                icon={tip.icon}
                color={tip.color}
              />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default Tips;
