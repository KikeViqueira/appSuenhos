import { View, Text, Modal, TouchableOpacity } from "react-native";
import React from "react";
import { Feather } from "@expo/vector-icons";

const LogOutModal = ({ visible, setModalVisible, logOut }) => {
  //Función para cerrar la visibilidad del modal y la sesión
  const closeLogOutModal = () => {
    setModalVisible(false);
    logOut();
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
              <Feather name="log-out" size={32} color="#ff4757" />
            </View>
            <Text className="mb-2 text-xl font-bold text-center text-white">
              Cerrar Sesión
            </Text>
          </View>

          {/* Contenido */}
          <View className="mb-6">
            <Text className="mb-2 text-base text-center text-[#8a94a6]">
              ¿Estás seguro de que quieres cerrar sesión?
            </Text>
            <View className="bg-[#1e273a] p-4 rounded-xl">
              <Text className="text-sm text-center text-[#8a94a6]">
                Tendrás que volver a iniciar sesión para acceder a tu cuenta
              </Text>
            </View>
          </View>

          {/* Botones */}
          <View className="flex-row gap-3">
            {/* Botón Cancelar */}
            <TouchableOpacity
              className="flex-1 bg-[#6366ff] py-3 rounded-xl"
              onPress={() => setModalVisible(false)}
            >
              <Text className="text-base font-medium text-center text-white">
                Cancelar
              </Text>
            </TouchableOpacity>

            {/* Botón Confirmar */}
            <TouchableOpacity
              className="flex-1 bg-[#ff4757] py-3 rounded-xl"
              onPress={closeLogOutModal}
            >
              <Text className="font-medium text-center text-white">
                Cerrar Sesión
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default LogOutModal;
