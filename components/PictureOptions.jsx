import { View, Text, Modal, TouchableOpacity } from "react-native";
import React from "react";
import { Camera, Image, Trash2, X } from "lucide-react-native";

const PictureOptions = ({
  visible,
  setModalVisible,
  uploadPicture,
  deletePicture,
}) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={() => setModalVisible(false)}
    >
      <TouchableOpacity
        className="flex-1 justify-center items-center bg-black/50"
        activeOpacity={1}
      >
        <View className="bg-[#1e2a47] p-6 rounded-xl w-[80%] max-w-[300px]">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-bold color-white">
              Opciones de Foto
            </Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <X size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <View className="gap-6">
            {/*Botón que representa sacar una foto con la cámara y ponerla de perfil */}
            <TouchableOpacity
              className="flex-row items-center gap-2 bg-[#6366ff] p-3 rounded-xl"
              onPress={() => {
                uploadPicture({ mode: "photo" });
              }}
            >
              <Camera size={24} color="white" className="mr-3" />
              <Text className="text-white font-psemibold">Tomar Foto</Text>
            </TouchableOpacity>

            {/*Botón que representa poner una foto de la galería como de perfil */}
            <TouchableOpacity
              className="flex-row items-center gap-2 bg-[#6366ff] p-3 rounded-xl"
              onPress={() => {
                uploadPicture({ mode: "gallery" });
              }}
            >
              <Image size={24} color="white" className="mr-3" />
              <Text className="text-white font-psemibold">
                Elegir de Galería
              </Text>
            </TouchableOpacity>

            {/*Botón que representa eliminar la foto de perfil actual*/}
            <TouchableOpacity
              className="flex-row items-center gap-2 bg-[#ff6b6b] p-3 rounded-xl"
              onPress={() => {
                deletePicture();
              }}
            >
              <Trash2 size={24} color="white" className="mr-3" />
              <Text className="text-white font-psemibold">Eliminar Foto</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

export default PictureOptions;
