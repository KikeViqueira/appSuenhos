import { View, Text, Modal, TouchableOpacity } from "react-native";
import React from "react";
import { Feather, AntDesign } from "@expo/vector-icons";

const PictureOptions = ({
  visible,
  setModalVisible,
  uploadPicture,
  deletePicture,
}) => {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={() => setModalVisible(false)}
    >
      <TouchableOpacity
        className="items-center justify-end flex-1 bg-black/60"
        activeOpacity={1}
        onPress={() => setModalVisible(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          className="bg-[#1e2a47] rounded-t-3xl w-full border-t-4 border-[#6366ff] shadow-2xl"
          style={{
            shadowColor: "#6366ff",
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.3,
            shadowRadius: 12,
            elevation: 20,
          }}
        >
          {/* Header con línea decorativa */}
          <View className="items-center pt-4 pb-2">
            <View className="w-12 h-1 bg-[#6366ff]/30 rounded-full mb-4" />
            <Text className="mb-6 text-xl font-bold text-white">
              Foto de Perfil
            </Text>
          </View>

          <View className="gap-4 px-6 pb-12">
            {/* Tomar Foto */}
            <TouchableOpacity
              className="flex-row items-center bg-[#6366ff] p-4 rounded-xl"
              onPress={() => {
                uploadPicture({ mode: "photo" });
              }}
            >
              <View className="p-3 mr-4 bg-white/10 rounded-xl">
                <Feather name="camera" size={24} color="white" />
              </View>
              <View className="flex-1">
                <Text className="mb-1 text-base font-medium text-white">
                  Tomar Foto
                </Text>
                <Text className="text-sm text-white/70">
                  Usa la cámara para capturar una nueva imagen
                </Text>
              </View>
              <Feather name="chevron-right" size={20} color="white" />
            </TouchableOpacity>

            {/* Elegir de Galería */}
            <TouchableOpacity
              className="flex-row items-center bg-[#1e273a] p-4 rounded-2xl border border-[#323d4f] shadow-lg"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
                elevation: 3,
              }}
              onPress={() => {
                uploadPicture({ mode: "gallery" });
              }}
            >
              <View className="bg-[#6366ff]/10 p-3 rounded-xl mr-4">
                <Feather name="image" size={24} color="#6366ff" />
              </View>
              <View className="flex-1">
                <Text className="mb-1 text-lg font-bold text-white">
                  Elegir de Galería
                </Text>
                <Text className="text-sm text-white/70">
                  Selecciona una imagen de tu galería
                </Text>
              </View>
              <Feather name="chevron-right" size={20} color="#6366ff" />
            </TouchableOpacity>

            {/* Eliminar Foto */}
            <TouchableOpacity
              className="flex-row items-center bg-[#ff4757]/10 p-4 rounded-2xl border border-[#ff4757]/20 shadow-lg"
              style={{
                shadowColor: "#ff4757",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
                elevation: 3,
              }}
              onPress={() => {
                deletePicture();
              }}
            >
              <View className="bg-[#ff4757]/10 p-3 rounded-xl mr-4">
                <Feather name="trash-2" size={24} color="#ff4757" />
              </View>
              <View className="flex-1">
                <Text className="mb-1 text-lg font-bold text-white">
                  Eliminar Foto
                </Text>
                <Text className="text-sm text-white/70">
                  Restaurar imagen por defecto
                </Text>
              </View>
              <Feather name="chevron-right" size={20} color="#ff4757" />
            </TouchableOpacity>

            {/* Botón Cancelar */}
            <TouchableOpacity
              className="mt-4 bg-[#8a94a6] p-4 rounded-2xl"
              onPress={() => setModalVisible(false)}
            >
              <Text className="text-lg font-semibold text-center text-white">
                Cancelar
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

export default PictureOptions;
