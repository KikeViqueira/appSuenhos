import { StatusBar } from "react-native-web";
import { Text, View } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthContext } from "../context/AuthContext";
import { useEffect } from "react";

export default function App() {
  const { accessToken, userId, onboardingCompleted } = useAuthContext();

  useEffect(() => {
    // Si se han cargado los valores y son todos null, redirige a login
    if (
      accessToken === null &&
      userId === null &&
      onboardingCompleted === null
    ) {
      //Para evitar el error de "Attempted to navigate before mounting the Root Layout component", retrasa la navegación hasta después del primer render.
      setTimeout(() => {
        router.replace("./(Auth)/sign-in"); // Redirige a login
      }, 0);
      return;
    }

    if (accessToken && userId) {
      if (onboardingCompleted) {
        router.replace("./(tabs)/Stats"); // Redirige a la app principal
      } else {
        router.replace("./(Onboarding)/Onboarding"); // Redirige al onboarding
      }
    } else {
      router.replace("./(Auth)/sign-in"); // Redirige a login
    }
  }, [accessToken, userId, onboardingCompleted]);

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
