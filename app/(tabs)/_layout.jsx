import { View, Text, Image } from "react-native";
import { Tabs, Redirect } from "expo-router";

import icons from "../../constants/icons";

const TabIcon = ({ icon, color, name, focused }) => {
  return (
    //Damos estilo a nuestros iconos del tab junto a sus correspondientes nombres
    <View className="flex items-center justify-center gap-1">
      <Image
        source={icon}
        resizeMode="contain"
        tintColor={color}
        className="w-6 h-6"
      />
      <Text
        className={`${focused ? "font-psemibold" : "font-pregular"} text-xs`}
        style={{ color: color }}
      >
        {name}
      </Text>
    </View>
  );
};

const Tabslayout = () => {
  return (
    <>
      <Tabs
        screenOptions={{
          //Ocultamos los nombres de los tabs que vienen por defecto
          tabBarShowLabel: false,
          //Establecemos los colores de las distintas personalizaciones de los tabs
          tabBarActiveTintColor: "#6366FF",
          tabBarInactiveTintColor: "#CDCDE0",
          //Establecemos ahora los colores de fondo de la caja que agrupa a los tabs
          tabBarStyle: {
            backgroundColor: "#323d4f",
            borderTopCWidth: 1,
            borderTopColor: "#1e2a47",
            height: 84,
          },
        }}
      >
        <Tabs.Screen
          name="Stats"
          options={{
            title: "Estadísticas de Sueño",
            //headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                icon={icons.barChart}
                color={color}
                name="Estadísticas"
                focused={focused}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="Alarm"
          options={{
            title: "Alarm",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                icon={icons.alarm}
                color={color}
                name="Alarm"
                focused={focused}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="Chat"
          options={{
            title: "Chat",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                icon={icons.chat}
                color={color}
                name="Chat"
                focused={focused}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="Tips"
          options={{
            title: "Tips",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                icon={icons.tips}
                color={color}
                name="Tips"
                focused={focused}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="Profile"
          options={{
            title: "Profile",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                icon={icons.profile}
                color={color}
                name="Profile"
                focused={focused}
              />
            ),
          }}
        />
      </Tabs>
    </>
  );
};

export default Tabslayout;
