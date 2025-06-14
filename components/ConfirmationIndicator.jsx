import LottieView from "lottie-react-native";
import React from "react";

const ConfirmationIndicator = () => {
  return (
    <LottieView
      source={require("../assets/animations/confirmation.json")}
      autoPlay
      loop
      style={{ width: 150, height: 150 }}
    />
  );
};

export default ConfirmationIndicator;
