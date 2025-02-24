import { View, Text } from "react-native";
import React, { useEffect, useState } from "react";

const TypingIndicator = () => {
  //Estado que controlará los puntos que se muestran en pantalla mientras se espera la respuesta de la IA
  const [dots, setDots] = useState("");

  useEffect(() => {
    //Creamos el intervalo que indicará cuando se tiene que ir añadiendo cada punto
    const interval = setInterval(() => {
      setDots((prev) => (prev.length < 3 ? prev + "." : ""));
    }, 300); //cada 500ms se añade un punto

    //Limpiamos el intervalo al desmontar para evitar fugas de memoria
    return () => clearInterval(interval);
  }, []); //Con [] le decimos que solo se ejecute una vez

  return <Text className="text-4xl text-white">{dots}</Text>;
};

export default TypingIndicator;
