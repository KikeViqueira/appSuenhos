import React from "react";
import LottieView from "lottie-react-native";

const LoadingBanner = () => {
  return (
    <LottieView
      source={require("../assets/animations/bigLoadBanner.json")}
      autoPlay
      loop
      style={{ width: 350, height: 350 }}
    />
  );
};

export default LoadingBanner;
