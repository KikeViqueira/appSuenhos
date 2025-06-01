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
import { Feather, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { getDailyReportFlag } from "../hooks/useDRM";
import useDRM from "../hooks/useDRM";
import { LinearGradient } from "expo-linear-gradient";

const DRM = () => {
  const { saveDrmAnswers, loading, error } = useDRM();

  //Definimos el estado para guardar el identificador de la pregunta junto su respuesta
  const [answers, setAnswers] = useState({});
  const [reportButtonState, setReportButtonState] = useState("default"); //Controla el estado del botón a la hora de generar el informe

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
      //Una vez que se ha generado el informe lo primero es borrar las respuestas para que no se queden guardadas
      setAnswers({});
    } catch (error) {
      console.error("Error generando informe:", error);
      setReportButtonState("default");
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
      if (reportFlag) {
        setReportButtonState("generated");
      } else {
        setReportButtonState("default");
      }
    } catch (error) {
      console.error("Error al verificar el estado del informe diario:", error);
      setReportButtonState("default");
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
        return "✓ Informe de hoy generado";
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
            <Text className="font-bold text-[#6366ff]" style={{ fontSize: 20 }}>
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
                  reportButtonState === "default" ? "#15db44" : "transparent",
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
                  <MaterialIcons name="check-circle" size={20} color="white" />
                )}
                {reportButtonState === "default" && (
                  <MaterialIcons name="assessment" size={20} color="white" />
                )}
                <Text className="text-lg font-semibold text-white">
                  {getButtonText()}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default DRM;
