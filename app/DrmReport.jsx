import { View, Text, TouchableOpacity, SafeAreaView } from "react-native";
import React from "react";
import { ChevronLeft } from "lucide-react-native";
import { router } from "expo-router";

const DrmReport = () => {
  const handleGenerateTip = () => {
    //TODO: Aqui tenemos que llamar al endpoint de la api para generar un tip personalizado para el user teniendo en cuenta toda su información
  };

  return (
    <SafeAreaView className="flex-1 w-full h-full bg-primary">
      <View className="flex flex-row gap-4 justify-start items-center p-4">
        <TouchableOpacity
          //Dejamos que el user pueda volver a las gráficas en caso de que haya entrado sin querer en la pestaña
          onPress={() => router.back()}
          className="flex flex-row gap-2 items-center py-2"
        >
          <ChevronLeft size={24} color="white" />
        </TouchableOpacity>
        <Text
          className="text-center font-bold text-[#6366ff] py-2"
          style={{ fontSize: 24 }}
        >
          Cuestionario diario DRM
        </Text>
      </View>
      <View className="flex-1 flex-col justify-between items-center w-[90%] self-center py-8">
        <Text className="mb-4 text-lg text-white" selectable={true}>
          Este informe proporciona un análisis detallado de su calidad de sueño
          y patrones de descanso. Se ha observado que la duración promedio de su
          sueño es de aproximadamente 7 horas por noche, lo que se encuentra
          dentro de las recomendaciones de salud. Sin embargo, hay momentos en
          los que su sueño se interrumpe, lo que puede afectar su bienestar
          general. Es recomendable establecer una rutina de sueño consistente y
          crear un ambiente propicio para descansar. Considerar la reducción de
          la exposición a pantallas antes de dormir y mantener una temperatura
          adecuada en su habitación puede mejorar la calidad de su sueño.
          Además, es importante llevar un registro de sus hábitos de sueño y
          cualquier factor que pueda estar afectando su descanso. Esto ayudará a
          identificar patrones y hacer ajustes necesarios para optimizar su
          salud y bienestar.
        </Text>

        <TouchableOpacity
          TouchableOpacity
          className="bg-[#15db44] py-4 rounded-xl items-center w-full"
          onPress={handleGenerateTip}
        >
          <Text className="text-lg text-white font-psemibold">
            Generar Tip Personalizado
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default DrmReport;
