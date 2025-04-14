import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import React, { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Bed,
  RefreshCcw,
  Moon,
  Sun,
  ClipboardList,
  File,
  ClipboardCheck,
} from "lucide-react-native";
import WakeUpForm from "../../components/WakeUpForm";
import SleepLogResponses from "../../components/SleepLogResponses";
import SleepGraphs from "../../components/SleepGraphs";
import FitbitUserGraphs from "../../components/FitbitUserGraphs";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import useSleep from "../../hooks/useSleep";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

//Función para mandar una notificación cuando hayan pasado 8 horas desde que el user se haya ido a dormir
const sendNotificationWakeUp = async ({ now }) => {
  const trigger = new Date(now.getTime() + 8 * 60 * 60 * 1000);
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "¿Pilas recargadas?",
        body: "No olvides registrar tu hora de despertar para calcular tu sueño.",
      },
      trigger,
    });
    console.log("Notification scheduled");
  } catch (error) {
    alert("La notificación no pudo ser programada");
  }
};

//Función para finalizar el registro de horas de sueño y calcular la duración de sueño
const calculateSleepDuration = async (wakeUpTime) => {
  try {
    //recuperamos la hora de sueño en la que el user se fue a dormir
    const recoveredSleepStart = await AsyncStorage.getItem("sleepStart");
    if (!recoveredSleepStart) {
      console.warn("No se encontró una hora de inicio de sueño registrada.");
      return null;
    }

    //Hemos recuperado la fecha en formato String y tenemos que pasarlo a Date
    const sleepStartTime = new Date(recoveredSleepStart);
    const wakeUpTimeDate = new Date(wakeUpTime);
    const duration = wakeUpTimeDate.getTime() - sleepStartTime.getTime(); //Hacemos la diferencia en milisegundos

    if (duration < 0) {
      Alert.alert(
        "Tiempo inválido",
        "La hora de despertar debe ser posterior a la hora en que te fuiste a dormir"
      );
      return null;
    }

    const hours = Math.floor(duration / 3600000);

    //Limpiamos los estados, almacenamiento y notificaciones
    await AsyncStorage.removeItem("sleepStart");

    // Canelamos las notificaciones programadas
    await Notifications.cancelAllScheduledNotificationsAsync();

    //De la función de calcular la duración de lo que ha dormido el user devolvemos tanto la duración como la hora en la que se ha ido a dormir
    const response = {
      sleepTime: sleepStartTime,
      duration: duration / 3600000, // Convertir milisegundos a horas (ms / 1000 / 60 / 60)
    };

    return response;
  } catch (error) {
    console.error("Error al calcular la duración de sueño: ", error);
    return null;
  }
};

const Estadisticas = () => {
  //Definimos un estado para saber si el modal de preguntas sobre la calidad del sueño está abierto o cerrado, y otro para guardar las respuestas a este
  const [showModal, setShowModal] = useState(false);
  const [showResponsesModal, setShowResponsesModal] = useState(false);
  const [isSleeping, setIsSleeping] = useState(false); //Estado para saber si el user esta durmiendo o no
  const [hasDailySleepLog, setHasDailySleepLog] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);

  const {
    createSleepLog,
    getSleepLogEndpoint,
    getDailySleepLog,
    sleepLog,
    loading,
  } = useSleep();

  //Función para saber si el user ha hecho hoy el registro de sueño
  const checkDailySleepLog = async () => {
    try {
      const dailySleepLog = await getDailySleepLog();
      if (dailySleepLog) {
        setHasDailySleepLog(true);
      } else {
        setHasDailySleepLog(false);
      }
    } catch (error) {
      console.error(
        "Error al comprobar si el user ha hecho hoy el registro de sueño: ",
        error
      );
    }
  };

  //Definición de la función asíncrona
  const loadSleepData = async () => {
    try {
      const recoveredSleepStart = await AsyncStorage.getItem("sleepStart");
      if (recoveredSleepStart) {
        const sleepStartTime = new Date(recoveredSleepStart);
        console.log(
          "Hora en la que el user se ha ido a dormir: ",
          sleepStartTime
        );
        const now = new Date();

        //Comprobamos si la hora en la que se ha ido a dormir lleva más de 24 horas almacenada en el storage
        if (now.getTime() - sleepStartTime.getTime() <= 24 * 60 * 60 * 1000) {
          setTimeout(() => setIsSleeping(true), 0);
        } else {
          //En este caso borramos la hora ya que al pasar tanto tiempo las medidas no serán consistentes y realistas para la hora de representarlas en la app
          await AsyncStorage.removeItem("sleepStart");
        }
      }
    } catch (error) {
      console.error("Error al cargar la hora de inicio de sueño: ", error);
    }
  };

  // Cargamos la información de la BD
  useEffect(() => {
    loadSleepData();
    checkDailySleepLog();
  }, []);

  //Función para guardar la hora en la que el user se va a dormir
  const calculateSleepStart = async () => {
    //Si el usuario no estaba durmiendo, le damos la hora actual
    if (!isSleeping) {
      console.log("Valor de isSleeping en el if: ", isSleeping);
      const now = new Date();
      try {
        //Guardamos la hora en la que el user se ha dormido en el storage del dispositivo
        await AsyncStorage.setItem("sleepStart", now.toISOString()); //tenemos que pasarlo a string

        //Mandamos la noti para recordar al user de hacer el form si aun no lo ha hecho
        sendNotificationWakeUp({ now });

        //Actualizamos el estado después de que se haya guardado la hora en el storage, asi no da error de Reanimated
        //Cambiamos el estado asegurandonos que no de Reanimated mediante el uso de timeout
        setTimeout(() => setIsSleeping(true), 0);
        console.log("Hora en la que el user se ha ido a dormir: ", now);
      } catch (error) {
        console.error("Error al guardar la hora de inicio de sueño: ", error);
      }
    } else {
      console.log("Valor de isSleeping en el else: ", isSleeping);
      Alert.alert(
        "Reiniciar el registro",
        "¿Estás seguro de querer reiniciar el registro de horas de sueño?",
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Reiniciar",
            onPress: () => {
              setTimeout(() => setIsSleeping(false), 0);
            },
          },
        ]
      );
      //eliminamos la notificación de recordatorio de despertar
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log("Valor de isSleeping despues de la alerta: ", isSleeping);
      //Borramos la hora de inicio de sueño si el user decide reiniciar el registro
      await AsyncStorage.removeItem("sleepStart");
    }
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
  const saveResponse = async (newResponse) => {
    // Validar que la hora de despertar sea válida y en ese caso recuperamos el objeto que nos devuelve la info necesaria para completar el payload que le mandamos a la BD
    const response = await calculateSleepDuration(newResponse.time);
    //Comprobamos si el objeto devuelto es null o no
    if (response) {
      console.log(
        "Hora en la que el user se ha ido a dormir: ",
        response.sleepTime
      );
      console.log("Hora en la que el user se ha despertado:", newResponse.time);
      console.log("Duración del sueño: ", response.duration);
      console.log("Respuesta a la pregunta 1: ", newResponse.question1);
      console.log("Respuesta a la pregunta 2: ", newResponse.question2);

      //Completamos el valor de los atributos del objeto newResponse con los guardados en el objeto response
      newResponse.sleepTime = response.sleepTime;
      newResponse.duration = response.duration;

      //Guardamos la respuesta del user en la BD
      await createSleepLog(newResponse);

      // Actualizamos los estados
      setIsSleeping(false);
      setHasDailySleepLog(true);
    }
  };

  //Función que se ejecuta cuando se presiona el botón de ver respuestas de hoy
  const handleViewResponses = async () => {
    //llamamos al endpoint de la api para obtener el registro matutino del user y así que el modal reciba el valor correcto para enseñar las respuestas
    setIsLoadingData(true);
    await getSleepLogEndpoint("1");
    setIsLoadingData(false);
    setShowResponsesModal(true);
  };

  /*
   * Definimos el estado que guardará en que sección del navbar nos encontramos
   *
   * Definimos la función para que dependiendo de en que sección nos encontremos del navbar de gráficas
   * podamos reenderizar correctamente las que deseamos
   */

  const [activeSection, setActiveSection] = useState("sleepGraphs"); //Componente por defecto que se muestra

  const renderComponent = () => {
    switch (activeSection) {
      case "sleepGraphs":
        return <SleepGraphs />;
      case "fitbitGraphs":
        return <FitbitUserGraphs />;
    }
  };

  return (
    <SafeAreaView className="w-full h-full bg-primary">
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          alignItems: "center",
          justifyContent: "start",
          gap: 5,
          width: "100%",
        }}
        bounces={true}
        decelerationRate="normal" // O "fast" según el comportamiento deseado
        showsVerticalScrollIndicator={true}
        indicatorStyle="white"
      >
        {/* Primera sección de la pestaña de estadísticas
          que servirá para registrar las horas de sueño del usuario y abrir el modal de preguntas nada más despertarse en relación a su calidad de sueño */}

        <View className="flex w-[95%] gap-6 px-4 py-5 rounded-lg bg-[#1e2a47]">
          {/* Título de la sección */}
          <View className="flex flex-row justify-start gap-4">
            <Bed size={24} color="white" />
            <Text
              className="text-center font-bold color-[#6366ff]"
              style={{ fontSize: 24 }}
            >
              Registro de Sueño
            </Text>
          </View>

          {/* Estado visual del registro */}
          {hasDailySleepLog && (
            <View className="flex-row items-center bg-[#2a3952] p-3 rounded-lg">
              <ClipboardCheck size={18} color="#4cd964" />
              <Text className="ml-2 color-white">
                Registro matutino completado
              </Text>
            </View>
          )}

          {/* Botones para registrar las horas de sueño y abrir el modal de preguntas */}
          <View className="flex flex-col justify-between w-full gap-4">
            <TouchableOpacity
              onPress={calculateSleepStart}
              className={`flex flex-row items-center justify-start p-4 gap-4 
                ${isSleeping ? "bg-[#ff4757]" : "bg-[#323d4f]"} 
                ${hasDailySleepLog ? "opacity-70" : "opacity-100"}
                rounded-xl w-auto`}
              disabled={hasDailySleepLog}
            >
              {isSleeping ? (
                <RefreshCcw size={20} color="#fff" />
              ) : (
                <Moon size={20} color="#fff" />
              )}

              <Text className="text-base font-medium text-center color-white">
                {isSleeping ? "Reiniciar registro" : "Me voy a dormir"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={toggleModal}
              className={`flex flex-row items-center justify-start p-4 gap-4 
                ${
                  !isSleeping || hasDailySleepLog
                    ? "bg-[#2a3952] opacity-70"
                    : "bg-[#6366ff]"
                } 
                rounded-xl w-auto`}
              disabled={!isSleeping || hasDailySleepLog}
            >
              <Sun size={20} color="#fff" />
              <Text className="text-base text-center color-white">
                {hasDailySleepLog
                  ? "Registro matutino completado"
                  : "Me acabo de despertar"}
              </Text>
            </TouchableOpacity>

            {/* Botón para ver las respuestas del cuestionario de hoy */}
            <TouchableOpacity
              className={`flex flex-row items-center justify-start p-4 gap-4 
                ${
                  !hasDailySleepLog ? "bg-[#2a3952] opacity-70" : "bg-[#6366ff]"
                }
                rounded-xl w-auto`}
              disabled={!hasDailySleepLog || isLoadingData}
              onPress={handleViewResponses}
            >
              <ClipboardList size={20} color="#fff" />
              <Text className="text-base font-medium text-center color-white">
                {isLoadingData
                  ? "Cargando respuestas..."
                  : "Ver respuestas de hoy"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Nueva sección de navegación */}
        <View className="flex flex-col gap-4  w-[95%] px-4 py-5 rounded-lg bg-[#1e2a47]">
          <View className="flex flex-row justify-between w-full gap-4">
            <TouchableOpacity
              onPress={() => setActiveSection("sleepGraphs")}
              className={`flex-1 mx-2 ${
                activeSection === "sleepGraphs"
                  ? "bg-[#6366ff]"
                  : "bg-[#323d4f]"
              } rounded-lg p-4 justify-center`}
            >
              <Text className="font-bold text-center color-white">
                Gráficas
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setActiveSection("fitbitGraphs")}
              className={`flex-1 mx-2 ${
                activeSection === "fitbitGraphs"
                  ? "bg-[#6366ff]"
                  : "bg-[#323d4f]"
              } rounded-lg p-4 justify-center`}
            >
              <Text className="font-bold text-center color-white">
                Gráficas reservadas de Fitbit
              </Text>
            </TouchableOpacity>
          </View>

          {/*llamamos a la función para que reenderice lo necesario dependiendo de lo que tenga seleccionado el user*/}
          {renderComponent()}
        </View>

        {/* Modal de preguntas sobre la calidad del sueño */}
        <WakeUpForm
          isVisible={showModal}
          onClose={toggleModal}
          onSave={saveResponse}
        />

        {/* Modal para ver las respuestas del registro matutino */}
        <SleepLogResponses
          isVisible={showResponsesModal}
          onClose={() => setShowResponsesModal(false)}
          sleepLog={sleepLog}
        />

        {/* Sección donde poneremos el botón para hacer el cuestionario diario DRM*/}
        {/*Botón para hacer el cuestionario diario DRM*/}
        <TouchableOpacity
          className="bg-[#323d4f] p-4 rounded-xl items-start mt-5 w-[95%]"
          //redireccionamos al user a la pantalla de cuestionario DRM
          onPress={() => router.push("/DRM")}
        >
          <View className="flex-row items-center self-center justify-center gap-4">
            <Text className="text-lg text-white font-psemibold">
              Hacer cuestionario DRM
            </Text>
            <ClipboardList color="white" />
          </View>
        </TouchableOpacity>

        {/*Botón para ver el informe que se ha generado hoy*/}
        <TouchableOpacity
          className="bg-[#323d4f] p-4 rounded-xl items-start mt-5 w-[95%]"
          //redireccionamos al user a la pantalla donde se encuentra el informe de DRM
          onPress={() => router.push("/DrmReport")}
        >
          <View className="flex-row items-center self-center justify-center gap-4">
            <Text className="text-lg text-white font-psemibold">
              Ver informe DRM
            </Text>
            <File color="white" />
          </View>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Estadisticas;
