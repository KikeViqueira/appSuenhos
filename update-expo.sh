#!/bin/bash

echo "🔄 Actualizando Expo y dependencias a las versiones recomendadas..."

# Lista de paquetes a actualizar con sus versiones recomendadas
packages=(
  "@react-native-community/slider@4.5.5"
  "expo-image-picker@~16.0.6"
  "lottie-react-native@7.1.0"
  "react-native@0.76.7"
)

# Ejecutar npm install para cada paquete
for package in "${packages[@]}"
do
  echo "🚀 Instalando $package..."
  npm install "$package"
done

echo "✅ ¡Actualización completada!"
