import { StatusBar } from "react-native-web";
import { Text, View, Image } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthContext } from "../context/AuthContext";
import { useEffect } from "react";

export default function App() {
  const {
    accessToken,
    userId,
    onboardingCompleted,
    isAuthLoading,
    isFlagsLoading,
  } = useAuthContext();

  useEffect(() => {
    //Si se está cargando el auth o las flags, no se hace nada, cuando cargue y el valor de los estados esten bien actualizados se redirige a donde corresponda.
    if (isAuthLoading || isFlagsLoading) return;

    if (accessToken && userId) {
      // Si tenemos tokens pero onboardingCompleted es null, significa que getUserFlags aún no se ha ejecutado
      // En este caso, esperamos a que se complete la sincronización
      if (onboardingCompleted === null) {
        return;
      }

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
    //router.replace("./(Auth)/sign-in");
  }, [accessToken, userId, onboardingCompleted, isAuthLoading, isFlagsLoading]);

  return (
    <SafeAreaView className="flex-1 bg-primary">
      <View className="overflow-hidden relative flex-1">
        {/* Gradient Background */}
        <View className="absolute inset-0 bg-gradient-to-br from-[#1e2a47] via-[#2a3f5f] to-[#1e2a47]" />

        {/* Decorative Elements */}
        <View className="absolute top-20 right-10 w-32 h-32 rounded-full bg-[#6366ff] opacity-10" />
        <View className="absolute top-40 left-5 w-20 h-20 rounded-full bg-[#6366ff] opacity-5" />
        <View className="absolute bottom-32 right-20 w-24 h-24 rounded-full bg-[#6366ff] opacity-10" />

        {/* Main Content */}
        <View className="flex-1 justify-center items-center px-8">
          {/* Logo/Brand Section */}
          <View className="items-center mb-12">
            <View className="justify-center items-center mb-6">
              <Image
                source={require("../assets/images/Logo.png")}
                className="w-28 h-28"
                resizeMode="contain"
                style={{
                  opacity: 0.95,
                  shadowColor: "#6366ff",
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.3,
                  shadowRadius: 12,
                  elevation: 8,
                }}
              />
            </View>
            <Text className="mb-2 text-5xl font-black text-center text-white">
              Zzz<Text className="text-[#6366ff]">Time</Text>
            </Text>
            <View className="w-16 h-1 bg-[#6366ff] rounded-full" />
          </View>

          {/* Welcome Message */}
          <View className="items-center mb-12">
            <Text className="mb-3 text-2xl font-bold text-center text-white">
              Bienvenido a tu
            </Text>
            <Text className="text-3xl font-extrabold text-[#6366ff] text-center">
              Compañero de Sueños
            </Text>
          </View>

          {/* Feature Highlights */}
          <View className="flex gap-6 mb-12 w-full max-w-sm">
            <View className="flex-row items-center p-4 rounded-2xl backdrop-blur-sm bg-white/5">
              <View className="w-12 h-12 rounded-full bg-[#6366ff]/20 items-center justify-center mr-4">
                <Text className="text-xl">📊</Text>
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold text-white">
                  Análisis de Sueño
                </Text>
                <Text className="text-sm text-white/70">
                  Monitorea tus patrones
                </Text>
              </View>
            </View>

            <View className="flex-row items-center p-4 rounded-2xl backdrop-blur-sm bg-white/5">
              <View className="w-12 h-12 rounded-full bg-[#6366ff]/20 items-center justify-center mr-4">
                <Text className="text-xl">📝</Text>
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold text-white">
                  Chat Diario
                </Text>
                <Text className="text-sm text-white/70">
                  Tu diario personal interactivo
                </Text>
              </View>
            </View>

            <View className="flex-row items-center p-4 rounded-2xl backdrop-blur-sm bg-white/5">
              <View className="w-12 h-12 rounded-full bg-[#6366ff]/20 items-center justify-center mr-4">
                <Text className="text-xl">💡</Text>
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold text-white">
                  Tips Personalizados
                </Text>
                <Text className="text-sm text-white/70">
                  Consejos adaptados a ti
                </Text>
              </View>
            </View>
          </View>

          {/* Inspirational Quote */}
          <View className="items-center px-6">
            <Text className="text-lg italic leading-relaxed text-center text-white/80">
              "El sueño es el mejor remedio para{"\n"}el cansancio del alma"
            </Text>
            <View className="flex-row items-center mt-4">
              <View className="w-8 h-0.5 bg-[#6366ff]/50" />
              <Text className="mx-3 text-2xl">✨</Text>
              <View className="w-8 h-0.5 bg-[#6366ff]/50" />
            </View>
          </View>
        </View>

        {/* Bottom Decoration */}
        <View className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#6366ff] to-transparent" />

        <StatusBar style="light" />
      </View>
    </SafeAreaView>
  );
}
