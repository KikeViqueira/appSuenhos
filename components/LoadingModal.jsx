import React, { useRef, useEffect } from "react";
import { Modal, View, Text, ActivityIndicator, Animated } from "react-native";
import { Feather } from "@expo/vector-icons";

const LoadingModal = ({
  visible,
  operationType, // "upload" o "delete"
  contentType, // "sound" o "photo"
  message,
  onRequestClose = () => {}, // Función para cerrar el modal, en este caso es vacía ya que se cierra cuando se termina de subir el archivo
}) => {
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Iniciar animación de progreso cuando el modal se muestre
      progressAnim.setValue(0);
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(progressAnim, {
            toValue: 1,
            duration: operationType === "upload" ? 1500 : 1000,
            useNativeDriver: true,
          }),
          Animated.timing(progressAnim, {
            toValue: 0,
            duration: operationType === "upload" ? 1500 : 1000,
            useNativeDriver: true,
          }),
        ])
      );
      animation.start();

      return () => {
        animation.stop();
        progressAnim.setValue(0);
      };
    }
  }, [visible, operationType]);

  // Configuración dinámica basada en props
  const getConfig = () => {
    const configs = {
      upload: {
        sound: {
          color: "#6366ff",
          bgColor: "bg-[#6366ff]/20",
          progressColor: "bg-[#6366ff]",
          icon: "upload",
          title: "Subiendo sonido",
          defaultMessage: "Subiendo el sonido...",
        },
        photo: {
          color: "#15db44",
          bgColor: "bg-[#15db44]/20",
          progressColor: "bg-[#15db44]",
          icon: "camera",
          title: "Subiendo foto",
          defaultMessage: "Subiendo la foto de perfil...",
        },
      },
      delete: {
        sound: {
          color: "#ff4757",
          bgColor: "bg-[#ff4757]/20",
          progressColor: "bg-[#ff4757]",
          icon: "trash-2",
          title: "Eliminando sonido",
          defaultMessage: "Eliminando sonido...",
        },
        photo: {
          color: "#ff4757",
          bgColor: "bg-[#ff4757]/20",
          progressColor: "bg-[#ff4757]",
          icon: "trash-2",
          title: "Eliminando foto",
          defaultMessage: "Eliminando la foto de perfil...",
        },
      },
    };

    return configs[operationType]?.[contentType] || configs.upload.sound;
  };

  const config = getConfig();

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onRequestClose}
    >
      <View className="flex-1 justify-center items-center bg-black/70">
        <View className="w-[80%] bg-[#1e2a47] p-8 rounded-2xl items-center">
          <View
            className={`w-16 h-16 rounded-full items-center justify-center mb-4 ${config.bgColor}`}
          >
            <Feather name={config.icon} color={config.color} size={28} />
          </View>

          <ActivityIndicator
            size="large"
            color={config.color}
            className="mb-4"
          />

          <Text className="mb-2 text-xl font-bold text-center text-white">
            {config.title}
          </Text>

          <Text className="text-base text-center text-gray-300">
            {message || config.defaultMessage}
          </Text>

          {/* Barra de progreso animada */}
          <View className="w-full h-2 bg-[#323d4f] rounded-full mt-4 overflow-hidden">
            <Animated.View
              className={`h-full rounded-full ${config.progressColor}`}
              style={{
                width: "30%",
                transform: [
                  {
                    translateX: progressAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 300], // Se mueve de izquierda a derecha
                    }),
                  },
                ],
                opacity: progressAnim.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [0.3, 1, 0.3], // Efecto de pulsación
                }),
              }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default LoadingModal;
