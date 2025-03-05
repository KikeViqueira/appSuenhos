import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
} from "react-native";
import React, { useState } from "react";
import { X } from "lucide-react-native";
import PasswordInputModal from "./PasswordInputModal";

const ChangePasswordModal = ({
  visible, //Variable que viene del perfil para saber cuando el modal se tiene que ver o no
  setModalVisible, //Función que viene del perfil para cambiar el estado de la variable visible
  currentPassword, //TODO: contraseña actual (obtenida, por ejemplo, de la BD o del contexto)
  changePassword, //TODO: función que actualiza la contraseña en la BD
  logOut, // función para cerrar sesión (ya que se usará JWT)
}) => {
  //Estados para almacenar la respuesta del user
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    // Validamos que la contraseña antigua coincida con la de la BD
    if (oldPassword !== currentPassword) {
      setError("La contraseña antigua es incorrecta.");
      return;
    }
    // Validamos que la nueva contraseña y su confirmación coincidan
    if (newPassword !== confirmPassword) {
      setError("La nueva contraseña y su confirmación no coinciden.");
      return;
    }
    // Validamos que la nueva contraseña sea diferente a la antigua
    if (oldPassword === newPassword) {
      setError("La nueva contraseña debe ser diferente a la antigua.");
      return;
    }
    // Si todo es válido, actualizamos la contraseña
    changePassword(newPassword);
    // Informamos al usuario que se cerrará la sesión por seguridad (JWT)
    logOut();
    // Cerramos el modal
    setModalVisible(false);
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={() => setModalVisible(false)}
    >
      <View className="items-center justify-center flex-1 bg-black/50">
        <View className="bg-[#1e2a47] p-6 rounded-xl w-[85%] max-w-[500px] flex-col gap-4">
          <View className="flex-row items-center justify-between">
            <Text className="text-lg font-bold text-center color-white">
              Cambiar Contraseña
            </Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <X size={28} color="white" />
            </TouchableOpacity>
          </View>

          <Text className="text-center text-white">
            Al confirmar, tu contraseña se actualizará y se cerrará tu sesión
            para que inicies con la nueva contraseña.
          </Text>

          {error ? (
            <Text className="text-center text-red-500">{error}</Text>
          ) : null}

          {/*Tenemos que meter todos los campos del modal en el que se puedan escribir dentro de un KeyboardAvoidingView */}
          <KeyboardAvoidingView className="flex-col gap-4">
            <PasswordInputModal
              value={oldPassword}
              onChangeText={setOldPassword}
              placeholder="Contraseña Antigua"
            />

            <PasswordInputModal
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="Nueva Contraseña"
            />

            <PasswordInputModal
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirmar Nueva Contraseña"
            />
          </KeyboardAvoidingView>

          <View className="flex-row items-center justify-between gap-4 mt-4">
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              className="bg-[#6366ff] p-3 rounded-xl w-[45%]"
            >
              <Text className="font-semibold text-center text-white">
                Cancelar
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSubmit}
              className="bg-[#ff6b6b] p-3 rounded-xl w-[45%]"
            >
              <Text className="font-semibold text-center text-white">
                Confirmar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ChangePasswordModal;
