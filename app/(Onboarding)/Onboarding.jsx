import { View, Text } from "react-native";
import React, { useEffect, useState } from "react";
import Question1 from "./Question1";
import Question2 from "./Question2";
import Question3 from "./Question3";
import Question4 from "./Question4";
import Question5 from "./Question5";
//Importamos el almacenamiento asincrono de la aplicación donde siempre debemos guardar las cosas antes que en el almacenamiento local
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

export default function Onboarding() {
  //Función que se ejecuta al finalizar el cuestionario
  const onFinish = () => {
    AsyncStorage.setItem("hasCompletedOnboarding", "true");
    /*Una guardamos el valor para cuando la app se vuelva a abrir que no se muestre el cuestionario de nuevo
    , si queremos cambiar en caliente sin reiniciar la app, tenemos que hacer un push desde aqui a la primera pestaña en este caso Stats*/
    console.log("Cuestionario finalizado");
    router.push("/Stats");
  };

  //Definimos un estado para saber en que pregunta se encuentra el usuario
  const [question, setQuestion] = useState(1);

  const goToNextQuestion = () => {
    //Mientras esteamos en una pregunta menor a 5, podemos avanzar a la siguiente
    if (question < 5) setQuestion(question + 1);
  };

  const goToPreviousQuestion = () => {
    //Mientras esteamos en una pregunta mayor a 1, podemos retroceder a la anterior
    if (question > 1) setQuestion(question - 1);
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
  //Función para actualizar la respuesta de una pregunta específica
  const updateResponse = (question, answer) => {
    setResponses((prevState) => ({
      ...prevState,
      [question]: answer,
    }));
  };
  //hacemos también un console.log para ver en tiempo real las respuestas que se van guardando mediante el useEffect de responses
  useEffect(() => {
    console.log("Valor del objeto respuesta del usuario: ", responses);
  }, [responses]);

  //IMPORTANTE: Aqui tenemos que definir la función que manda este objeto de respuestas al backend para que se almacene en la base de datos

  return (
    //llamamos solo a la primera pregunta, ya que después cada una se encargará de llamar a la siguiente
    <View>
      {question === 1 && (
        <Question1
          updateResponse={updateResponse}
          nextQuestion={goToNextQuestion}
        />
      )}
      {question === 2 && (
        <Question2
          updateResponse={updateResponse}
          nextQuestion={goToNextQuestion}
          previousQuestion={goToPreviousQuestion}
        />
      )}
      {question === 3 && (
        <Question3
          updateResponse={updateResponse}
          nextQuestion={goToNextQuestion}
          previousQuestion={goToPreviousQuestion}
        />
      )}
      {question === 4 && (
        <Question4
          updateResponse={updateResponse}
          nextQuestion={goToNextQuestion}
          previousQuestion={goToPreviousQuestion}
        />
      )}
      {question === 5 && (
        <Question5
          updateResponse={updateResponse}
          previousQuestion={goToPreviousQuestion}
          onFinish={onFinish}
        />
      )}
    </View>
  );
}
