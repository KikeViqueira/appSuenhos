import LottieView from "lottie-react-native";
import React from "react";

const NotFound = () => {
  return (
    <LottieView
      source={require("../assets/animations/notFound.json")}
      autoPlay
      loop
      style={{ width: 400, height: 400 }}
    />
  );
};

export default NotFound;
