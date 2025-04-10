import React from "react";
import LottieView from "lottie-react-native";

const LoadingBanner = () => {
  return (
    <LottieView
      source={require("../assets/animations/loadBanner.json")}
      autoPlay
      loop
      style={{ width: 80, height: 50 }}
    />
  );
};

export default LoadingBanner;
