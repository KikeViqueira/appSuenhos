import { StatusBar } from "react-native-web";
import { Text, View } from "react-native";
import { Link } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Notifications from 'expo-notifications';
import { Platform } from "react-native";

//Configuración de notificaciones para que se muestren incluso cuando la app esté en primer plano
Notifications.setNotificationHandler({
    handleNotification: async () =>({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    }),
});

//Solicitar permisos para recibir notificaciones en IOS
async function requestNotificationPermissions() {
    const settings = await Notifications.getPermissionsAsync();
    //Si los permisos no han sido concedidos, los solicitamos
    if (!settings.granted){
        await Notifications.requestPermissionsAsync();
    }
}

if (Platform.OS === 'ios'){
    //Si estamos en un dispositivo IOS pedimos los permisos de la manera que hemos dicho antes
    requestNotificationPermissions();
}

export default function App(){
    return (
        <SafeAreaView className="flex items-center justify-center w-full h-full bg-primary">
            <Text className="text-3xl">Hello World</Text>
            <StatusBar style="auto" />
            <Link href="/Stats" className="text-red-500">Go to Stats</Link>
        </SafeAreaView>
    );
}


