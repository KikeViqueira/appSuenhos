import { StyleSheet, Text, View, StatusBar } from "react-native";
import React, { useEffect, useState } from "react";
import { SplashScreen, Stack } from "expo-router";
import { useFonts } from "expo-font";
import "../global.css";
import { AuthProvider, useAuthContext } from "../context/AuthContext";

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

  useEffect(() => {
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

  /*
   * Como queremos usar el context pero para eso necesitamos un componente dentro del provider, lo que hacemos es
   * un componente hijo que englobe lo que queremos reenderizar usando la lógica del context
   */

  const InnerRootLayout = () => {
    // Ahora el hook se usa dentro del AuthProvider
    const { userId, accessToken, onboardingCompleted } = useAuthContext();

    return (
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "fade", // Transición suave entre pantallas
        }}
      >
        {accessToken && userId ? (
          onboardingCompleted ? (
            <Stack.Screen
              name="(tabs)"
              options={{
                headerShown: false,
                gestureEnabled: false, // Desactivamos el gesto de retroceso
              }}
            />
          ) : (
            <Stack.Screen
              name="(Onboarding)/Onboarding"
              options={{ headerShown: false }}
            />
          )
        ) : (
          <Stack.Screen
            name="(Auth)"
            options={{
              headerShown: false,
              gestureEnabled: false,
            }}
          />
        )}
      </Stack>
    );
  };

  return (
    <AuthProvider>
      <InnerRootLayout />
    </AuthProvider>
  );
};

export default RootLayout;
