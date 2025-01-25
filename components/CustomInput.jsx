import { View, Text, TextInput, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import Icon from "react-native-vector-icons/FontAwesome";

//recibimos el título del input, el tipo de input, la función para guardar el valor en el componente padre y el placeHolder
const CustomInput = ({ name, inputType, handleChangeText, placeholder }) => {
  //hacemos un estado para saber si la contraseña se está mostrando en pantalla o no
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View className="flex flex-col gap-2 items-start mb-4 w-full">
      <Text className="text-lg text-center color-white">{name}</Text>
      <View className="w-full flex-row items-center bg-[#f5f5f5] rounded-xl px-4 py-3">
        <TextInput
          value={inputType}
          placeholder={placeholder}
          onChangeText={handleChangeText}
          //Si el input es un password y el estado de enseñar la contraseña está en false, ocultamos el texto
          secureTextEntry={name === "Contraseña" && !showPassword}
          //Estilo del input dependiendo del tipo que sea
          className={`flex-1 text-base color-[#323d4f] ${
            name === "PasswoContraseñard" ? "pr-10" : ""
          }`}
          placeholderTextColor="#9ca3af"
          style={{ height: 24 }}
        />

        {/*Si estamos en el input del form que es una contraseña ponemos un botón que simula un ojo para ver la contraseña o taparla*/}
        {(name === "Contraseña" || name === "Confirmar Contraseña") && (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            className="absolute right-4"
          >
            <Icon
              //Dependiendo del valor del estado de la contraseña mostramos un icono u otro
              name={showPassword ? "eye" : "eye-slash"}
              size={20}
              color="#323d4f"
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default CustomInput;
