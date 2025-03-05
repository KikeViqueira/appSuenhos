import { View, Text, TextInput, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react-native";

const PasswordInputModal = ({ value, onChangeText, placeholder }) => {
  //Definimos el estado para saber si tenemos que mostrar lo que está escribiendo el user o no
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View className="flex-row items-center w-full">
      <TextInput
        placeholder={placeholder}
        placeholderTextColor="#A0AEC0"
        secureTextEntry={!showPassword} //No mostramos el texto de la contraseña cuando el estado es false
        value={value}
        onChangeText={onChangeText}
        className="bg-[#1e2a47] border w-full border-gray-500 rounded-xl p-2 text-white"
      />

      <TouchableOpacity
        onPress={() => setShowPassword(!showPassword)}
        className="absolute right-4"
      >
        {/*Dependiendo del estado de la variable para saber si enseñamos la contraseña o no, tenemos que mostrar un icono u otro */}
        {showPassword ? (
          <Eye size={20} color="white" />
        ) : (
          <EyeOff size={20} color="white" />
        )}
      </TouchableOpacity>
    </View>
  );
};

export default PasswordInputModal;
