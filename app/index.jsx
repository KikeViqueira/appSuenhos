import { StatusBar } from "react-native-web";
import { Text, View, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";

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

export default function App() {
  return (
    <SafeAreaView className="flex items-center bg-primary">
      <View className="flex gap-12 justify-center items-center w-full h-full">
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
        {/*Con esta ruta hacemos que rootLayout tenga el control del fujo de navegación*/}
        <TouchableOpacity
          onPress={() => router.push("./(tabs)/Stats")}
          className="flex flex-row items-center gap-4 px-8 py-4 bg-[#323d4f] rounded-3xl"
        >
          <Icon name="envelope" size={24} color="white" />
          <Text className="text-lg font-semibold color-white">
            Continuar con email
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
