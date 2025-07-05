import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Animated,
  Platform,
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
import { router } from "expo-router";
import useSleep from "../../hooks/useSleep";
import { useAuthContext } from "../../context/AuthContext";
import useFlags from "../../hooks/useFlags";
import useNotifications from "../../hooks/useNotifications";
import { useLocalSearchParams } from "expo-router";
import {
  addHours,
  getMidnightToday,
  getLocalDateTimeString,
  toLocalDateTimeString,
} from "../../services/timeHelper";

/**
 * Función para formatear la hora de inicio del sueño de manera legible
 * @param {string} sleepStartTime - Hora de inicio en formato local
 * @return {string} - Hora formateada de manera legible
 */
const formatSleepStartTime = (sleepStartTime) => {
  if (!sleepStartTime) return null;

  console.log("Hora de inicio del sueño: ", sleepStartTime);

  try {
    // Si recibimos un Date object, lo usamos directamente. Si es string, lo parseamos
    const date =
      sleepStartTime instanceof Date
        ? sleepStartTime
        : new Date(sleepStartTime);
    const now = new Date();

    console.log("Fecha de inicio del sueño: ", date);

    // Obtener horas y minutos directamente
    const hours = date.getHours();
    const minutes = date.getMinutes();

    const hoursToString = hours.toString().padStart(2, "0");
    const minutesToString = minutes.toString().padStart(2, "0");

    console.log("horas: ", hoursToString);
    console.log("minutos: ", minutesToString);

    const timeString = `${hoursToString}:${minutesToString}`;

    console.log("Hora formateada: ", timeString);

    // Comparar fechas locales para determinar el día
    const dateLocal = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );
    const nowLocal = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterdayLocal = new Date(nowLocal.getTime() - 24 * 60 * 60 * 1000);

    if (dateLocal.getTime() === nowLocal.getTime()) {
      return `hoy a las ${timeString}`;
    } else if (dateLocal.getTime() === yesterdayLocal.getTime()) {
      return `ayer a las ${timeString}`;
    } else {
      return `el ${date.toLocaleDateString("es-ES")} a las ${timeString}`;
    }
  } catch (error) {
    console.error("Error al formatear la hora de inicio:", error);
    return null;
  }
};

// Función utilitaria para programar notificación de despertar
const createNotification = async (scheduleNotificationWithId, type) => {
  //hacemos la variable de trigger con tipo let para que dentro de los ifs se pueda reasignar el valor de la variable
  let trigger;
  // Calculamos 8 horas después de la hora actual
  if (type === "WakeUpReminder") {
    trigger = addHours(new Date(), 8);
  } else if (type === "SleepLogNearEnd") {
    //Se programa una notificación que se va a disparar pasadas 20 horas desde que el user se ha ido a dormir
    trigger = addHours(new Date(), 20);
  }

  try {
    const notificationData = {
      content: {
        title:
          type === "WakeUpReminder"
            ? "¿Pilas recargadas? 🔋"
            : "¡No lo dejes para el final! 💪",
        body:
          type === "WakeUpReminder"
            ? "No olvides registrar tu hora de despertar para calcular tu sueño. 💤"
            : "Quedan 4 horas para rellenar el cuestionario de hoy y obtener resultados. 🔥",
      },
      trigger: {
        type: "date",
        date: trigger,
      },
    };

    const notificationId = await scheduleNotificationWithId(
      type,
      notificationData
    );

    if (notificationId) {
      console.log("Notification scheduled for wake up: ", trigger);
    }
  } catch (error) {
    console.error("Error programando notificación de despertar:", error);
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
      wakeUpTimeDate,
      " - ",
      sleepStartTime
    );

    const duration = wakeUpTimeDate.getTime() - sleepStartTime.getTime(); //Hacemos la diferencia en milisegundos
    console.log("Duración del sueño: ", duration);

    if (duration < 0) {
      Alert.alert(
        "Tiempo inválido",
        "La fecha de despertar que se ha introducido es anterior a la hora en que se ha ido a dormir o no es válida"
      );
      return null;
    }

    //Si la resta da más de 24 horas no es un caso posible ya que el cuestionario solo esta activo durante 24 horas
    if (duration > 24 * 60 * 60 * 1000) {
      Alert.alert(
        "Tiempo inválido",
        "La diferencia entre la hora de despertar y la hora en la que se ha ido a dormir es superior a 24 horas"
      );
      return null;
    }

    //De la función de calcular la duración de lo que ha dormido el user devolvemos tanto la duración como la hora en la que se ha ido a dormir
    const response = {
      sleepTime: toLocalDateTimeString(sleepStartTime),
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
  const [sleepStartDisplay, setSleepStartDisplay] = useState(null); //Estado para mostrar la hora de inicio del sueño formateada

  // Ref para el ScrollView y para la animación del indicador de scroll
  const scrollViewRef = useRef(null);
  const scrollIndicatorOpacity = useRef(new Animated.Value(1)).current;
  const [showScrollIndicator, setShowScrollIndicator] = useState(true);

  const { userInfo, loading } = useAuthContext();

  //Parámetro local que le indica a stats a que sección debe acceder
  const { section } = useLocalSearchParams();

  //llamamos a las funciones que interacionan con los endpoints relacionados con las banderas diarias del user
  const { insertDailyFlag, deleteDailyFlag } = useFlags();

  // Hook de notificaciones
  const { cancelNotificationById, scheduleNotificationWithId } =
    useNotifications();

  const {
    createSleepLog,
    getSleepLogEndpoint,
    getDailySleepLog,
    sleepLog,
    sleepLogsDuration,
    hasMadeSleepLog,
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
          "Hora en la que el user se ha ido a dormir al cargar la app: ",
          sleepStartTime
        );
        const now = new Date();

        //Comprobamos si la hora en la que se ha ido a dormir lleva más de 24 horas almacenada en el storage
        if (now.getTime() - sleepStartTime.getTime() <= 24 * 60 * 60 * 1000) {
          setTimeout(() => setIsSleeping(true), 0);
          const formattedTime = formatSleepStartTime(sleepStartTime);
          setSleepStartDisplay(formattedTime);
        } else {
          //En este caso borramos la hora ya que al pasar tanto tiempo las medidas no serán consistentes y realistas para la hora de representarlas en la app
          await AsyncStorage.removeItem("sleepStart");
          setSleepStartDisplay(null);
        }
      } else {
        setSleepStartDisplay(null);
      }
    } catch (error) {
      console.error("Error al cargar la hora de inicio de sueño: ", error);
      setSleepStartDisplay(null);
    }
  };

  // Cargamos la información de la BD
  useEffect(() => {
    loadSleepData();
    checkDailySleepLog();
    //llamamos a la función para recuperar la info de los sleepLogs de los ultimos 7 dias
    getSleepLogEndpoint("7");

    //Si el user llama a replace desde DrmReport nos pasa por parametros section=drm por lo que en ese caso tenemos que reenderizar la sección de drm
    if (section === "drm") {
      setActiveSection("drmSection");
    }

    console.log("Fecha de medianoche en formato local: ", getMidnightToday());
    console.log("Fecha actual en formato local: ", getLocalDateTimeString());
  }, []);

  useEffect(() => {
    console.log("Valor de sleepStartDisplay: ", sleepStartDisplay);
  }, [sleepStartDisplay]);

  //Función para guardar la hora en la que el user se va a dormir
  const calculateSleepStart = async () => {
    //Si el usuario no estaba durmiendo, le damos la hora actual
    if (!isSleeping) {
      console.log("Valor de isSleeping en el if: ", isSleeping);
      try {
        //Obtenemos la hora actual en formato local
        const nowLocal = getLocalDateTimeString();

        console.log("Hora actual: ", nowLocal);

        // Guardamos como string en AsyncStorage
        await AsyncStorage.setItem("sleepStart", nowLocal);

        //Guardamos la bandera y el valor en la BD
        await insertDailyFlag("sleepStart", nowLocal);

        // Mandamos la notificación usando la fecha formateada si el user tiene como preferencia que quiere recibir notificaciones
        const notificationsEnabled = await AsyncStorage.getItem(
          "notifications"
        );
        if (notificationsEnabled !== "false" && notificationsEnabled !== null) {
          //llamamos a la función para programar la notificación de despertar pasando por argumentos la función scheduleNotificationWithId del hook de notificaciones
          await createNotification(
            scheduleNotificationWithId,
            "WakeUpReminder"
          );
          //llamamos a la función para programar la notificación de recordatorio para decirle al user que se le acaba el tiempo de hacer el cuestionario de hoy
          await createNotification(
            scheduleNotificationWithId,
            "SleepLogNearEnd"
          );
        }

        // Actualizamos el estado después de que se haya guardado la hora
        setTimeout(() => setIsSleeping(true), 0);

        // Formatear y guardar la hora de inicio para mostrarla
        const formattedTime = formatSleepStartTime(nowLocal);
        setSleepStartDisplay(formattedTime);

        console.log(
          "Hora en la que el user se ha ido a dormir que se va a guardar en el storage: ",
          nowLocal
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
              //eliminamos las notificaciones de recordatorio de despertar y de recordatorio para decirle al user que se le acaba el tiempo de hacer el cuestionario de hoy
              cancelNotificationById("WakeUpReminder");
              cancelNotificationById("SleepLogNearEnd");
              //Borramos la hora de inicio de sueño si el user decide reiniciar el registro
              await AsyncStorage.removeItem("sleepStart");
              setSleepStartDisplay(null);
            },
          },
        ]
      );
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
      // Validar que la hora de despertar sea válida, tenemos que pasarla en el mismo formato que tenemos la de cuando nos vamos a dormir
      const formattedWakeUpTime = toLocalDateTimeString(
        wakeUpFormResponse.wakeUpTime
      );
      const response = await calculateSleepDuration(formattedWakeUpTime);

      //Comprobamos si el objeto devuelto es null o no
      if (response) {
        console.log(
          "Hora en la que el user se ha ido a dormir al guardar la respuesta: ",
          response.sleepTime
        );

        console.log(
          "Hora en la que el user se ha despertado:",
          formattedWakeUpTime
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
          sleepTime: response.sleepTime,
          duration: response.duration,
          wakeUpTime: formattedWakeUpTime,
          question1: wakeUpFormResponse.question1,
          question2: wakeUpFormResponse.question2,
        };

        console.log("ENVIANDO A LA API:", newResponse);

        try {
          //Guardamos la respuesta del user en la BD
          const result = await createSleepLog(newResponse);

          // Verificar que la operación fue exitosa
          if (result && result.success === true) {
            /*
             * Solo cuando el user ha completado exitosamente el cuestionario matutino,
             * ejecutamos las operaciones de limpieza y actualización de estado
             */

            await AsyncStorage.removeItem("sleepStart");

            // cancelamos las notificaciones que habían sido programadas
            cancelNotificationById("WakeUpReminder");
            cancelNotificationById("SleepLogNearEnd");

            setIsSleeping(false);
            setHasDailySleepLog(true);
            setSleepStartDisplay(null);

            await getSleepLogEndpoint("7");
          } else {
            // Manejar específicamente el caso de entrada duplicada
            if (result?.errorType === "DUPLICATE_ENTRY") {
              let alertMessage =
                "El día correspondiente a la hora de despertar que has introducido ya tiene un registro de cuestionario matutino guardado.\n\nSolo se puede guardar un cuestionario matutino por día.\n\nPor ejemplo: si ayer iniciaste un registro de sueño y hoy te despiertas e intentas guardar el cuestionario, pero ayer ya guardaste otro cuestionario para ese mismo día, aparecerá este error.";

              Alert.alert("Registro duplicado", alertMessage, [
                {
                  text: "Aceptar",
                  style: "default",
                },
              ]);

              // No ejecutar operaciones de limpieza ya que hay conflicto de fechas
              return;
            } else {
              // Otros tipos de error de la API
              const errorMessage =
                result?.error || "Error desconocido del servidor";

              Alert.alert(
                "Error al guardar",
                `No se pudo guardar tu registro`,
                [
                  {
                    text: "Reintentar",
                    onPress: () => saveResponse(wakeUpFormResponse),
                  },
                  { text: "Cancelar", style: "cancel" },
                ]
              );

              // No ejecutar operaciones de limpieza si falla la API
              return;
            }
          }
        } catch (apiError) {
          Alert.alert(
            "Error de conexión",
            "No se pudo conectar con el servidor. Verifica tu conexión a internet e inténtalo de nuevo.",
            [
              {
                text: "Reintentar",
                onPress: () => saveResponse(wakeUpFormResponse),
              },
              { text: "Cancelar", style: "cancel" },
            ]
          );

          // No ejecutar operaciones de limpieza si hay error de conexión
          return;
        }
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
        return (
          <SleepGraphs
            userInfo={userInfo}
            hasMadeSleepLog={hasMadeSleepLog}
            sleepLogsDuration={sleepLogsDuration}
          />
        );
      case "fitbitGraphs":
        return <FitbitUserGraphs />;
      case "drmSection":
        return (
          <View className="flex flex-col gap-6 mt-4 w-full">
            <Text className="mb-2 ml-2 text-lg font-semibold text-white">
              Day Reconstruction Method
            </Text>

            {/* Card layout for DRM buttons */}
            <View className="flex-row gap-4 justify-between w-full">
              {/* Questionnaire Card */}
              <TouchableOpacity
                className={`flex-1 p-5 rounded-xl border border-[#6366ff]/20 ${
                  !hasMadeSleepLog ? "opacity-20" : ""
                }`}
                onPress={() => router.push("/DRM")}
                disabled={!hasMadeSleepLog}
              >
                <View className="justify-center items-center">
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
                  {hasMadeSleepLog ? (
                    <Text className="text-sm text-center text-gray-400">
                      Completa el formulario para obtener tu informe
                    </Text>
                  ) : (
                    <Text className="text-sm text-center text-gray-400">
                      Completa al menos un cuestionario de sueño en la última
                      semana para obtener tu informe
                    </Text>
                  )}
                </View>
              </TouchableOpacity>

              {/* Report Card */}
              <TouchableOpacity
                className="flex-1  p-5 rounded-xl border border-[#6366ff]/20"
                onPress={() => router.push("/DrmReport")}
              >
                <View className="justify-center items-center">
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
          paddingBottom: Platform.OS === "android" ? 0 : 20, //Borramos el padding inferior en Android
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
          <View className="flex flex-row gap-4 justify-start">
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
              <FontAwesome5 name="clipboard-check" size={18} color="#15db44" />
              <Text className="ml-2 color-white">
                Registro matutino completado
              </Text>
            </View>
          )}

          {/* Mostrar hora de inicio del sueño cuando el usuario está durmiendo */}
          {isSleeping && sleepStartDisplay && (
            <View className="flex-row items-center justify-between bg-[#2a3952] p-4 rounded-lg border-l-4 border-[#6366ff]">
              <View className="flex-row flex-1 items-center">
                <View className="bg-[#6366ff]/20 p-2 rounded-full mr-3">
                  <Feather name="moon" size={16} color="#6366ff" />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-medium color-white">
                    Registro iniciado
                  </Text>
                  <Text className="mt-1 text-xs color-gray-400">
                    Comenzaste a dormir {sleepStartDisplay}
                  </Text>
                </View>
              </View>
              <View className="bg-[#6366ff]/10 px-3 py-1 rounded-full">
                <Text className="text-xs font-medium color-[#6366ff]">
                  Activo
                </Text>
              </View>
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
          <View className="flex flex-col gap-4 justify-between w-full">
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
