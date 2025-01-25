import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import React, { useState } from "react";
import { router } from "expo-router";
import CustomInput from "../../components/CustomInput";

const signUp = () => {
  //Definimos un estado para saber los valores que el usuario introduce en los campos del formulario
  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  //Definimos la función para mandar la respuesta a la base de datos
  const submit = () => {
    //hacer logica de contraseñas para ver si ambas son la misma y el user ha escrito bien todo
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

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{
            width: "100%",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          {/*Cuerpo del formulario*/}
          <View className="flex flex-col gap-6 justify-center w-full">
            <Text
              className="font-bold color-[#6366ff]"
              style={{ fontSize: 24 }}
            >
              Regístrate en Zzztime
            </Text>

            <CustomInput
              name="Email"
              inputType={form.email}
              placeholder="Introduce tu email"
              handleChangeText={(e) => setForm({ ...form, email: e })}
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
              handleChangeText={(e) => setForm({ ...form, confirmPassword: e })}
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
