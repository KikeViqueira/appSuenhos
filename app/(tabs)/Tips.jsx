import { View, Text, ScrollView } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import TipItem from "../../components/TipItem";
import { tips } from "../../constants/tips";

const Tips = () => {
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
            <TipItem
              key={index}
              title={tip.title}
              description={tip.description}
              icon={tip.icon}
              color={tip.color}
            />
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default Tips;
