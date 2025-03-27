import { StatusBar } from "react-native-web";
import { Text, View } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthContext } from "../context/AuthContext";
import { useEffect } from "react";

export default function App() {
  const { accessToken, userId, onboardingCompleted } = useAuthContext();

  useEffect(() => {
    // Si aún no se han determinado los valores, no se hace nada (puedes mostrar un loader)
    if (accessToken === null && userId === null && onboardingCompleted === null)
      return;

    if (accessToken && userId) {
      if (onboardingCompleted) {
        router.replace("./(tabs)/Stats"); // Redirige a la app principal
      } else {
        router.replace("./(Onboarding)/Onboarding"); // Redirige al onboarding
      }
    } else {
      router.replace("./(Auth)"); // Redirige a login
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
