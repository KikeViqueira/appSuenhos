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

const ChangeEmailModal = ({
  visible, //Variable que viene del perfil para saber cuando el modal se tiene que ver o no
  setModalVisible, //Función que viene del perfil para cambiar el estado de la variable visible
  currentEmail, //TODO: email actual (obtenida, por ejemplo, de la BD o del contexto)
  changeEmail, //TODO: función que actualiza el email en la BD
  logOut, // función para cerrar sesión (ya que se usará JWT)
}) => {
  //Estados para almacenar la respuesta del user
  const [newEmail, setNewEmail] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    // Validamos que el nuevo correo sea diferente al antiguo
    if (oldEmail === newEmail) {
      setError("El nuevo correo debe ser distinto al antiguo.");
      return;
    }
    // Si todo es válido, actualizamos el correo usando la función changeEmail que contiene el endpoint de la api que se encarga de esta lógica
    changeEmail(newEmail);
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
              Cambiar Email
            </Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <X size={28} color="white" />
            </TouchableOpacity>
          </View>

          <Text className="text-center text-white">
            Al confirmar, tu correo electrónico se actualizará y se cerrará tu
            sesión para que vuelvas a iniciarla con el nuevo.
          </Text>

          {error ? (
            <Text className="text-center text-red-500">{error}</Text>
          ) : null}

          {/*Tenemos que meter todos los campos del modal en el que se puedan escribir dentro de un KeyboardAvoidingView */}
          <KeyboardAvoidingView className="flex-col gap-4">
            <TextInput
              placeholder="Introduce tu nuevo correo"
              placeholderTextColor="#A0AEC0"
              value={newEmail}
              onChangeText={setNewEmail}
              className="bg-[#1e2a47] border border-gray-500 rounded-xl p-2 text-white"
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

export default ChangeEmailModal;
