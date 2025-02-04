import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import React, { useState, useEffect, useCallback } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/FontAwesome";
import FirstLineChart from "../../components/FirstLineChart";
import WakeUpForm from "../../components/WakeUpForm";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/*FIXME: Los problemas con Reanimated suelen ocurrir cuando intentas actualizar el estado (setState)
     dentro de un callback de animación o de un evento asíncrono
     sin asegurarte de que está en el hilo principal de React Native.*/

const Estadisticas = () => {
  //Definimos un estado para saber si el modal de preguntas sobre la calidad del sueño está abierto o cerrado, y otro para guardar las respuestas a este
  const [showModal, setShowModal] = useState(false);
  const [response, setResponse] = useState(null);
  const [isSleeping, setIsSleeping] = useState(false); //Estado para saber si el user esta durmiendo o no
  const [sleepDuration, setSleepDuration] = useState(0);

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
      console.log("Valor de isSleeping despues de la alerta: ", isSleeping);
    }
  };

  //Función para finalizar el registro de horas de sueño y calcular la duración de sueño
  const calculateSleepDuration = async (wakeUpTime) => {
    try {
      //recuperamos la hora de sueño en la que el user se fue a dormir
      const recoveredSleepStart = await AsyncStorage.getItem("sleepStart");
      if (!recoveredSleepStart) {
        console.warn("No se encontró una hora de inicio de sueño registrada.");
        return false;
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
        return false;
      }

      const hours = Math.floor(duration / 3600000);

      //Limpiamos los estados, almacenamiento y notificaciones
      await AsyncStorage.removeItem("sleepStart");
      setTimeout(() => setIsSleeping(false), 0);
      Notifications.cancelAllScheduledNotificationsAsync();
      setTimeout(() => setSleepDuration(hours), 0);
    } catch (error) {
      console.error("Error al calcular la duración de sueño: ", error);
    }
  };

  //Definición de la función asíncrona
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

  //Cargamos la hora en la que el user se ha ido a dormir cuando se inicializa el hook
  useEffect(() => {
    //llamamos a la función encargada de cargar la hora de inicio del sueño
    loadSleepData();
  }, []);

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

      //Guardamos directamente la respuesta en vez de hacer un array de respuestas, ya que al contestar al form se guarda la respuesta en la base de datos, tenemos que pasarlo entre {} al ser un objeto
      setResponse({ newResponse });
      //TODO: Aquí se debería guardar la respuesta en la base de datos si la respuesta es válida
      console.log("Respuesta del user al Cuestionario Matutino:", response);
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
