import { Text, Animated, View } from "react-native";
import { Tabs } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Entypo, Feather } from "@expo/vector-icons";
import React, { useRef, useEffect } from "react";

const TabIcon = ({ icon: IconName = "help-circle", color, name, focused }) => {
  // Referencia para animación del icono
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Efecto para animar el icono cuando cambia el foco
  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: focused ? 1.1 : 1,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start();
  }, [focused]);

  return (
    <Animated.View
      className="flex gap-2 justify-center items-center mt-4 mb-1"
      style={{
        transform: [{ scale: scaleAnim }],
        width: 60, // Ancho fijo para evitar que se corten los iconos
        height: 50, // Altura fija para mantener consistencia
      }}
    >
      <View style={{ padding: 2 }}>
        {IconName === "light-bulb" ? (
          <Entypo name={IconName} color={color} size={24} />
        ) : (
          <Feather name={IconName} color={color} size={24} />
        )}
      </View>
      <Text
        className={`${focused ? "font-psemibold" : "font-pregular"} text-xs`}
        style={{ color: color }}
      >
        {name}
      </Text>
    </Animated.View>
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
            borderTopWidth: 1,
            borderTopColor: "#1e2a47",
            height: 90, // Aumentamos la altura para dar más espacio
            paddingTop: 6, // Añadimos padding superior
            paddingBottom: 10, // Añadimos padding inferior
          },
        }}
      >
        <Tabs.Screen
          name="Stats"
          options={{
            headerStyle: {
              backgroundColor: "#323d4f",
            },
            headerTitleStyle: {
              color: "#fff",
            },
            title: "Estadísticas de Sueño",
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                icon="bar-chart-2"
                color={color}
                name="Stats"
                focused={focused}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="Music"
          options={{
            title: "Sonidos",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                icon="play-circle"
                color={color}
                name="Music"
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
                icon="message-circle"
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
                icon="light-bulb"
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
                icon="user"
                color={color}
                name="Profile"
                focused={focused}
              />
            ),
          }}
        />
      </Tabs>
      <StatusBar style="light" />
    </>
  );
};

export default Tabslayout;
