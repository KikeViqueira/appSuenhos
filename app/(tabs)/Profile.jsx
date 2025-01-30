import { View, Text, Image, TouchableOpacity } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Camera, Edit2 } from "lucide-react-native";

const Profile = () => {
  return (
    <SafeAreaView className="flex-1 bg-primary">
      <View className="flex-1 px-4 py-6">
        {/* Header */}
        <Text
          className="text-center font-bold text-[#6366ff] py-4 "
          style={{ fontSize: 24 }}
        >
          Configuración de la cuenta
        </Text>

        {/* User Profile Photo */}
        <View className="items-center mb-8">
          <View className="relative">
            <Image
              source={{
                uri: "https://ui-avatars.com/api/?name=Enrique+Viqueira&background=6366FF&color=fff",
              }}
              className="w-32 h-32 rounded-full"
            />
            <TouchableOpacity
              className="absolute bottom-0 right-0 bg-[#6366FF] p-2 rounded-full"
              // onPress will be implemented later
            >
              <Camera size={20} color="white" />
            </TouchableOpacity>
          </View>
          <Text className="mt-4 text-xl text-white font-psemibold">
            Enrique Viqueira
          </Text>
        </View>

        {/* Personal Information */}
        <View className="bg-[#1e2a47] rounded-xl p-4 mb-6">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-white font-pmedium">Correo Electrónico</Text>
            <TouchableOpacity>
              <Edit2 size={20} color="#6366FF" />
            </TouchableOpacity>
          </View>
          <Text className="text-white font-pregular">
            enrique.viqueira@example.com
          </Text>
        </View>

        <View className="bg-[#1e2a47] rounded-xl p-4 mb-6">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-white font-pmedium">Número de Teléfono</Text>
            <TouchableOpacity>
              <Edit2 size={20} color="#6366FF" />
            </TouchableOpacity>
          </View>
          <Text className="text-white font-pregular">+34 123 456 789</Text>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          className="bg-[#ff6b6b] py-4 rounded-xl items-center"
          // onPress will be implemented later
        >
          <Text className="text-lg text-white font-psemibold">
            Cerrar Sesión
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default Profile;
