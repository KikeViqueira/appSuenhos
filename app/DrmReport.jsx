import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from "react-native";
import React, { useEffect } from "react";
import { ChevronLeft } from "lucide-react-native";
import { router } from "expo-router";
import useDRM from "../hooks/useDRM";

const DrmReport = () => {
  const { getDrmToday, error, drmToday } = useDRM();

  const handleGenerateTip = () => {
    //TODO: Aqui tenemos que llamar al endpoint de la api para generar un tip personalizado para el user teniendo en cuenta toda su información
  };

  //Cuando el componente se reenderiza, hacemos la petición para obtener el cuestionario de hoy
  useEffect(() => {
    getDrmToday();
  }, []);

  return (
    <SafeAreaView className="flex-1 w-full h-full bg-primary">
      <View className="flex flex-row items-center justify-start gap-4 p-4">
        <TouchableOpacity
          //Dejamos que el user pueda volver a las gráficas en caso de que haya entrado sin querer en la pestaña
          onPress={() => router.back()}
          className="flex flex-row items-center gap-2 py-2"
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
      <View className="flex-1 flex-col justify-between items-center w-[90%] self-center mb-10">
        <View className="max-h-[90%]">
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            showsVerticalScrollIndicator={true}
            className="border-b border-gray-700"
          >
            <Text className="mb-4 text-lg text-white" selectable={true}>
              {/*Si el drmToday no es vacío lo reenderizamos, en caso contrario ponemos un mensaje de que no se ha hecho el cuestionario hoy*/}
              {drmToday !== ""
                ? drmToday
                : "No se ha generado el cuestionario de hoy"}
            </Text>
          </ScrollView>
        </View>

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
