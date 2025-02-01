#!/bin/bash

echo "🔄 Actualizando Expo y dependencias a las versiones recomendadas..."

# Lista de paquetes a actualizar con sus versiones esperadas
packages=(
  "expo@~52.0.26"
  "expo-av@~15.0.2"
  "expo-constants@~17.0.5"
  "expo-font@~13.0.3"
  "expo-linking@~7.0.5"
  "expo-notifications@~0.29.13"
  "expo-router@~4.0.17"
  "expo-splash-screen@~0.29.21"
  "expo-status-bar@~2.0.1"
  "expo-system-ui@~4.0.7"
  "expo-web-browser@~14.0.2"
  "react-native@0.76.6"
  "react-native-screens@~4.4.0"
  "jest-expo@~52.0.3"
)

# Ejecutar npm install para cada paquete
for package in "${packages[@]}"
do
  echo "🚀 Instalando $package..."
  npm install $package
done

echo "✅ ¡Actualización completada!"
