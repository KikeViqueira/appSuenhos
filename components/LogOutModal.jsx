import { View, Text, Modal, TouchableOpacity } from "react-native";
import React from "react";
import { X } from "lucide-react-native";

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
      <View className="flex-1 justify-center items-center bg-black/50">
        <View className="bg-[#1e2a47] p-6 rounded-xl w-[85%] max-w-[500px] flex-col gap-6">
          <Text className="text-lg font-bold text-center color-white">
            ¿Estás seguro de que quieres cerrar sesión?
          </Text>

          <View className="flex-row gap-4 justify-between items-center">
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              className="bg-[#6366ff] p-3 rounded-xl w-[45%]"
            >
              <Text className="text-center text-white font-psemibold">
                Cancelar
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="bg-[#ff6b6b] p-3 rounded-xl w-[45%]"
              onPress={closeLogOutModal}
            >
              <Text className="text-center text-white font-psemibold">
                Confirmar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default LogOutModal;
