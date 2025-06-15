import { View, Text, Modal, TouchableOpacity } from "react-native";
import React from "react";
import { Feather } from "@expo/vector-icons";

const DeleteAccountModal = ({ visible, setModalVisible, deleteAccount }) => {
  //Función para cerrar la visibilidad del modal y eliminar la cuenta
  const handleDeleteAccount = () => {
    setModalVisible(false);
    deleteAccount();
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={() => setModalVisible(false)}
    >
      <View className="items-center justify-center flex-1 bg-black/70">
        <View className="bg-[#1e2a47] rounded-2xl p-6 w-[85%] max-w-[400px]">
          {/* Header con icono triste */}
          <View className="items-center mb-4">
            <View className="bg-[#ff6b6b]/10 p-4 rounded-full mb-3">
              <Text style={{ fontSize: 32 }}>😢</Text>
            </View>
            <Text className="text-xl font-bold text-center text-white">
              ¿Eliminar tu cuenta?
            </Text>
          </View>

          {/* Contenido del mensaje */}
          <View className="mb-6">
            <Text className="mb-4 text-base text-center text-gray-400">
              Lamentamos que quieras dejarnos. Si eliminas tu cuenta:
            </Text>

            <View className="bg-[#323d4f]/30 p-4 rounded-xl mb-4">
              <View className="flex-row items-start gap-3 mb-3">
                <Feather name="alert-triangle" size={20} color="#ff6b6b" />
                <View className="flex-1">
                  <Text className="text-sm font-medium text-[#ff6b6b] mb-1">
                    Eliminación Permanente:
                  </Text>
                  <Text className="text-sm text-gray-400">
                    • Todos tus datos personales{"\n"}• Historial de chats y
                    análisis{"\n"}• Registros de sueño y estadísticas{"\n"}•
                    Tips personalizados y favoritos{"\n"}• Configuraciones y
                    preferencias
                  </Text>
                </View>
              </View>
            </View>

            <View className="bg-[#1e273a] p-4 rounded-xl">
              <Text className="text-sm text-center text-gray-400">
                <Text style={{ fontSize: 16 }}>💔</Text> Esta acción no se puede
                deshacer.
                {"\n"}Todos tus datos serán eliminados permanentemente.
              </Text>
            </View>
          </View>

          {/* Botones de acción */}
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              className="flex-1 bg-[#6366ff] py-3 rounded-xl"
            >
              <Text className="text-base font-medium text-center text-white">
                Quedarme
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-1 bg-[#ff6b6b] py-3 rounded-xl"
              onPress={handleDeleteAccount}
            >
              <Text className="font-medium text-center text-white">
                Eliminar cuenta
              </Text>
            </TouchableOpacity>
          </View>

          {/* Mensaje de despedida */}
          <View className="mt-4 pt-4 border-t border-[#323d4f]/30">
            <Text className="text-xs text-center text-gray-400">
              <Text style={{ fontSize: 14 }}>🙏</Text> Gracias por usar Zzztime.
              {"\n"}Esperamos haberte ayudado con tu descanso.
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default DeleteAccountModal;
