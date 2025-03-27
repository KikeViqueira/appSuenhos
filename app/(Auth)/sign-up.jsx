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
import { Alert } from "react-native";
import { useAuthContext } from "../../context/AuthContext";

const signUp = () => {
  const { loading, error, registerUser } = useAuthContext();

  //Definimos un estado que guarda en un objeto los datos del formulario que representa al user
  const [form, setForm] = useState({
    email: "",
    name: "",
    password: "",
    confirmPassword: "",
  });

  //Definimos la función para mandar la respuesta a la base de datos
  const submit = () => {
    //Antes de nada tenemos que comprobar que tanto la contraseña como la confirmación de la contraseña sean iguales
    if (form.password === form.confirmPassword) {
      //Antes de guardar el user en la BD tenemos que pasar el correo a minúsculas para que en el login ponga lo que ponga mientras los caracteres sean los mismos pueda acceder
      form.email = form.email.toLowerCase();
      //llamamos a la función del hook de user para registrar al usuario
      registerUser(form);
      //reiniciamos el estado del formulario para que este vacío
      setForm({
        email: "",
        name: "",
        password: "",
        confirmPassword: "",
      });
      //Una vez que el user ha sido regsistrado lo redireccionamos a la pestaña de login
      router.push("./sign-in");
    } else {
      Alert.alert("Error de registro", "Las contraseñas no coinciden");
    }
  };

  return (
    <SafeAreaView className="flex items-center w-full h-full bg-primary">
      <View className="flex justify-around items-center h-[90%] w-[85%]">
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
            }}
            showsVerticalScrollIndicator={false}
          >
            {/*Cuerpo del formulario*/}
            <View className="flex flex-col justify-center w-full gap-6">
              <CustomInput
                name="Email"
                inputType={form.email}
                placeholder="Introduce tu email"
                handleChangeText={(e) => setForm({ ...form, email: e })}
              />

              <CustomInput
                name="Nombre"
                inputType={form.name}
                placeholder="Introduce tu nombre"
                handleChangeText={(e) => setForm({ ...form, name: e })}
              />

              <CustomInput
                name="Contraseña"
                inputType={form.password}
                placeholder="Introduce tu contraseña"
                handleChangeText={(e) => setForm({ ...form, password: e })}
              />

              <CustomInput
                name="Confirmar Contraseña"
                inputType={form.confirmPassword}
                placeholder="Confirma tu contraseña"
                handleChangeText={(e) =>
                  setForm({ ...form, confirmPassword: e })
                }
              />

              {/*Boton para iniciar sesión*/}
              <TouchableOpacity
                onPress={submit}
                className="flex w-full justify-center items-center flex-row gap-4 px-8 py-4 bg-[#323d4f] rounded-3xl mt-2"
              >
                <Text className="text-lg font-semibold color-white">
                  Registrarse
                </Text>
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
      </View>
    </SafeAreaView>
  );
};

export default signUp;
