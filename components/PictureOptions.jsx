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
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={() => setModalVisible(false)}
    >
      <TouchableOpacity
        className="items-center justify-center flex-1 bg-black/50"
        activeOpacity={1}
      >
        <View className="bg-[#1e2a47] p-6 rounded-xl w-[80%] max-w-[300px]">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-bold color-white">
              Opciones de Foto
            </Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <AntDesign name="close" size={24} color="#fff" />
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
              <Feather name="camera" size={24} color="white" className="mr-3" />
              <Text className="text-white font-psemibold">Tomar Foto</Text>
            </TouchableOpacity>

            {/*Botón que representa poner una foto de la galería como de perfil */}
            <TouchableOpacity
              className="flex-row items-center gap-2 bg-[#6366ff] p-3 rounded-xl"
              onPress={() => {
                uploadPicture({ mode: "gallery" });
              }}
            >
              <Feather name="image" size={24} color="white" className="mr-3" />
              <Text className="text-white font-psemibold">
                Elegir de Galería
              </Text>
            </TouchableOpacity>

            {/*Botón que representa eliminar la foto de perfil actual*/}
            <TouchableOpacity
              className="flex-row items-center gap-2 bg-[#ff4757] p-3 rounded-xl"
              onPress={() => {
                deletePicture();
              }}
            >
              <Feather
                name="trash-2"
                size={24}
                color="white"
                className="mr-3"
              />
              <Text className="text-white font-psemibold">Eliminar Foto</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

export default PictureOptions;
