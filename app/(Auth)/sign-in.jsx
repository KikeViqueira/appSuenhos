import { View, Text, SafeAreaView, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import CustomInput from "../../components/CustomInput";
import Icon from "react-native-vector-icons/FontAwesome";

const signIn = () => {
  //Definimos un estado para saber los valores que el usuario introduce en los campos del formulario
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  //Definimos la función para mandar la respuesta a la base de datos
  const submit = () => {};

  return (
    <SafeAreaView>
      <Text>Inicia sesión en appSueños</Text>
      <CustomInput
        name="email"
        inputType={form.email}
        placeholder="Introduce tu email"
        //Dejamos todo como antes y solo cambiamos de valor el atributo que queramos
        handleChangeText={(e) => setForm({ ...form, email: e })}
      />
      <CustomInput
        name="password"
        inputType={form.password}
        placeholder="Introduce tu contraseña"
        //Dejamos todo como antes y solo cambiamos de valor el atributo que queramos
        handleChangeText={(e) => setForm({ ...form, password: e })}
      />

      <TouchableOpacity
        onPress={submit}
        className="flex flex-row items-center gap-4 px-8 py-4 bg-[#323d4f] rounded-3xl"
      >
        <Text className="text-lg text-center color-white">Iniciar Sesión</Text>
        <Icon name="check-circle" size={24} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default signIn;
