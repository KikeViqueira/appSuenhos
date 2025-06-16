import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Linking,
  Alert,
} from "react-native";
import React, { useEffect, useState } from "react";
import { questions } from "../assets/DRMQuestions.json";
import SliderQuestion from "../components/SliderQuestion";
import OptionQuestion from "../components/OptionQuestion";
import TextQuestion from "../components/TextQuestion";
import ConfirmationIndicator from "../components/ConfirmationIndicator";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { getDailyReportFlag } from "../hooks/useDRM";
import useDRM from "../hooks/useDRM";
import { LinearGradient } from "expo-linear-gradient";
import useNotifications from "../hooks/useNotifications";
import AsyncStorage from "@react-native-async-storage/async-storage";

const DRM = () => {
  const { saveDrmAnswers, loading, error } = useDRM();

  //Definimos el estado para guardar el identificador de la pregunta junto su respuesta
  const [answers, setAnswers] = useState({});
  const [reportButtonState, setReportButtonState] = useState("default"); //Controla el estado del botón a la hora de generar el informe
  //Estado para saber si tenemos que enseñar al user el contenido de que vuelva mañana a hacer el siguiente form cuando ha hecho el de hoy
  const [hasCompletedToday, setHasCompletedToday] = useState(false);

  // Hook de notificaciones
  const { scheduleNotificationWithId } = useNotifications();

  // Función utilitaria para programar notificación de recordatorio de tip diario
  const createDailyTipNotification = async () => {
    try {
      // Calcular el trigger: 2 horas después de la hora actual
      const now = new Date();
      const triggerTime = new Date(now.getTime() + 2 * 60 * 60 * 1000);

      // Obtener la medianoche del mismo día
      const midnightToday = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        23,
        59,
        59,
        999
      );

      // Verificar que el trigger no sea superior a las 12 de la noche del mismo día
      if (triggerTime > midnightToday) {
        console.log(
          "⏰ No se programa notificación de tip: el horario excede las 12 de la noche"
        );
        return null;
      }

      const notificationData = {
        content: {
          title: "💡 ¡Crea tu tip personalizado!",
          body: "Genera un consejo único basado en tu informe DRM. Solo disponible una vez al día. 🌟",
        },
        trigger: {
          type: "date",
          date: triggerTime,
        },
      };

      const notificationId = await scheduleNotificationWithId(
        "DailyTip",
        notificationData
      );

      if (notificationId) {
        console.log(
          "🔔 Notificación de tip diario programada para:",
          triggerTime
        );
      }
    } catch (error) {
      console.error("Error programando notificación de tip diario:", error);
    }
  };

  useEffect(() => {
    console.log("Respuestas del cuestionario actualmente: ", answers);
  });

  //Función para guardar la respuesta de una pregunta (id y respuesta que es el formato que espera la api para guardar la petición)
  const handleAnswer = (id, answer) => {
    setAnswers((prev) => ({
      ...prev,
      [id]: answer, //si existe el campo con ese id, actualiza el valor, en caso contrario crea la entrada con el id si no hay una previa
    }));
  };

  //Función para mandar las respuestas a la API
  const submit = async () => {
    if (reportButtonState === "generating" || reportButtonState === "generated")
      return;

    // Validar que se hayan respondido las preguntas obligatorias
    const mandatoryQuestions = questions.filter(
      (q) => !q.title.toLowerCase().includes("opcional")
    );

    const answeredMandatory = mandatoryQuestions.filter((q) =>
      answers.hasOwnProperty(q.id)
    ).length;

    if (answeredMandatory < mandatoryQuestions.length) {
      Alert.alert(
        "Cuestionario incompleto",
        `Por favor, completa todas las preguntas obligatorias. Te faltan ${
          mandatoryQuestions.length - answeredMandatory
        } por responder.`
      );
      return;
    }

    setReportButtonState("generating");

    try {
      await saveDrmAnswers(answers);
      setReportButtonState("generated");
      setHasCompletedToday(true);

      //tenemos que comprobar el valor de las notificaciones en el AsyncStorage
      const notificationsEnabled = await AsyncStorage.getItem("notifications");
      if (notificationsEnabled !== "false" && notificationsEnabled !== null) {
        // Programar notificación de recordatorio para generar tip personalizado
        await createDailyTipNotification();
      }

      //Una vez que se ha generado el informe lo primero es borrar las respuestas para que no se queden guardadas
      setAnswers({});
    } catch (error) {
      setReportButtonState("default");
      setHasCompletedToday(false);
      Alert.alert(
        "Error",
        "No se pudo generar el informe. Inténtalo de nuevo más tarde."
      );
    }
  };

  // Función para verificar si se ha generado un informe hoy
  const checkDailyReportStatus = async () => {
    try {
      const reportFlag = await getDailyReportFlag();
      console.log("REPORT FLAG GETTED: ", reportFlag);
      if (reportFlag) {
        setReportButtonState("generated");
        setHasCompletedToday(true);
      } else {
        setReportButtonState("default");
        setHasCompletedToday(false);
      }
    } catch (error) {
      console.error("Error al verificar el estado del informe diario:", error);
      setReportButtonState("default");
      setHasCompletedToday(false);
    }
  };

  useEffect(() => {
    //Cuando se monta el componente comprobamos si el user ya ha generado un informe hoy o no
    checkDailyReportStatus();
  }, []);

  // Determinar el texto y estilo del botón según el estado
  const getButtonText = () => {
    switch (reportButtonState) {
      case "generating":
        return "Generando informe...";
      case "generated":
        return "Informe de hoy generado";
      default:
        return "Generar informe detallado";
    }
  };

  const getButtonStyle = () => {
    switch (reportButtonState) {
      case "generating":
        return "bg-[#15db44]/70";
      case "generated":
        return "bg-gray-500";
      default:
        return "bg-[#15db44]";
    }
  };

  // Calcular progreso solo para preguntas obligatorias
  const getProgress = () => {
    // Filtrar preguntas obligatorias (excluir las que tienen "opcional" en el título)
    const mandatoryQuestions = questions.filter(
      (q) => !q.title.toLowerCase().includes("opcional")
    );

    const answeredMandatory = mandatoryQuestions.filter((q) =>
      answers.hasOwnProperty(q.id)
    ).length;

    return {
      answered: answeredMandatory,
      total: mandatoryQuestions.length,
      percentage:
        mandatoryQuestions.length > 0
          ? (answeredMandatory / mandatoryQuestions.length) * 100
          : 0,
    };
  };

  const progress = getProgress();

  return (
    <SafeAreaView className="flex-1 w-full h-full bg-primary">
      {hasCompletedToday ? (
        <>
          {/* Header */}
          <View className="bg-[#0e172a] border-b border-[#1e2a47]">
            <View className="flex flex-row items-center justify-between gap-4 p-4">
              <TouchableOpacity
                onPress={() => router.back()}
                className="flex flex-row items-center gap-2 px-1 py-2"
              >
                <Feather name="chevron-left" size={24} color="white" />
              </TouchableOpacity>

              <View className="items-center flex-1">
                <Text
                  className="font-bold text-[#6366ff]"
                  style={{ fontSize: 20 }}
                >
                  Cuestionario DRM
                </Text>
                <Text className="mt-1 text-xs text-gray-400">
                  Informe completado
                </Text>
              </View>

              <View className="items-center w-8">
                <MaterialIcons name="check-circle" size={24} color="#15db44" />
              </View>
            </View>
          </View>

          {/* Contenido principal */}
          <View className="items-center justify-center flex-1 px-4 mt-10">
            {/* Contenedor principal con distribución flexible */}
            <View className="justify-center flex-1 w-full max-w-sm">
              {/* Sección superior: Indicador y títulos */}
              <View className="items-center justify-end flex-1 mb-10">
                {/* Indicador de confirmación más compacto */}
                <View className="items-center mb-4">
                  <View style={{ transform: [{ scale: 0.8 }] }}>
                    <ConfirmationIndicator />
                  </View>
                </View>

                {/* Título principal */}
                <Text className="mb-4 text-2xl font-bold text-center text-white">
                  ¡Informe Completado!
                </Text>

                {/* Subtítulo más compacto */}
                <Text className="text-base leading-5 text-center text-gray-300">
                  Tu informe DRM de hoy ha sido generado exitosamente
                </Text>
              </View>

              {/* Sección central: Información */}
              <View className="justify-center flex-1 py-4 mb-4">
                {/* Tarjeta de información más compacta */}
                <View className="bg-[#0e172a] rounded-xl p-4 border border-[#1e2a47]">
                  {/* Estado del informe */}
                  <View className="flex-row items-center gap-3 mb-5">
                    <View className="bg-[#15db44]/10 p-2 rounded-full">
                      <MaterialIcons
                        name="check-circle"
                        size={24}
                        color="#15db44"
                      />
                    </View>
                    <View className="flex-1">
                      <Text className="font-semibold text-white">
                        Informe de hoy
                      </Text>
                      <Text className="text-[#15db44] text-sm font-medium">
                        Completado exitosamente
                      </Text>
                    </View>
                  </View>

                  {/* Información adicional */}
                  <View className="bg-[#1a2332] p-3 rounded-lg border border-[#252e40] mb-4">
                    <View className="flex-row items-center gap-2 mb-2">
                      <MaterialIcons
                        name="info-outline"
                        size={18}
                        color="#6366ff"
                      />
                      <Text className="text-[#6366ff] font-medium text-sm">
                        Disponible para consulta
                      </Text>
                    </View>
                    <Text className="text-xs leading-4 text-gray-400">
                      Tu informe estará disponible para consulta en la sección
                      correspondiente de la aplicación.
                    </Text>
                  </View>

                  {/* Información de próximo informe */}
                  <View className="bg-[#1a2332] p-3 rounded-lg border border-[#252e40]">
                    <View className="flex-row items-center gap-2 mb-2">
                      <MaterialIcons
                        name="schedule"
                        size={18}
                        color="#f59e0b"
                      />
                      <Text className="text-[#f59e0b] font-medium text-sm">
                        Próximo informe
                      </Text>
                    </View>
                    <Text className="text-xs leading-4 text-gray-400">
                      Podrás realizar un nuevo cuestionario DRM mañana para
                      evaluar tu siguiente día.
                    </Text>
                  </View>
                </View>
              </View>

              {/* Sección inferior: Botones */}
              <View className="justify-start flex-1 pt-6">
                <View className="gap-4">
                  {/* Botón principal - Ver informe generado*/}
                  <TouchableOpacity
                    className="bg-[#6366ff] py-4 px-6 rounded-xl flex-row items-center justify-center gap-2"
                    onPress={() => {
                      router.push("./DrmReport");
                    }}
                    style={{
                      shadowColor: "#6366ff",
                      shadowOffset: { width: 0, height: 3 },
                      shadowOpacity: 0.3,
                      shadowRadius: 6,
                      elevation: 5,
                    }}
                  >
                    <MaterialIcons name="assessment" size={20} color="white" />
                    <Text className="text-base font-bold text-white">
                      Ver informe generado
                    </Text>
                  </TouchableOpacity>

                  {/* Botón secundario - Volver */}
                  <TouchableOpacity
                    className="bg-[#1a2332] border border-[#2d3748] py-4 px-6 rounded-xl flex-row items-center justify-center gap-2"
                    onPress={() => router.back()}
                    style={{
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.1,
                      shadowRadius: 4,
                      elevation: 2,
                    }}
                  >
                    <Feather name="arrow-left" size={18} color="#9ca3af" />
                    <Text className="text-sm font-semibold text-gray-300">
                      Volver a la sección DRM
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </>
      ) : (
        <>
          {/* Header mejorado */}
          <View className="bg-[#0e172a] border-b border-[#1e2a47]">
            <View className="flex flex-row items-center justify-between gap-4 p-4">
              <TouchableOpacity
                onPress={() => router.back()}
                className="flex flex-row items-center gap-2 px-1 py-2"
              >
                <Feather name="chevron-left" size={24} color="white" />
              </TouchableOpacity>

              <View className="items-center flex-1">
                <Text
                  className="font-bold text-[#6366ff]"
                  style={{ fontSize: 20 }}
                >
                  Cuestionario DRM
                </Text>

                {/* Barra de progreso */}
                <View className="mt-3 w-[90%]">
                  <View className="flex-row items-center justify-between mb-2">
                    <Text className="text-xs font-medium text-gray-300">
                      Progreso
                    </Text>
                    <Text className="text-[#6366ff] text-xs font-bold">
                      {Math.round(progress.percentage)}%
                    </Text>
                  </View>

                  {/* Contenedor de la barra con sombra */}
                  <View
                    className="w-full h-3 bg-[#1a2332] rounded-full border border-[#252e40] overflow-hidden"
                    style={{
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.25,
                      shadowRadius: 3,
                      elevation: 4,
                    }}
                  >
                    {/* Barra de progreso con gradiente */}
                    {progress.percentage > 0 && (
                      <LinearGradient
                        colors={["#6366ff", "#8b5cf6"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={{
                          width: `${progress.percentage}%`,
                          height: "100%",
                          borderRadius: 12,
                          shadowColor: "#6366ff",
                          shadowOffset: { width: 0, height: 1 },
                          shadowOpacity: 0.6,
                          shadowRadius: 4,
                          elevation: 3,
                        }}
                      />
                    )}
                  </View>

                  {progress.answered > 0 && (
                    <Text className="mt-2 text-xs text-center text-gray-400">
                      {progress.answered} de {progress.total} obligatorias
                      completadas
                    </Text>
                  )}
                </View>
              </View>

              <View className="items-center w-8">
                <MaterialIcons name="psychology" size={24} color="#6366ff" />
              </View>
            </View>
          </View>

          {/* Descripción */}
          <View className="mx-4 mt-4 mb-4">
            <View className="bg-[#1a2332] p-4 rounded-lg border border-[#252e40]">
              <Text className="text-base leading-6 text-white">
                Evalúa tu toma de decisiones del día anterior siguiendo la
                metodología{" "}
                <Text
                  className="italic text-[#6366ff] underline"
                  onPress={() =>
                    Linking.openURL("https://pubmed.ncbi.nlm.nih.gov/15576620/")
                  }
                >
                  Day Reconstruction Method
                </Text>
                .
              </Text>
            </View>
          </View>

          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            className="flex-1"
          >
            <ScrollView
              contentContainerStyle={{
                display: "flex",
                alignSelf: "center",
                alignItems: "center",
                justifyContent: "center",
                gap: 36,
                paddingTop: 20,
                paddingBottom: 40,
                width: "90%",
              }}
              showsVerticalScrollIndicator={true}
              indicatorStyle="white"
            >
              {/*Importamos las preguntas y segun el type que tengan reendrizamos el componente concreto */}
              {questions.map((question) => {
                if (question.type === "scale") {
                  return (
                    <SliderQuestion
                      key={question.id}
                      question={question}
                      onAnswer={handleAnswer}
                    />
                  );
                } else if (question.type === "options") {
                  return (
                    <OptionQuestion
                      key={question.id}
                      question={question}
                      onAnswer={handleAnswer}
                    />
                  );
                } else if (question.type === "text") {
                  return (
                    <TextQuestion
                      key={question.id}
                      question={question}
                      onAnswer={handleAnswer}
                    />
                  );
                }
              })}

              {/* Botón de generar informe */}
              <View className="w-full">
                <TouchableOpacity
                  className={`items-center py-4 rounded-xl ${getButtonStyle()}`}
                  onPress={submit}
                  disabled={
                    reportButtonState === "generating" ||
                    reportButtonState === "generated"
                  }
                  style={{
                    shadowColor:
                      reportButtonState === "default"
                        ? "#15db44"
                        : "transparent",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.3,
                    shadowRadius: 4,
                    elevation: 4,
                  }}
                >
                  <View className="flex-row items-center gap-2">
                    {reportButtonState === "generating" && (
                      <MaterialIcons
                        name="hourglass-empty"
                        size={20}
                        color="white"
                      />
                    )}
                    {reportButtonState === "generated" && (
                      <MaterialIcons
                        name="check-circle"
                        size={20}
                        color="white"
                      />
                    )}
                    {reportButtonState === "default" && (
                      <MaterialIcons
                        name="assessment"
                        size={20}
                        color="white"
                      />
                    )}
                    <Text className="text-lg font-semibold text-white">
                      {getButtonText()}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </>
      )}
    </SafeAreaView>
  );
};

export default DRM;
