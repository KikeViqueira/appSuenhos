import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import React, { useState } from "react";
import { AntDesign } from "@expo/vector-icons";
import PasswordInputModal from "./PasswordInputModal";
import useUser from "../hooks/useUser";

const ChangePasswordModal = ({
  visible, //Variable que viene del perfil para saber cuando el modal se tiene que ver o no
  setModalVisible, //Función que viene del perfil para cambiar el estado de la variable visible
  logOut, // función para cerrar sesión (ya que se usará JWT)
}) => {
  //Estados para almacenar la respuesta del user
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  //Recuperamos la función actualizar la info del user del contexto de user
  const { updateUser } = useUser();

  const handleSubmit = async () => {
    // Limpiar errores previos
    setError("");

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

    setIsSubmitting(true);

    try {
      // Si todo es válido, actualizamos la contraseña, enviándole al endpoint tanto como la vieja como la nueva contraseña dentro de un objeto
      const value = {
        oldPassword: oldPassword,
        newPassword: newPassword,
      };

      const wrongPasswordError = await updateUser("/password", value);

      // Si no hay error de contraseña incorrecta, el cambio fue exitoso
      if (!wrongPasswordError) {
        setModalVisible(false);
        logOut();
      } else {
        //Si hay errores tenemos que poner el mensaje de error en el estado error
        setError("La contraseña antigua no es correcta.");
      }
    } catch (error) {
      console.error("Error capturado en handleSubmit:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  //Función que se ejecutará cuando el user cierre el modal
  const handleCloseModal = () => {
    setModalVisible(false);
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setError("");
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={handleCloseModal}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? -80 : 20}
        className="flex-1 justify-center items-center bg-black/50"
      >
        <View className="bg-[#1e2a47] p-6 rounded-xl w-[85%] max-w-[500px] flex-col gap-4">
          <View className="flex-row justify-between items-center">
            <Text className="text-lg font-bold text-center color-white">
              Cambiar Contraseña
            </Text>
            <TouchableOpacity onPress={handleCloseModal}>
              <AntDesign name="close" color="white" size={28} />
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
          <View className="flex-col gap-4">
            <PasswordInputModal
              value={oldPassword}
              onChangeText={setOldPassword}
              placeholder="Contraseña Antigua"
              editable={!isSubmitting}
            />

            <PasswordInputModal
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="Nueva Contraseña"
              editable={!isSubmitting}
            />

            <PasswordInputModal
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirmar Nueva Contraseña"
              isConfirm={true} //Indicamos que es el input de confirmar contraseña para que no se pueda pegar texto en él
              editable={!isSubmitting}
            />
          </View>

          <View className="flex-row gap-4 justify-between items-center mt-4">
            <TouchableOpacity
              onPress={handleCloseModal}
              className="bg-[#6366ff] p-3 rounded-xl w-[45%]"
              disabled={isSubmitting}
              style={{ opacity: isSubmitting ? 0.5 : 1 }}
            >
              <Text className="font-semibold text-center text-white">
                Cancelar
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSubmit}
              className="bg-[#ff4757] p-3 rounded-xl w-[45%]"
              disabled={isSubmitting}
              style={{ opacity: isSubmitting ? 0.5 : 1 }}
            >
              <Text className="font-semibold text-center text-white">
                {isSubmitting ? "Cambiando..." : "Confirmar"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default ChangePasswordModal;
