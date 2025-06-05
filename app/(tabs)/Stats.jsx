import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Animated,
} from "react-native";
import React, { useState, useEffect, useRef } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  MaterialCommunityIcons,
  FontAwesome5,
  Feather,
} from "@expo/vector-icons";
import WakeUpForm from "../../components/WakeUpForm";
import SleepLogResponses from "../../components/SleepLogResponses";
import SleepGraphs from "../../components/SleepGraphs";
import FitbitUserGraphs from "../../components/FitbitUserGraphs";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import useSleep from "../../hooks/useSleep";
import { useAuthContext } from "../../context/AuthContext";
import useFlags from "../../hooks/useFlags";

/**
 *  Función que lo que hace es quitarle el offset de la fecha para poder trabajar con fechas locales del user y que se guarden correctamente en la BD de manera coherente
 * @param {Date} date - Fecha que se quiere formatear
 * @return {string} - Fecha formateada en el formato que espera la API
 */
const formatDateToLocalDate = (date) => {
  const tzOffset = date.getTimezoneOffset() * 60000; // Offset en milisegundos
  const localDate = new Date(date.getTime() - tzOffset);
  return localDate;
};

/**
 *  Función que nos devuelve la fecha en el formato que espera la api
 * @param {Date} date - Fecha que se quiere formatear
 * @return {string} - Fecha formateada en el formato que espera la API
 */
const formatDateToApiFormat = (date) => {
  // Formatear la fecha a YYYY-MM-DDTHH:mm:ss
  return date.toISOString().slice(0, 19);
};

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

//Función para mandar una notificación cuando hayan pasado 8 horas desde que el user se haya ido a dormir
const sendNotificationWakeUp = async () => {
  // Calculamos 8 horas después de la hora actual
  const trigger = new Date(new Date().getTime() + 8 * 60 * 60 * 1000);
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "¿Pilas recargadas?",
        body: "No olvides registrar tu hora de despertar para calcular tu sueño.",
      },
      trigger: {
        type: "date",
        date: trigger,
      },
    });
    console.log("Notification scheduled for wake up: ", trigger);
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
    // Asegurarnos de que lo que recuperamos sea un objeto Date válido
    const sleepStartTime =
      recoveredSleepStart instanceof Date
        ? recoveredSleepStart
        : new Date(recoveredSleepStart);

    // Asegurarnos de que wakeUpTime sea un objeto Date válido
    const wakeUpTimeDate =
      wakeUpTime instanceof Date ? wakeUpTime : new Date(wakeUpTime);

    console.log(
      "Horas que se van a restar para calcular la duracion de lo que ha dormido el user: ",
      sleepStartTime,
      " - ",
      wakeUpTimeDate
    );

    const duration = wakeUpTimeDate.getTime() - sleepStartTime.getTime(); //Hacemos la diferencia en milisegundos
    console.log("Duración del sueño: ", duration);

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
      duration: duration,
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

  // Ref para el ScrollView y para la animación del indicador de scroll
  const scrollViewRef = useRef(null);
  const scrollIndicatorOpacity = useRef(new Animated.Value(1)).current;
  const [showScrollIndicator, setShowScrollIndicator] = useState(true);

  const { userInfo, loading } = useAuthContext();

  //llamamos a las funciones que interacionan con los endpoints relacionados con las banderas diarias del user
  const { insertDailyFlag, deleteDailyFlag } = useFlags();

  const { createSleepLog, getSleepLogEndpoint, getDailySleepLog, sleepLog } =
    useSleep();

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
          "Hora en la que el user se ha ido a dormir al cargar la app: ",
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
      try {
        const now = new Date();
        //Eliminamos offset para trabajar con fechas locales
        const formattedDate = formatDateToLocalDate(now);

        // Guardamos como string en AsyncStorage
        await AsyncStorage.setItem("sleepStart", formattedDate.toISOString());

        //Guardamos la bandera y el valor en la BD
        await insertDailyFlag("sleepStart", formattedDate.toISOString());

        // Mandamos la notificación usando la fecha formateada
        sendNotificationWakeUp();

        // Actualizamos el estado después de que se haya guardado la hora
        setTimeout(() => setIsSleeping(true), 0);

        console.log(
          "Hora en la que el user se ha ido a dormir que se va a guardar en el storage: ",
          formattedDate
        );
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
            onPress: async () => {
              //Reiniciamos el valor de la bandera y la eliminamos de la BD
              await deleteDailyFlag("sleepStart");
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
  const saveResponse = async (wakeUpFormResponse) => {
    try {
      // Validar que la hora de despertar sea válida
      const response = await calculateSleepDuration(
        wakeUpFormResponse.wakeUpTime
      );

      //Comprobamos si el objeto devuelto es null o no
      if (response) {
        console.log(
          "Hora en la que el user se ha ido a dormiral guardar la respuesta: ",
          response.sleepTime
        );

        console.log(
          "Hora en la que el user se ha despertado:",
          wakeUpFormResponse.wakeUpTime
        );
        console.log("Duración del sueño: ", response.duration);
        console.log(
          "Respuesta a la pregunta 1: ",
          wakeUpFormResponse.question1
        );
        console.log(
          "Respuesta a la pregunta 2: ",
          wakeUpFormResponse.question2
        );

        /*
         * Tenemos que crear el objeto con los campos que se van a enviar a la BD:
         * 1. sleepTime: fecha en la que el user se ha ido a dormir
         * 2. duration: duración del sueño
         * 3. wakeUpTime: fecha en la que el user se ha despertado
         * 4. question1: respuesta a la pregunta 1
         * 5. question2: respuesta a la pregunta 2
         */
        const newResponse = {
          sleepTime: formatDateToApiFormat(response.sleepTime),
          duration: response.duration,
          wakeUpTime: formatDateToApiFormat(wakeUpFormResponse.wakeUpTime),
          question1: wakeUpFormResponse.question1,
          question2: wakeUpFormResponse.question2,
        };

        console.log("Enviando a la API:", newResponse);

        //Guardamos la respuesta del user en la BD
        await createSleepLog(newResponse);

        /*
         * Cuando el user ha completado el cuestionario matutino y no se haya producido errores de la api al guardar la respuesta,
         * tenemos que eliminar la bandera de sleepStart del AsyncStorage
         */
        await AsyncStorage.removeItem("sleepStart");
        // Actualizamos los estados
        setIsSleeping(false);
        setHasDailySleepLog(true);

        //tenemos que hacer una llamada a la info del user en los últimos 7 días para tener la UI actualizada en tiempo real sin tener que esperar a la ejecución del useEffect dentro del componente de las graficas generales del user
        await getSleepLogEndpoint("7");
      }
    } catch (error) {
      console.error("Error al guardar la respuesta:", error);
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

  // Al cambiar de sección, resetear el scroll y mostrar el indicador
  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: 0, animated: true });
      setShowScrollIndicator(true);
      fadeInScrollIndicator();
    }
  }, [activeSection]);

  // Animaciones para el indicador de scroll
  const fadeInScrollIndicator = () => {
    Animated.sequence([
      //Cuando de rapido tiene que llegar a la opacidad 1
      Animated.timing(scrollIndicatorOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      //Tiempo en el que el indicador tiene opacidad 1
      Animated.delay(2000),
      //Cuando de rapido tiene que llegar a la opacidad 0.3
      Animated.timing(scrollIndicatorOpacity, {
        toValue: 0.3,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Función para manejar el evento de scroll
  const handleScroll = (event) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const contentHeight = event.nativeEvent.contentSize.height;
    const scrollViewHeight = event.nativeEvent.layoutMeasurement.height;

    // Si el scroll está cerca del final, ocultar el indicador
    if (offsetY + scrollViewHeight >= contentHeight - 20) {
      setShowScrollIndicator(false);
    } else {
      setShowScrollIndicator(true);
    }
  };

  const renderComponent = () => {
    switch (activeSection) {
      case "sleepGraphs":
        if (loading || !userInfo) {
          return (
            <View className="flex justify-center items-center h-[300px] bg-[#1e2a47] rounded-lg flex-col gap-4">
              <Feather name="moon" size={40} color="#6366ff" />
              <Text className="text-lg font-medium text-white">
                Cargando información del sueño
              </Text>
              <Text className="px-6 text-sm text-center text-gray-400">
                Estamos preparando tus estadísticas personalizadas
              </Text>
            </View>
          );
        }
        return <SleepGraphs userInfo={userInfo} />;
      case "fitbitGraphs":
        return <FitbitUserGraphs />;
      case "drmSection":
        return (
          <View className="flex flex-col w-full gap-6 mt-4">
            <Text className="mb-2 ml-2 text-lg font-semibold text-white">
              Day Reconstruction Method
            </Text>

            {/* Card layout for DRM buttons */}
            <View className="flex-row justify-between w-full gap-4">
              {/* Questionnaire Card */}
              <TouchableOpacity
                className="flex-1 p-5 rounded-xl border border-[#6366ff]/20"
                onPress={() => router.push("/DRM")}
              >
                <View className="items-center justify-center">
                  <View className="bg-[#6366ff]/20 p-3 rounded-full mb-4">
                    <FontAwesome5
                      name="clipboard-list"
                      color="#6366ff"
                      size={30}
                    />
                  </View>
                  <Text className="mb-2 text-base font-bold text-center text-white">
                    Cuestionario DRM
                  </Text>
                  <Text className="text-sm text-center text-gray-400">
                    Completa el formulario para obtener tu informe
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Report Card */}
              <TouchableOpacity
                className="flex-1  p-5 rounded-xl border border-[#6366ff]/20"
                onPress={() => router.push("/DrmReport")}
              >
                <View className="items-center justify-center">
                  <View className="bg-[#6366ff]/20 p-3 rounded-full mb-4">
                    <Feather name="file" color="#6366ff" size={30} />
                  </View>
                  <Text className="mb-2 text-base font-bold text-center text-white">
                    Informe DRM
                  </Text>
                  <Text className="text-sm text-center text-gray-400">
                    Consulta el informe generado totalmente personalizado
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            <View className="bg-[#1e273a] p-4 rounded-xl border border-[#323d4f] mt-2">
              <Text className="mb-1 text-base text-gray-400">¿Qué es DRM?</Text>
              <Text className="text-sm text-gray-500">
                El Day Reconstruction Method (DRM) te ayuda a reconstruir tu día
                tras cada noche de sueño, identificando patrones de descanso y
                emociones. Así optimizas tus hábitos de sueño y potencias tu
                toma de decisiones.
              </Text>
            </View>
          </View>
        );
    }
  };

  return (
    <SafeAreaView className="w-full h-full bg-primary">
      <ScrollView
        ref={scrollViewRef}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{
          flexGrow: 1,
          alignItems: "center",
          justifyContent: "start",
          gap: 5,
          width: "100%",
          paddingBottom: 20,
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
            <MaterialCommunityIcons name="bed" size={24} color="white" />
            <Text
              className="text-center font-bold color-[#6366ff]"
              style={{ fontSize: 24 }}
            >
              Registro de Sueño
            </Text>
          </View>

          {/* Estado visual del registro, si el user ha completado el cuestionario matutino. Como cuando lo haya completado va a poder empezar otro, tenemos enseñar el mensaje solo si no esta durmiendo */}
          {hasDailySleepLog && !isSleeping && (
            <View className="flex-row items-center bg-[#2a3952] p-4 rounded-lg">
              <FontAwesome5 name="clipboard-check" size={18} color="#4cd964" />
              <Text className="ml-2 color-white">
                Registro matutino completado
              </Text>
            </View>
          )}

          {/* Nota informativa cuando el usuario está durmiendo y ya ha completado un registro */}
          {hasDailySleepLog && isSleeping && (
            <View className="flex-row items-center justify-start bg-[#2a3952] p-4 gap-3 rounded-lg">
              <FontAwesome5 name="info-circle" size={18} color="#6366ff" />
              <Text className="text-sm color-white w-[90%]">
                Solo puede registrar un cuestionario en el mismo día. Si inicia
                el registro del siguiente día antes de las 00:00, podrá guardar
                sus respuestas una vez pasada esa hora.
              </Text>
            </View>
          )}

          {/* Botones para registrar las horas de sueño y abrir el modal de preguntas */}
          <View className="flex flex-col justify-between w-full gap-4">
            <TouchableOpacity
              onPress={calculateSleepStart}
              className={`flex flex-row items-center justify-start p-4 gap-4 
                ${isSleeping ? "bg-[#ff4757]" : "bg-[#323d4f]"} 
                
                rounded-xl w-auto`}
            >
              {isSleeping ? (
                <Feather name="refresh-cw" size={20} color="#fff" />
              ) : (
                <Feather name="moon" size={20} color="#fff" />
              )}

              <Text className="text-base font-medium text-center color-white">
                {isSleeping ? "Reiniciar registro" : "Me voy a dormir"}
              </Text>
            </TouchableOpacity>

            {/* Botón para registrar la hora de despertar */}
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
              <Feather name="sun" size={20} color="#fff" />
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
              <FontAwesome5 name="clipboard-list" size={20} color="#fff" />
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
          <View className="flex flex-row justify-between w-full">
            <TouchableOpacity
              onPress={() => setActiveSection("sleepGraphs")}
              className={`flex-1 mx-1 ${
                activeSection === "sleepGraphs"
                  ? "bg-[#6366ff]"
                  : "bg-[#323d4f]"
              } rounded-lg p-3 justify-center`}
            >
              <Text className="font-bold text-center color-white">
                Gráficas
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setActiveSection("fitbitGraphs")}
              className={`flex-1 mx-1 ${
                activeSection === "fitbitGraphs"
                  ? "bg-[#6366ff]"
                  : "bg-[#323d4f]"
              } rounded-lg p-3 justify-center`}
            >
              <Text className="font-bold text-center color-white">
                Gráficas reservadas de Fitbit
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setActiveSection("drmSection")}
              className={`flex-1 mx-1 ${
                activeSection === "drmSection" ? "bg-[#6366ff]" : "bg-[#323d4f]"
              } rounded-lg p-3 justify-center`}
            >
              <Text className="font-bold text-center color-white">DRM</Text>
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
      </ScrollView>

      {/* Indicador de scroll - solo visible cuando hay más contenido */}
      {showScrollIndicator && (
        <Animated.View
          style={{
            opacity: scrollIndicatorOpacity,
            position: "absolute",
            bottom: 15,
            alignSelf: "center",
          }}
        >
          <View className="bg-[#6366ff]/20 px-4 py-2 rounded-full">
            <Text className="text-sm text-white">
              Desliza para más contenido
            </Text>
          </View>
        </Animated.View>
      )}
    </SafeAreaView>
  );
};

export default Estadisticas;
