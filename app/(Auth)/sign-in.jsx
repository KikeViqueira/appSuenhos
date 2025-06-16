import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import React, { useEffect, useState } from "react";
import { router } from "expo-router";
import CustomInput from "../../components/CustomInput";
import { useAuthContext } from "../../context/AuthContext";
import Icon from "react-native-vector-icons/FontAwesome";
import AuthModal from "../../components/AuthModal";

const signIn = () => {
  //Recuperamos las funciones y estados del hook de useAuth
  const {
    accessToken,
    error,
    LoginRequest,
    onboardingCompleted,
    modalVisible,
    modalType,
    hideModal,
  } = useAuthContext();

  //Definimos un estado para saber los valores que el usuario introduce en los campos del formulario
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  //Definimos la función para mandar la respuesta a la base de datos
  const submit = async () => {
    /*
     * antes de realizar la comparación tenemos que hacer que lo que haya introducido el user en campo de email no sea sensible a mayúsculas o minúsculas
     */
    const emailLower = form.email.toLowerCase();

    //llamamos al endpoint de nuestra api para hacer el login y en caso de que sea correcto obtener el token para autenticar al user en el resto de endpoints
    //Esperamos a una respuesta de la función LoginRequest ya que es una función asíncrona y asi no pasamos a la siguiente línea de código hasta que no se haya resuelto la promesa
    await LoginRequest(emailLower, form.password);
  };

  useEffect(() => {
    /*
     * incluso con await, el estado token puede no actualizarse inmediatamente porque React agrupa las actualizaciones de estado.
     * Por lo tanto, no podemos confiar en el valor de token inmediatamente después de llamar a LoginRequest.
     * En su lugar, debemos usar el efecto de cambio de token para navegar a la siguiente pantalla.
     *
     * IMPORTANTE: Solo navegamos cuando tenemos tanto el accessToken como el estado de onboardingCompleted definido (no null)
     */
    if (accessToken && onboardingCompleted !== null) {
      // Limpiar el formulario inmediatamente cuando se obtiene el token
      setForm({ email: "", password: "" });

      console.log("--------------------------------");
      console.log("onboardingCompleted: ", onboardingCompleted);
      console.log("accessToken: ", accessToken);

      // Pequeño delay para asegurar que todos los estados estén sincronizados
      setTimeout(() => {
        if (onboardingCompleted) {
          router.replace("/Stats"); // Si ya completó onboarding, vamos a la pantalla principal
          console.log("Redirigiendo a Stats - Onboarding completado");
        } else {
          router.replace("/(Onboarding)/Onboarding"); // Sino, vamos al onboarding
          console.log("Redirigiendo a Onboarding - Onboarding pendiente");
        }
      }, 100); // Delay mínimo para evitar condiciones de carrera
    }
  }, [accessToken, onboardingCompleted]);

  // Función para manejar el cierre del modal, en el caso de login como solo se dispara i ha insertado mal el email o la contraseña, lo que hace la función es simplemente cerrar el modal
  const handleModalClose = (action) => {
    hideModal();
    // Limpiar el formulario después de un error para evitar que el gestor de contraseñas intente guardar credenciales incorrectas
    setForm({ email: "", password: "" });
  };

  return (
    <SafeAreaView className="flex items-center w-full h-full bg-primary">
      <View className="flex justify-start items-center h-[90%] w-[85%]">
        <Image
          source={require("../../assets/images/Logo.png")}
          className="self-center w-32 h-32 mt-8"
          resizeMode="contain"
          style={{ opacity: 0.9 }}
        />

        <Text
          className="font-bold color-[#6366ff] mt-12 mb-12  self-start"
          style={{ fontSize: 24 }}
        >
          Inicia sesión en Zzztime
        </Text>

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="min-h-[220px]"
        >
          {/*Cuerpo del formulario*/}
          <View className="flex flex-col items-start justify-center w-full gap-3">
            <CustomInput
              name="Email"
              inputType={form.email}
              placeholder="Introduce tu email"
              icon="envelope"
              //Dejamos todo como antes y solo cambiamos de valor el atributo que queramos
              handleChangeText={(e) => setForm({ ...form, email: e })}
            />

            <CustomInput
              name="Contraseña"
              inputType={form.password}
              placeholder="Introduce tu contraseña"
              icon="lock"
              //Dejamos todo como antes y solo cambiamos de valor el atributo que queramos
              handleChangeText={(e) => setForm({ ...form, password: e })}
            />
          </View>
        </KeyboardAvoidingView>

        {/*Boton para iniciar sesión o ir a la pantalla de registro*/}
        <View className="flex flex-col items-center w-full gap-6 mt-8">
          <TouchableOpacity
            onPress={submit}
            className="flex w-full justify-center items-center flex-row gap-4 px-8 py-4 bg-[#6366ff] rounded-2xl "
            style={{
              shadowColor: "#6366ff",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 5,
              elevation: 5,
            }}
          >
            <Text className="text-lg font-semibold color-white">
              Iniciar Sesión
            </Text>
            <Icon name="arrow-right" size={18} color="#ffffff" />
          </TouchableOpacity>

          {/*Info por si el usuario no tiene una cuenta*/}
          <View className="flex flex-row gap-2">
            <Text className="text-lg text-center color-white">
              No tienes cuenta?
            </Text>
            <Text
              onPress={() => router.push("./sign-up")}
              className="text-lg font-semibold text-center color-[#6366ff]"
            >
              Regístrate aquí
            </Text>
          </View>
        </View>
      </View>

      {/* Modal de autenticación */}
      <AuthModal
        visible={modalVisible}
        onClose={handleModalClose}
        type={modalType}
      />
    </SafeAreaView>
  );
};

export default signIn;
