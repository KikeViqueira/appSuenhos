import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/FontAwesome";
import FirstLineChart from "../../components/FirstLineChart";
import WakeUpForm from "../../components/WakeUpForm";

const Estadisticas = () => {
  //Definimos un estado para saber si el modal de preguntas sobre la calidad del sueño está abierto o cerrado, y otro para guardar las respuestas a este
  const [showModal, setShowModal] = useState(false);
  const [response, setResponse] = useState(null);

  const toggleModal = () => {
    setShowModal(!showModal);
  };

  //Función para guardar la respuesta a las preguntas sobre la calidad del sueño
  const saveResponse = (newResponse) => {
    console.log("Nueva respuesta:", newResponse);
    //Guardamos directamente la respuesta en vez de hacer un array de respuestas, ya que al contestar al form se guarda la respuesta en la base de datos
    setResponse(newResponse);
    //IMPORTANTE: Aquí se debería guardar la respuesta en la base de datos si la respuesta es válida
    if (response) console.log("Respuesta guardada:", response);
  };

  return (
    <SafeAreaView className="w-full h-full bg-primary">
      <ScrollView
        contentContainerStyle={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
          width: "100%",
        }}
      >
        {/* Primera sección de la pestaña de estadísticas
          que servirá para registrar las horas de sueño del usuario y abrir el modal de preguntas nada más despertarse en relación a su calidad de sueño */}
        <View className="flex w-[95%] gap-6 px-4 py-5 rounded-lg bg-[#1e2a47]">
          {/* Título de la sección */}
          <View className="flex flex-row justify-start gap-4">
            <Icon name="bed" size={24} color="white" />
            <Text
              className="text-center font-bold color-[#6366ff]"
              style={{ fontSize: 24 }}
            >
              Registro de Sueño
            </Text>
          </View>
          {/* Botones para registrar las horas de sueño y abrir el modal de preguntas */}
          <View className="flex flex-row justify-between w-full">
            <TouchableOpacity className="flex flex-row items-center justify-start px-3 py-3 gap-4 bg-[#323d4f] rounded-xl w-auto">
              <Icon name="moon-o" size={20} color="#fff" />
              <Text className="text-base text-center color-white">
                Me voy a dormir
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={toggleModal}
              className="flex flex-row items-center justify-start px-3 py-3 gap-4 bg-[#323d4f] rounded-xl w-auto"
            >
              <Icon name="sun-o" size={20} color="#fff" />
              <Text className="text-base text-center color-white">
                Me acabo de despertar
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Modal de preguntas sobre la calidad del sueño */}
        <WakeUpForm
          isVisible={showModal}
          onClose={toggleModal}
          onSave={saveResponse}
        />

        <View className="flex justify-center w-[95%] gap-6 px-4 py-5 rounded-lg bg-[#1e2a47]">
          <View className="flex flex-row justify-start gap-4">
            <Icon name="calendar" size={24} color="#fff" />
            <Text
              className="text-center font-bold color-[#6366ff]"
              style={{ fontSize: 24 }}
            >
              Horas de Sueño Semanal
            </Text>
          </View>
          <View className="flex items-center">
            {/* Segunda sección de la pestaña de estadísticas, que hace referencia a la gráfica que recoge las horas que el usario a dormido a lo largo de los días de la semana*/}
            <FirstLineChart />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Estadisticas;
