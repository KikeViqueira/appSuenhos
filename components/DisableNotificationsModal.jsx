import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import React, { useState } from "react";
import { Feather } from "@expo/vector-icons";

const DisableNotificationsModal = ({
  visible,
  setModalVisible,
  onConfirmDisable,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleConfirmDisable = async () => {
    setIsProcessing(true);
    try {
      await onConfirmDisable();
      setModalVisible(false);
    } catch (error) {
      console.error("Error al desactivar notificaciones:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={() => setModalVisible(false)}
    >
      <View className="items-center justify-center flex-1 bg-black/50">
        <View className="w-[85%] bg-[#1e2a47] rounded-2xl p-6">
          {/* Header con icono */}
          <View className="items-center mb-4">
            <View className="bg-[#ff4757]/10 p-4 rounded-full mb-3">
              <Feather name="bell-off" size={32} color="#ff4757" />
            </View>
            <Text className="text-xl font-bold text-center text-white">
              Desactivar Notificaciones
            </Text>
          </View>

          {/* Contenido del mensaje */}
          <View className="mb-6">
            <Text className="text-base text-[#8a94a6] text-center mb-4">
              ¿Estás seguro de que quieres desactivar las notificaciones?
            </Text>

            <View className="bg-[#323d4f]/30 p-4 rounded-xl mb-4">
              <View className="flex-row items-start gap-3">
                <Feather name="alert-triangle" size={20} color="#ff4757" />
                <View className="flex-1">
                  <Text className="text-sm font-medium text-[#ff4757] mb-1">
                    Importante:
                  </Text>
                  <Text className="text-sm text-[#8a94a6]">
                    Todas las notificaciones programadas serán canceladas y no
                    podrás recuperarlas.
                  </Text>
                </View>
              </View>
            </View>

            <View className="bg-[#1e273a] p-4 rounded-xl">
              <Text className="text-sm text-[#8a94a6] text-center">
                Podrás reactivar las notificaciones en cualquier momento desde
                esta misma configuración.
              </Text>
            </View>
          </View>

          {/* Botones de acción */}
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              className="flex-1 bg-[#6366ff] py-3 rounded-xl"
              disabled={isProcessing}
            >
              <Text className="text-base font-medium text-center text-white">
                Cancelar
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-[#ff4757] p-3 rounded-xl w-[45%]"
              onPress={handleConfirmDisable}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text className="text-center text-white font-psemibold">
                  Confirmar
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default DisableNotificationsModal;
