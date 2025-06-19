import React, { useEffect, useState } from "react";
import MultipleOptionOnboarding from "../../components/MultipleOptionOnboarding";
import AgeQuestion from "./AgeQuestion";
//Importamos el almacenamiento asincrono de la aplicación donde siempre debemos guardar las cosas antes que en el almacenamiento local
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import OnboardingMultipleOptionsQuestions from "../../assets/OnboardingMultipleOptionsQuestions.json";
import { SafeAreaView } from "react-native-safe-area-context";
import useOnboarding from "../../hooks/useOnboarding";
import { markOnboardingAsCompleted } from "../../services/onboardingService";
import { useAuthContext } from "../../context/AuthContext";
import { View, Text, StatusBar } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

export default function Onboarding() {
  const { saveOnboardingAnswers } = useOnboarding();
  const { updateOnboardingStatus } = useAuthContext();

  /* Función que se ejecuta al finalizar el cuestionario
   * Recibimos del callback de la función updateResponse el objeto de respuestas actualizado y lo enviamos a la API
   * */
  const onFinish = (data) => {
    console.log("Respuestas del usuario que se enviarán a la Api: ", responses);
    //llamamos a al endpoint correspondiente en la API para guardar las respuestas del usuario
    saveOnboardingAnswers(data);
    //Guardamos en el almacenamiento asincrono que el usuario ha completado el cuestionario, ya que la idea de este es que se haga solo una vez desde que se crea la cuenta
    markOnboardingAsCompleted();
    //Actualizamos el estado del onboarding en el contexto de la aplicación
    updateOnboardingStatus(true);
    /*
     * Una guardamos el valor para cuando la app se vuelva a abrir que no se muestre el cuestionario de nuevo
     * , si queremos cambiar en caliente sin reiniciar la app, tenemos que hacer un push desde aqui a la primera pestaña en este caso Stats*/
    console.log("Cuestionario finalizado");
    router.replace("/Stats"); //USamosla función replace para prevenir la acción de retroceso
  };

  //Definimos un estado para saber en que pregunta se encuentra el usuario
  const [question, setQuestion] = useState(1);

  const goToNextQuestion = () => {
    //Mientras esteamos en una pregunta menor a 5, podemos avanzar a la siguiente
    if (question < 5) setQuestion(question + 1);
  };

  const goToPreviousQuestion = () => {
    //Mientras esteamos en una pregunta mayor a 1, podemos retroceder a la anterior
    if (question > 1) {
      // Borrar la respuesta de la pregunta actual antes de retroceder
      const currentQuestionKey = `question${question}`;
      setResponses((prevState) => ({
        ...prevState,
        [currentQuestionKey]: "", // Limpiamos la respuesta actual
      }));

      // Navegar a la pregunta anterior
      setQuestion(question - 1);
    }
  };

  //Definimos el useEffect para saber en tiempo real en que pregunta se encuentra el usuario, ya que los set por naturaleza son asíncronos
  useEffect(() => {
    console.log("Pregunta actual: ", question);
  }, [question]);

  //Definimos un estado para almacenar el objeto de respuestas a las distintas preguntas iniciales de tal manera que siempre este actualizado
  const [responses, setResponses] = useState({
    question1: "",
    question2: "",
    question3: "",
    question4: "",
    question5: "",
  });
  /*
   * Función para actualizar la respuesta de una pregunta específica
   *
   * tenemos que pasarle un tercer parámetro que consiste en una función callback, esta es necesaria para que donde llamemos a la función se ejecute de manera correcta
   * con el estado de las respuestas bien actualizado, esto es útil para pasar a la siguiente pregunta o finalizar el cuestionario de manera consistente en lo
   * que viene siendo en este caso en el componente MultipleOptionOnboarding
   * */
  const updateResponse = (question, answer, callback) => {
    setResponses((prevState) => {
      const newState = { ...prevState, [question]: answer };
      // Si se proporcionó un callback, lo ejecutamos con el nuevo estado
      if (callback) callback(newState);
      return newState; //Indicamos a react cual es el nuevo estado
    });
  };
  //hacemos también un console.log para ver en tiempo real las respuestas que se van guardando mediante el useEffect de responses
  useEffect(() => {
    console.log("Valor del objeto respuesta del usuario: ", responses);
  }, [responses]);

  //Definimoslas preguntas en variables extrayendolas del archivo JSON
  const question1 = OnboardingMultipleOptionsQuestions.questions[0];
  const question2 = OnboardingMultipleOptionsQuestions.questions[1];
  const question4 = OnboardingMultipleOptionsQuestions.questions[2];
  const question5 = OnboardingMultipleOptionsQuestions.questions[3];

  // Calcular progreso basado en respuestas completadas
  const getProgress = () => {
    const totalQuestions = 5;
    // Contar cuántas preguntas han sido respondidas
    const answeredQuestions = Object.values(responses).filter(
      (response) => response !== ""
    ).length;
    const currentProgress = (answeredQuestions / totalQuestions) * 100;
    return {
      current: question,
      total: totalQuestions,
      answered: answeredQuestions,
      percentage: currentProgress,
    };
  };

  const progress = getProgress();

  // Obtener título de la pantalla actual
  const getCurrentTitle = () => {
    switch (question) {
      case 1:
        return "Configuración inicial";
      case 2:
        return "Personalización";
      case 3:
        return "Información personal";
      case 4:
        return "Preferencias";
      case 5:
        return "Finalización";
      default:
        return "Onboarding";
    }
  };

  return (
    <SafeAreaView className="w-full h-full bg-primary">
      {/* Header con barra de progreso */}
      <View className="bg-[#0e172a] border-b border-[#1e2a47] pb-6 pt-4">
        {/* Título y paso actual */}
        <View className="px-6 mb-4">
          <View className="flex-row justify-between items-center mb-2">
            <View className="flex-row gap-3 items-center">
              <MaterialIcons name="settings" size={24} color="#6366ff" />
              <Text className="text-lg font-bold text-white">
                {getCurrentTitle()}
              </Text>
            </View>
            <Text className="text-base text-gray-400">
              Paso {progress.current} de {progress.total}
            </Text>
          </View>

          <Text className="text-sm text-gray-400">
            Configura tu experiencia personalizada
          </Text>
        </View>

        {/* Barra de progreso principal */}
        <View className="px-6">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-base font-medium text-gray-300">
              Progreso de configuración
            </Text>
            <Text className="text-[#6366ff] text-base font-bold">
              {Math.round(progress.percentage)}%
            </Text>
          </View>

          {/* Contenedor de la barra */}
          <View className="w-full h-6 bg-[#1a2332] rounded-full border border-[#252e40] overflow-hidden">
            {/* Barra de progreso simple */}
            {progress.percentage > 0 && (
              <View
                style={{
                  width: `${progress.percentage}%`,
                  height: "100%",
                  borderRadius: 12,
                  backgroundColor: "#6366ff",
                }}
              />
            )}
          </View>
        </View>
      </View>

      {/* Contenido principal */}
      <View className="flex-1">
        {question === 1 && (
          <MultipleOptionOnboarding
            questionText={question1.title}
            options={question1.options}
            questionKey={question1.id}
            updateResponse={updateResponse}
            nextQuestion={goToNextQuestion}
            currentResponse={responses.question1}
            first={true}
          />
        )}

        {question === 2 && (
          <MultipleOptionOnboarding
            questionText={question2.title}
            options={question2.options}
            questionKey={question2.id}
            updateResponse={updateResponse}
            nextQuestion={goToNextQuestion}
            previousQuestion={goToPreviousQuestion}
            currentResponse={responses.question2}
          />
        )}

        {question === 3 && (
          <AgeQuestion
            updateResponse={updateResponse}
            nextQuestion={goToNextQuestion}
            previousQuestion={goToPreviousQuestion}
            currentResponse={responses.question3}
          />
        )}

        {question === 4 && (
          <MultipleOptionOnboarding
            questionText={question4.title}
            options={question4.options}
            questionKey={question4.id}
            updateResponse={updateResponse}
            nextQuestion={goToNextQuestion}
            previousQuestion={goToPreviousQuestion}
            currentResponse={responses.question4}
          />
        )}

        {question === 5 && (
          <MultipleOptionOnboarding
            questionText={question5.title}
            options={question5.options}
            questionKey={question5.id}
            updateResponse={updateResponse}
            onFinish={onFinish}
            previousQuestion={goToPreviousQuestion}
            currentResponse={responses.question5}
            final={true}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
