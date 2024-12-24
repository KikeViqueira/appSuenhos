import { View, Text, ScrollView } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import TipItem from "../../components/TipItem";

const Tips = () => {
  return (
    <SafeAreaView className="w-full h-full bg-primary">
      <View className="flex flex-col gap-8 justify-center items-center w-[90%] self-center">
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
            gap: 2,
            width: "100%",
            height: "100%",
          }}
        >
          <TipItem />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default Tips;
