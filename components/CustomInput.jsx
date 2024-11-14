import { View, Text, TextInput, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import { validatePathConfig } from "expo-router/build/fork/getPathFromState-forks";
import Icon from "react-native-vector-icons/FontAwesome";

//recibimos el título del input, el tipo de input, la función para guardar el valor en el componente padre y el placeHolder
const CustomInput = ({ name, inputType, handleChangeText, placeholder }) => {
  //Hacemos un estado para saber si el Input es el password o no, en caso de que lo sea tenemos que ocultarla por seguridad del user
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View>
      <Text>{name}</Text>
      <View className="w-full bg-black">
        <TextInput
          value={inputType}
          placeholder={placeholder}
          onChangeText={handleChangeText}
          secureTextEntry={name === "password" && !showPassword}
        />

        {/*Si estamos en el input del dorm que es una contraseña ponemos un botón que simula un ojo para ver la contraseña o taparla*/}
        {name === "password" && (
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Icon name="eye" size={24} color="white" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default CustomInput;
