import { StatusBar } from "react-native-web";
import { Text, View } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthContext } from "../context/AuthContext";
import { useEffect } from "react";

export default function App() {
  const { accessToken, userId, onboardingCompleted, isAuthLoading } =
    useAuthContext();

  useEffect(() => {
    //Si se está cargando el auth, no se hace nada, cuando cargue y el valor de los estados esten bien actualizados se redirige a donde corresponda.
    if (isAuthLoading) return;
    if (accessToken && userId) {
      if (onboardingCompleted) {
        router.replace("./(tabs)/Stats"); // Redirige a la app principal
      } else {
        router.replace("./(Onboarding)/Onboarding"); // Redirige al onboarding
      }
    } else {
      //Para evitar el error de "Attempted to navigate before mounting the Root Layout component",se retrasa la navegación hasta después del primer render.
      setTimeout(() => {
        router.replace("./(Auth)/sign-in"); // Redirige a login
      }, 0);
    }
  }, [accessToken, userId, onboardingCompleted, isAuthLoading]);

  return (
    <SafeAreaView className="flex items-center bg-primary">
      <View className="flex items-center justify-center w-full h-full gap-12">
        <View className="w-[90%] items-center">
          <Text className="text-4xl color-[#6366ff] font-extrabold">
            Bienvenido a ZzzTime
          </Text>
        </View>
        <View className="w-[80%]">
          <Text className="text-lg italic text-center color-white">
            El sueño es el mejor remedio para el cansancio del alma. 🚀
          </Text>
        </View>
        <StatusBar style="auto" />
      </View>
    </SafeAreaView>
  );
}
