import React from "react";
import { View, Text, Modal, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";

const APIErrorModal = ({ visible, onClose, errorType, customMessage }) => {
  // Configuraciones para diferentes tipos de errores de API
  const errorConfig = {
    generateTip: {
      icon: "lightbulb",
      iconColor: "#ff4757",
      title: "Error al generar tip",
      message:
        "No se ha podido generar tu tip personalizado en este momento. Esto puede deberse a un problema temporal con el servicio de inteligencia artificial.",
      suggestions: [
        "Verifica tu conexión a internet",
        "Inténtalo de nuevo en unos minutos",
        "Si el problema persiste, contacta soporte",
      ],
    },
    generateDrmReport: {
      icon: "file-text",
      iconColor: "#ff4757",
      title: "Error al generar informe DRM",
      message:
        "No se ha podido generar tu informe DRM en este momento. Esto puede deberse a un problema temporal con el servicio de análisis.",
      suggestions: [
        "Verifica tu conexión a internet",
        "Asegúrate de haber completado el cuestionario",
        "Inténtalo de nuevo en unos minutos",
      ],
    },
    apiGeneral: {
      icon: "alert-triangle",
      iconColor: "#ff4757",
      title: "Error del servicio",
      message:
        "Ha ocurrido un error inesperado en nuestros servicios. Estamos trabajando para solucionarlo.",
      suggestions: [
        "Verifica tu conexión a internet",
        "Inténtalo de nuevo más tarde",
        "Si el problema persiste, contacta soporte",
      ],
    },
  };

  // Usar configuración personalizada o por defecto
  const config = errorConfig[errorType] || errorConfig.apiGeneral;
  const finalMessage = customMessage || config.message;

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center items-center bg-black/70">
        <View className="bg-[#1e2a47] rounded-2xl p-6 w-[85%] max-w-[400px]">
          {/* Icono de error */}
          <View className="items-center mb-4">
            <View
              className="justify-center items-center w-16 h-16 rounded-full"
              style={{ backgroundColor: `${config.iconColor}20` }}
            >
              <Feather name={config.icon} size={28} color={config.iconColor} />
            </View>
          </View>

          {/* Título */}
          <Text
            className="mb-3 font-bold text-center text-white"
            style={{ fontSize: 20 }}
          >
            {config.title}
          </Text>

          {/* Mensaje principal */}
          <Text
            className="mb-4 leading-6 text-center text-gray-400"
            style={{ fontSize: 16, lineHeight: 24 }}
          >
            {finalMessage}
          </Text>

          {/* Sugerencias */}
          <View className="mb-6 bg-[#323d4f]/30 p-4 rounded-xl">
            <View className="flex-row items-center mb-3">
              <Feather name="info" size={18} color="#6366ff" />
              <Text className="ml-2 text-sm font-medium text-[#6366ff]">
                Sugerencias:
              </Text>
            </View>
            {config.suggestions.map((suggestion, index) => (
              <View key={index} className="flex-row items-start mb-2">
                <View className="w-1.5 h-1.5 rounded-full bg-[#6366ff] mt-2 mr-3" />
                <Text className="flex-1 text-sm text-[#8a94a6]">
                  {suggestion}
                </Text>
              </View>
            ))}
          </View>

          {/* Botón de cerrar */}
          <TouchableOpacity
            onPress={onClose}
            className="items-center px-6 py-4 rounded-2xl"
            style={{
              backgroundColor: "#6366ff",
              shadowColor: "#6366ff",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 8,
            }}
          >
            <Text className="text-lg font-semibold text-white">Entendido</Text>
          </TouchableOpacity>

          {/* Línea decorativa */}
          <View
            className="self-center mt-6 h-1 rounded-full"
            style={{
              width: 60,
              backgroundColor: config.iconColor,
              opacity: 0.3,
            }}
          />
        </View>
      </View>
    </Modal>
  );
};

export default APIErrorModal;
