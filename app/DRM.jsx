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
import React, { useState } from "react";
import { questions } from "../assets/DRMQuestions.json";
import SliderQuestion from "../components/SliderQuestion";
import OptionQuestion from "../components/OptionQuestion";
import TextQuestion from "../components/TextQuestion";
import { ChevronLeft } from "lucide-react-native";
import { router } from "expo-router";

const DRM = () => {
  //Definimos el estado para guardar el identificador de la pregunta junto su respuesta
  const [answers, setAnswers] = useState({});

  //Función para guardar la respuesta de una pregunta (id y respuesta que es el formato que espera la api para guardar la petición)
  const handleAnswer = (id, answer) => {
    setAnswers((prev) => ({
      ...prev,
      [id]: answer,
    }));
  };

  return (
    <SafeAreaView className="flex-1 w-full h-full bg-primary">
      <View className="flex flex-row gap-4 justify-start items-center p-4">
        <TouchableOpacity
          //Dejamos que el user pueda volver a las gráficas en caso de que haya entrado sin querer en la pestaña
          onPress={() => router.back()}
          className="flex flex-row gap-2 items-center py-2"
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
            TouchableOpacity
            className="bg-[#15db44] py-4 rounded-xl items-center w-full"
            //TODO:Cuando el user presione el botón llamamos al endpoint de nuestra api para generar el correspondiente informe
          >
            <Text className="text-lg text-white font-psemibold">
              Generar informe detallado
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default DRM;
