import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Linking,
} from "react-native";
import React, { useEffect, useState } from "react";
import { questions } from "../assets/DRMQuestions.json";
import SliderQuestion from "../components/SliderQuestion";
import OptionQuestion from "../components/OptionQuestion";
import TextQuestion from "../components/TextQuestion";
import { ChevronLeft } from "lucide-react-native";
import { router } from "expo-router";
import { getDailyReportFlag } from "../hooks/useDRM";
import useDRM from "../hooks/useDRM";

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

    setReportButtonState("generating");

    try {
      await saveDrmAnswers(answers);
      setReportButtonState("generated");
      //Una vez que se ha generado el informe lo primero es borrar las respuestas para que no se queden guardadas
      setAnswers({});
    } catch (error) {
      console.error("Error generando tip:", error);
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
        return "Informe de hoy generado";
      default:
        return "Generar informe detallado";
    }
  };

  const getButtonStyle = () => {
    switch (reportButtonState) {
      case "generating":
        return "bg-[#15db44]/60";
      case "generated":
        return "bg-gray-400";
      default:
        return "bg-[#15db44]";
    }
  };

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

      <Text className="mx-4 mb-4 text-base text-center text-white">
        Este cuestionario está pensado para que puedas obtener una valoración de
        tu toma de decisiones del día anterior siguiendo la metodología{" "}
        {/*Esto sirve para meter un espacio en el texto*/}
        <Text
          className="italic text-blue-300 underline"
          //Cuando presionemos en el texto abrimos la url de la metodología, así el usuario puede tener más información sobre en que consiste la metodología
          onPress={() =>
            Linking.openURL("https://pubmed.ncbi.nlm.nih.gov/15576620/")
          }
        >
          Day Reconstruction Method.
        </Text>
      </Text>

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
            gap: 20,
            paddingTop: 20,
            paddingBottom: 40,
            width: "95%",
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
          {/*Botón para generar el informe detallado*/}
          <TouchableOpacity
            className={`${getButtonStyle()} py-4 rounded-xl items-center w-full`}
            onPress={submit}
            disabled={
              reportButtonState === "generating" ||
              reportButtonState === "generated"
            }
          >
            <Text className="text-lg text-white font-psemibold">
              {getButtonText()}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default DRM;
