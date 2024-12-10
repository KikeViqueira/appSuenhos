import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  Image,
} from "react-native";
import React, { useState } from "react";
import { router } from "expo-router";
import CustomInput from "../../components/CustomInput";

const signIn = () => {
  //Definimos un estado para saber los valores que el usuario introduce en los campos del formulario
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  //Definimos la función para mandar la respuesta a la base de datos
  const submit = () => {};

  return (
    <SafeAreaView className="flex items-center w-full h-full bg-primary">
      <View className="flex justify-around items-center h-[90%] w-[85%]">
        <Image
          //usamos require() para importar la imagen correctamente
          source={require("../../assets/images/Logo.png")}
          className="self-center w-40 h-40"
          resizeMode="contain"
        />

        {/*Cuerpo del formulario*/}
        <View className="flex flex-col gap-12 justify-center w-full">
          <Text className="font-bold color-[#6366ff]" style={{ fontSize: 24 }}>
            Inicia sesión en Zzztime
          </Text>

          <CustomInput
            name="Email"
            inputType={form.email}
            placeholder="Introduce tu email"
            //Dejamos todo como antes y solo cambiamos de valor el atributo que queramos
            handleChangeText={(e) => setForm({ ...form, email: e })}
          />

          <CustomInput
            name="Contraseña"
            inputType={form.password}
            placeholder="Introduce tu contraseña"
            //Dejamos todo como antes y solo cambiamos de valor el atributo que queramos
            handleChangeText={(e) => setForm({ ...form, password: e })}
          />
        </View>

        {/*Boton para iniciar sesión o ir a la pantalla de registro*/}
        <View className="flex flex-col gap-6 items-center w-full">
          <TouchableOpacity
            onPress={submit}
            className="flex w-[80%] justify-center flex-row items-center gap-4 px-8 py-4 bg-[#323d4f] rounded-3xl"
          >
            <Text className="text-lg font-semibold color-white">
              Iniciar Sesión
            </Text>
          </TouchableOpacity>
          {/*Info por si el usuario no tiene una cuenta*/}
          <View className="flex flex-row gap-2">
            <Text className="text-lg text-center color-white">
              No tienes cuenta?
            </Text>
            <Text
              onPress={() => router.push("./(Auth)/sign-up")}
              className="text-lg font-semibold text-center color-[#6366ff]"
            >
              Regístrate aquí
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default signIn;
