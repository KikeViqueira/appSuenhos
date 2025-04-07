import { StyleSheet, Text, View, StatusBar, AppState } from "react-native";
import React, { useEffect, useState } from "react";
import { SplashScreen, Stack } from "expo-router";
import { useFonts } from "expo-font";
import "../global.css";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { AuthProvider, useAuthContext } from "../context/AuthContext";

//Configuración de notificaciones para que se muestren incluso cuando la app esté en primer plano
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

//Solicitar permisos para recibir notificaciones en IOS
async function requestNotificationPermissions() {
  const settings = await Notifications.getPermissionsAsync();
  //Si los permisos no han sido concedidos, los solicitamos
  if (!settings.granted) {
    await Notifications.requestPermissionsAsync();
  }
}

if (Platform.OS === "ios") {
  //Si estamos en un dispositivo IOS pedimos los permisos de la manera que hemos dicho antes
  requestNotificationPermissions();
}

// Indicamos que la pantalla de carga inicial no se oculte automáticamente
SplashScreen.preventAutoHideAsync();

const RootLayout = () => {
  /*
   * Como queremos usar el context pero para eso necesitamos un componente dentro del provider, lo que hacemos es
   * un componente hijo que englobe lo que queremos reenderizar usando la lógica del context
   */

  const InnerRootLayout = () => {
    // Ahora el hook se usa dentro del AuthProvider
    const { userId, accessToken, onboardingCompleted, isAuthLoading } =
      useAuthContext();

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
      //Aseguramos que la pantalla de carga inicial se oculte cuando las fuentes estén cargadas y la info del user igual, y no haya errores
      if (error) throw error;
      if (fontsLoaded && !isAuthLoading) {
        SplashScreen.hideAsync();
      }
    }, [fontsLoaded, error, isAuthLoading]);

    //En el useEffect sin dependencias introducimos la lógica deponer el statusbar de nuevo a blanco si el user ha salido de la app y esta pasa a segundo plano
    //Como la lógica de ponerla blanca nada más entrar en la app
    useEffect(() => {
      // Configura el StatusBar inicialmente
      StatusBar.setBarStyle("light-content");
      if (Platform.OS === "android") {
        StatusBar.setBackgroundColor("black");
      }

      // Listener para reconfigurar el StatusBar cuando la app vuelva a estar activa
      const subscription = AppState.addEventListener(
        "change",
        (nextAppState) => {
          if (nextAppState === "active") {
            StatusBar.setBarStyle("light-content");
            if (Platform.OS === "android") {
              StatusBar.setBackgroundColor("black");
            }
          }
        }
      );

      return () => subscription.remove();
    }, []);

    // Mientras se cargan las fuentes o se verifica la autenticación, no renderizamos nada (o mostramos un Loading)
    if (!fontsLoaded && isAuthLoading) return null;

    return (
      <>
        <StatusBar backgroundColor="black" barStyle="light-content" />
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
      </>
    );
  };

  return (
    <AuthProvider>
      <InnerRootLayout />
    </AuthProvider>
  );
};

export default RootLayout;
