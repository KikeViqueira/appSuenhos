import { StyleSheet, Text, View, StatusBar } from "react-native";
import React, { useEffect, useState } from "react";
import { SplashScreen, Stack } from "expo-router";
import { useFonts } from "expo-font";
import "../global.css";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Indicamos que la pantalla de carga inicial no se oculte automáticamente
SplashScreen.preventAutoHideAsync();

const RootLayout = () => {
  const [fontsLoaded, error] = useFonts({
    "Poppins-Black": require("../assets/fonts/Poppins-Black.ttf"),
    "Poppins-Bold": require("../assets/fonts/Poppins-Bold.ttf"),
    "Poppins-ExtraBold": require("../assets/fonts/Poppins-ExtraBold.ttf"),
    "Poppins-ExtraLight": require("../assets/fonts/Poppins-ExtraLight.ttf"),
    "Poppins-Light": require("../assets/fonts/Poppins-Light.ttf"),
    "Poppins-Medium": require("../assets/fonts/Poppins-Medium.ttf"),
    "Poppins-Regular": require("../assets/fonts/Poppins-Regular.ttf"),
    "Poppins-SemiBold": require("../assets/fonts/Poppins-SemiBold.ttf"),
    "Poppins-Thin": require("../assets/fonts/Poppins-Thin.ttf"),
  });

  //Estado para saber si el usuario ha respondido a las preguntas de Onboarding
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  useEffect(() => {
    //Cargamos el valor de hasCompletedOnboarding desde AsyncStorage, cuando iniciamos la aplicación
    const loadOnboardingStatus = async () => {
      const storedStatus = await AsyncStorage.getItem("hasCompletedOnboarding");
      setHasCompletedOnboarding(storedStatus === "true"); //Si la comprobación es correcta, se establece el estado de hasCompletedOnboarding a true
    };

    loadOnboardingStatus();

    //Aseguramos que la pantalla de carga inicial se oculte cuando las fuentes estén cargadas y no haya errores
    if (error) throw error;
    if (fontsLoaded) {
      SplashScreen.hideAsync();
      //ponemos el color de status bar a claro
      StatusBar.setBarStyle("light-content");
    }
  }, [fontsLoaded, error]);
  //Se llama cada vez que las fuentes cargadas cambian o hay un error

  //En el caso de que no haaya errores y las fuentes no estén cargadas, no renderizamos nada y sigue mostrándose la pantalla de carga sin mostrar errores a los usuarios
  if (!fontsLoaded && !error) return null;

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "fade", //Smooth transition between screens
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        {!hasCompletedOnboarding ? (
          <Stack.Screen
            name="(Onboarding)/Onboarding"
            options={{ headerShown: false }}
          />
        ) : (
          <Stack.Screen
            name="(tabs)"
            options={{
              headerShown: false,
              gestureEnabled: false, //Desactivamos el gesto de arrastre hacia atras (back gesture)
            }}
          />
        )}
        <Stack.Screen
          name="(Auth)"
          options={{ headerShown: false, gestureEnabled: false }}
        />
        <Stack.Screen name="TipDetail" options={{ headerShown: false }} />
      </Stack>
    </>
  );
};

export default RootLayout;
