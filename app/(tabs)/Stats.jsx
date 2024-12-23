import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/FontAwesome";
import FirstLineChart from "../../components/FirstLineChart";
import WakeUpForm from "../../components/WakeUpForm";

const Estadisticas = () => {
  //Definimos un estado para saber si el modal de preguntas sobre la calidad del sueño está abierto o cerrado, y otro para guardar las respuestas a este
  const [showModal, setShowModal] = useState(false);
  const [response, setResponse] = useState(null);
  //Establecemos las variables que se encargarán de calcular las horas de sueño del usuario al día
  const [sleepStart, setSleepStart] = useState(null);
  const [sleepDuration, setSleepDuration] = useState(null);
  //Variable para saber si el usuario esta durmiendo o no
  const [isSleeping, setIsSleeping] = useState(false);

  //Función que se encarga de calcular la hora de sueño inicial
  const calculateSleepStart = () => {
    //Si el user no estaba durmiendo, le damos la hora actual
    if (!isSleeping) {
      setSleepStart(new Date());
      setIsSleeping(true);
    } else {
      Alert.alert(
        "Reiniciar el registro",
        "¿Estás seguro de querer reiniciar el registro de horas de sueño?",
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Reiniciar",
            onPress: () => {
              setIsSleeping(false);
              setSleepStart(null);
            },
          },
        ]
      );
    }
  };

  //Función para guardar las horas que el user ha dormido y calcular la duración de sueño
  const calculateSleepDuration = (wakeUpTime) => {
    const wakeUpDate = new Date(wakeUpTime);
    const duration = wakeUpDate - sleepStart;

    if (duration < 0) {
      Alert.alert(
        "Tiempo inválido",
        "La hora de despertar debe ser posterior a la hora en que te fuiste a dormir"
      );
      return false;
    }

    const hours = Math.floor(duration / 3600000);
    setSleepDuration(hours);
    return true;
  };

  const toggleModal = () => {
    //Si el usuario usurio tiene el botón de me voy a dormir activado le dejamos hacer el form
    if (isSleeping) {
      setShowModal(!showModal);
    } else {
      Alert.alert(
        "Ups :(",
        "Tienes que haber iniciado el registro antes de proceder con el formulario"
      );
    }
  };

  //Función para guardar la respuesta a las preguntas sobre la calidad del sueño
  const saveResponse = (newResponse) => {
    // Validar que la hora de despertar sea válida
    if (calculateSleepDuration(newResponse.time)) {
      console.log("Nueva respuesta:", newResponse);
      console.log("Hora en la que el user se ha despertado:", newResponse.time);
      console.log("Duración del sueño (horas):", sleepDuration);

      //Guardamos directamente la respuesta en vez de hacer un array de respuestas, ya que al contestar al form se guarda la respuesta en la base de datos
      setResponse(newResponse);
      setSleepStart(null);
      setIsSleeping(false);
      setSleepDuration(null);
      //IMPORTANTE: Aquí se debería guardar la respuesta en la base de datos si la respuesta es válida
    }
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
          <View className="flex flex-row gap-4 justify-start">
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
            <TouchableOpacity
              //Cuando el user haga click en el botón, se calculará la hora de inicio de sueño
              onPress={calculateSleepStart}
              className={`flex flex-row items-center justify-start px-3 py-3 gap-4 ${
                isSleeping
                  ? "bg-[#ff4757] hover:bg-[#ff6b81]"
                  : "bg-[#323d4f] hover:bg-[#3d4b63]"
              } rounded-xl w-auto transition-colors duration-200 shadow-lg`}
            >
              <Icon
                name={isSleeping ? "refresh" : "moon-o"}
                size={20}
                color="#fff"
              />
              <Text className="text-base font-medium text-center color-white">
                {isSleeping ? "Reiniciar registro" : "Me voy a dormir"}
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
          <View className="flex flex-row gap-4 justify-start">
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
