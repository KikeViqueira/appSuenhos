import { View, Text, Image, Animated } from "react-native";
import { Tabs, Redirect } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  ChartColumn,
  CirclePlay,
  MessageCircleMore,
  Lightbulb,
  ClipboardList,
  UserRound,
} from "lucide-react-native";
import React, { useRef, useEffect } from "react";
import icons from "../../constants/icons";

import { ShieldQuestion } from "lucide-react-native";

const TabIcon = ({
  icon: IconParameter = ShieldQuestion,
  color,
  name,
  focused,
}) => {
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
    //Damos estilo a nuestros iconos del tab junto a sus correspondientes nombres
    <Animated.View
      className="flex items-center justify-center gap-1 mt-6"
      style={{
        transform: [{ scale: scaleAnim }],
      }}
    >
      <IconParameter color={color} size={24} />
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
            borderTopCWidth: 1,
            borderTopColor: "#1e2a47",
            height: 84,
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
                icon={ChartColumn}
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
                icon={CirclePlay}
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
                icon={MessageCircleMore}
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
                icon={Lightbulb}
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
                icon={UserRound}
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
