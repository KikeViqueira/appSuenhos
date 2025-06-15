import { View, Text, TextInput, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import Icon from "react-native-vector-icons/FontAwesome";

//recibimos el título del input, el tipo de input, la función para guardar el valor en el componente padre y el placeHolder
const CustomInput = ({
  name,
  inputType,
  handleChangeText,
  placeholder,
  icon,
}) => {
  //hacemos un estado para saber si la contraseña se está mostrando en pantalla o no
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View className="flex flex-col items-start w-full gap-2 mb-4">
      <Text className="mb-1 ml-1 text-base font-medium color-white">
        {name}
      </Text>
      <View
        className={`w-full flex-row items-center ${
          isFocused ? "bg-[#ffffff]" : "bg-[#f5f5f5]"
        } rounded-xl px-4 py-3 shadow-sm`}
        style={{
          borderWidth: 1,
          borderColor: isFocused ? "#6366ff" : "transparent",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
          elevation: 2,
        }}
      >
        {icon && (
          <Icon
            name={icon}
            size={18}
            color={isFocused ? "#6366ff" : "#323d4f"}
            style={{ marginRight: 10, opacity: 0.7 }}
          />
        )}
        <TextInput
          value={inputType}
          placeholder={placeholder}
          onChangeText={handleChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          //Si el input es el de confirmar contraseña no permitimos que se pueda copiar y pegar texto
          contextMenuHidden={name === "Confirmar Contraseña"}
          //Si el input es un password y el estado de enseñar la contraseña está en false, ocultamos el texto
          secureTextEntry={
            (name === "Contraseña" || name === "Confirmar Contraseña") &&
            !showPassword
          }
          //Estilo del input dependiendo del tipo que sea
          className={`flex-1 text-base text-[#323d4f] ${
            name === "Contraseña" || name === "Confirmar Contraseña"
              ? "pr-10"
              : ""
          }`}
          placeholderTextColor="#9ca3af"
          //Configuración para permitir que el gestor de contraseñas funcione correctamente
          autoComplete={
            name === "Email"
              ? "email"
              : name === "Contraseña"
              ? "password"
              : name === "Confirmar Contraseña"
              ? "password-new"
              : "name"
          }
          textContentType={
            name === "Email"
              ? "emailAddress"
              : name === "Contraseña"
              ? "password"
              : name === "Confirmar Contraseña"
              ? "newPassword"
              : name === "Nombre"
              ? "name"
              : undefined
          }
          //Añadimos el tipo de teclado y que se escriba en minusculas si es el de email
          keyboardType={name === "Email" ? "email-address" : "default"}
          autoCapitalize={name === "Email" ? "none" : "sentences"}
          style={{ minHeight: 26 }} // Aumentamos ligeramente la altura mínima para mejor usabilidad
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
              size={18}
              color={isFocused ? "#6366ff" : "#323d4f"}
              style={{ opacity: 0.7 }}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default CustomInput;
