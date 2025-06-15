import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import React, { useState } from "react";
import { router } from "expo-router";
import CustomInput from "../../components/CustomInput";
import { useAuthContext } from "../../context/AuthContext";
import Icon from "react-native-vector-icons/FontAwesome";
import AuthModal from "../../components/AuthModal";

const signUp = () => {
  const {
    loading,
    error,
    registerUser,
    modalVisible,
    modalType,
    hideModal,
    showModal,
  } = useAuthContext();

  //Definimos un estado que guarda en un objeto los datos del formulario que representa al user
  const [form, setForm] = useState({
    email: "",
    name: "",
    password: "",
    confirmPassword: "",
  });

  // Función para validar el formato del email
  const validateEmailFormat = (email) => {
    // Regex más completa para validar emails
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    // Validaciones adicionales
    if (!email || email.trim() === "") return false;
    if (email.includes(" ")) return false; // No puede tener espacios
    if (!email.includes("@")) return false; // Debe tener @
    if (email.indexOf("@") !== email.lastIndexOf("@")) return false; // Solo un @
    if (email.startsWith("@") || email.endsWith("@")) return false; // @ no puede estar al inicio o final
    if (email.includes("..")) return false; // No puede tener puntos consecutivos

    return emailRegex.test(email);
  };

  //Definimos la función para mandar la respuesta a la base de datos
  const submit = async () => {
    // Validar formato del email antes de enviar
    if (!validateEmailFormat(form.email)) {
      showModal("invalidEmailFormat");
      return;
    }

    //Antes de nada tenemos que comprobar que tanto la contraseña como la confirmación de la contraseña sean iguales
    if (form.password !== form.confirmPassword) {
      showModal("passwordMismatch");
      return;
    }

    //Antes de guardar el user en la BD tenemos que pasar el correo a minúsculas para que en el login ponga lo que ponga mientras los caracteres sean los mismos pueda acceder
    const userData = {
      ...form,
      email: form.email.toLowerCase(),
    };

    //llamamos a la función del hook de user para registrar al usuario
    const result = await registerUser(userData);

    if (result.success) {
      //reiniciamos el estado del formulario para que este vacío
      setForm({
        email: "",
        name: "",
        password: "",
        confirmPassword: "",
      });
    }
  };

  // Función para manejar el cierre del modal
  const handleModalClose = (action) => {
    //Si al cerrar el modal que se abra en la pestaña de registro manda la action de navigateToSignIn, se navega a sign-in
    if (action === "navigateToSignIn") {
      router.push("./sign-in");
    }
    //Ocultamos el modal
    hideModal();
  };

  return (
    <SafeAreaView className="flex items-center w-full h-full bg-primary">
      <View className="flex justify-around items-center h-[90%] w-[90%]">
        <Image
          //usamos require() para importar la imagen correctamente
          source={require("../../assets/images/Logo.png")}
          className="self-center w-40 h-40"
          resizeMode="contain"
        />
        <Text
          className="font-bold color-[#6366ff] mb-6 self-start"
          style={{ fontSize: 24 }}
        >
          Regístrate en Zzztime
        </Text>

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={50}
          style={{
            width: "100%",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: "center",
              paddingVertical: 20,
            }}
            showsVerticalScrollIndicator={false}
          >
            {/*Cuerpo del formulario*/}
            <View className="flex flex-col justify-center w-full gap-3">
              <CustomInput
                name="Email"
                inputType={form.email}
                placeholder="Introduce tu email"
                icon="envelope"
                handleChangeText={(e) => setForm({ ...form, email: e })}
              />

              <CustomInput
                name="Nombre"
                inputType={form.name}
                placeholder="Introduce tu nombre"
                icon="user"
                handleChangeText={(e) => setForm({ ...form, name: e })}
              />

              <CustomInput
                name="Contraseña"
                inputType={form.password}
                placeholder="Introduce tu contraseña"
                icon="lock"
                handleChangeText={(e) => setForm({ ...form, password: e })}
              />

              <CustomInput
                name="Confirmar Contraseña"
                inputType={form.confirmPassword}
                placeholder="Confirma tu contraseña"
                icon="shield"
                handleChangeText={(e) =>
                  setForm({ ...form, confirmPassword: e })
                }
              />

              {/*Boton para registrarse*/}
              <TouchableOpacity
                onPress={submit}
                className="flex w-full justify-center items-center flex-row gap-4 px-8 py-4 bg-[#6366ff] rounded-2xl shadow-md mt-4"
                style={{
                  shadowColor: "#6366ff",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 5,
                  elevation: 5,
                }}
              >
                <Text className="text-lg font-semibold color-white">
                  Crear cuenta
                </Text>
                <Icon name="user-plus" size={18} color="#ffffff" />
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

        {/*Info por si el usuario ya tiene una cuenta*/}
        <View className="flex flex-row gap-2 mt-4">
          <Text className="text-lg text-center color-white">
            ¿Ya tienes cuenta?
          </Text>
          <Text
            onPress={() => router.push("./sign-in")}
            className="text-lg font-semibold text-center color-[#6366ff]"
          >
            Inicia sesión
          </Text>
        </View>

        {/* Modal de autenticación */}
        <AuthModal
          visible={modalVisible}
          onClose={handleModalClose}
          type={modalType}
        />
      </View>
    </SafeAreaView>
  );
};

export default signUp;
