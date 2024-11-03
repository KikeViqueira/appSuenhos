import { StatusBar } from "react-native-web";
import { Text, View } from "react-native";
import { Link } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function App(){
    return (
        <SafeAreaView className="flex items-center justify-center w-full h-full bg-primary">
            <Text className="text-3xl">Hello World</Text>
            <StatusBar style="auto" />
            <Link href="/Stats" className="text-red-500">Go to Stats</Link>
        </SafeAreaView>
    );
}


