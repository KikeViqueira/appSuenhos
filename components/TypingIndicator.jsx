import React from "react";
import LottieView from "lottie-react-native";
import { View } from "react-native";

const TypingIndicator = () => {
  return (
    <LottieView
      source={require("../assets/animations/typingIndicator.json")} // Ubicación del archivo JSON de la animación
      autoPlay
      loop
      style={{ width: 50, height: 50 }}
    />
  );
};

export default TypingIndicator;
