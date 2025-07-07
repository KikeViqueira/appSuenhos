#!/bin/bash

echo "🔄 Actualizando Expo y dependencias a las versiones recomendadas..."

# Lista de paquetes a actualizar con sus versiones recomendadas para Expo SDK 53
packages=(
  "@react-native-community/datetimepicker@8.4.1"
  "expo@53.0.18"
  "expo-av@~15.1.7"
  "expo-constants@~17.1.7"
  "expo-document-picker@~13.1.6"
  "expo-font@~13.3.2"
  "expo-linking@~7.1.7"
  "expo-notifications@~0.31.4"
  "expo-router@~5.1.3"
  "expo-splash-screen@~0.30.10"
  "expo-system-ui@~5.0.10"
  "expo-web-browser@~14.2.0"
  "react-native@0.79.5"
  "jest-expo@~53.0.9"
)

# Ejecutar npm install para cada paquete
for package in "${packages[@]}"
do
  echo "🚀 Instalando $package..."
  npm install "$package"
done

echo "✅ ¡Actualización completada!"
