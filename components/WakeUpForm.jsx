import {
  View,
  Text,
  Modal,
  SafeAreaView,
  Button,
  ScrollView,
  Alert,
  Platform,
  TouchableOpacity,
} from "react-native";
import React, { useEffect, useState } from "react";
import DateTimePicker from "@react-native-community/datetimepicker";
import { questions } from "../assets/wakeUpQuestions";
import OptionQuestion from "./OptionQuestion";

const WakeUpForm = ({ isVisible, onClose, onSave }) => {
  //Definimos los estados para guardar las distintas partes de la respuesta
  const [time, setTime] = useState(new Date());
  const [answers, setAnswers] = useState({
    //Definimos los atributos del objeto para poder hacer comprobaciones por el componente
    wakeUpTime: "",
    question1: "",
    question2: "",
  });
  //Estado para comprobar si la hora que se ha seleccionado es válida o no debido a que date no se puede poner a null
  const [isValidTime, setIsValidTime] = useState(true);

  //Función para guardar la respuesta de una pregunta (id y respuesta que es el formato que espera la api para guardar la petición)
  const handleAnswer = (id, answer) => {
    setAnswers((prev) => ({
      ...prev,
      [id]: answer, //si existe el campo con ese id, actualiza el valor, en caso contrario crea la entrada con el id si no hay una previa
    }));
  };

  //actualizamos la hora actual cada vez que abrimos el modal teniendo como referencia la bandera que nos indica si esta abierto o no
  useEffect(() => {
    if (isVisible) setTime(new Date());
    console.log("hora actual al reenderizar el componente: ", time);
  }, [isVisible]);

  //Función que se encarga de validar si se han respondido todas las preguntas
  const hasQuestionsAnswered = () => {
    return answers.question1 !== "" && answers.question2 !== "";
  };

  //Función que se encarga de enviar los datos de la respuesta al componente padre y cerrar el modal
  const handleSave = () => {
    if (!hasQuestionsAnswered()) {
      Alert.alert(
        "Formato Incorrecto",
        "Por favor, rellena todas las preguntas"
      );
      return;
    }

    //Si no se ejecuta la alarma anterior y llegamos a este if sabemos que las preguntas han sido respondidas y ahora solo nos queda comprobar si la hora ha sido registrada correctamente
    if (!isValidTime) {
      Alert.alert(
        "Formato Incorrecto",
        "Por favor, introduce una hora menor o igual a la actual para obetener medidas correctas"
      );
      return;
    }

    //Ambas funciones se reciben del componente padre, en este caso WakeUpForm.jsx
    onSave(answers);
    //Una vez guardamos la respuesta, tenemos que poner el estado a null para que la próxima vez que se abra el formulario estén vacíos
    setAnswers({});

    onClose();
  };

  //Estado para saber cuando estamos controlando el comportamiento del timePicker en Android, inicialmente es falso
  const [showTimePicker, setShowTimePicker] = useState(false);

  //Función para guardar el valor que se ha seleccionado en el timePicker y poner la bandera a false para evitar su continua abertura en pantalla
  const handleTimeChange = (event, selectedTime) => {
    if (Platform.OS === "android") setShowTimePicker(false);
    //tenemos que comprobar que la hora que ponga el user que se ha levantado sea menor o igual a la hora actual, si no podrían exister medidas érroneas
    if (selectedTime && selectedTime <= new Date()) {
      handleAnswer("wakeUpTime", selectedTime);
      setIsValidTime(true);
    } else {
      setIsValidTime(false);
    }
  };

  //Función que se asigna al botón correspondiente paara abrir el timePicker en Android
  const openTimePicker = () => {
    if (Platform.OS === "android") setShowTimePicker(true);
  };

  return (
    //Cuando renderizamos el modal, este se muestra en un nuevo contexto encima de la pantalla principal
    //Por lo tanto si queremos que lo que este dentro del modal se vea correctamente tenemos que poner dentro de este componente un SafeAreaView
    <View>
      <Modal visible={isVisible} animationType="slide">
        <SafeAreaView className="flex flex-col w-full h-full gap-8 bg-primary">
          <View className="flex flex-row items-center justify-between px-3">
            <Button title="Back" onPress={onClose}></Button>
            <Text
              className="font-bold text-center color-white"
              style={{ fontSize: 24 }}
            >
              Cuestionario Matutino
            </Text>
            <Button title="Save" onPress={handleSave}></Button>
          </View>

          <ScrollView
            contentContainerStyle={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 20,
              width: "100%",
            }}
          >
            {/* Contenedor que encierra la hora de la alarma*/}
            <View
              className="flex flex-col w-[90%] justify-center items-center gap-5"
              style={{
                height: "auto",
              }}
            >
              <Text
                className="text-center font-bold color-[#6366ff]"
                style={{ fontSize: 24 }}
              >
                ¿A que hora te has despertado?
              </Text>

              {Platform.OS === "android" && ( //Renderizamos el botón en caso de android, en caso de apple ya viene renderizado con el propio picker
                <TouchableOpacity onPress={openTimePicker} className="w-full">
                  <View className="bg-[#1e273a] p-4 rounded-xl">
                    <Text className="text-center text-white">
                      {time.toLocaleTimeString()}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}

              {/* Contenedor que encierra la hora de la alarma*/}
              {(Platform.OS === "ios" || showTimePicker) && (
                <DateTimePicker
                  value={time}
                  mode="time"
                  is24Hour={true}
                  //display="spinner"
                  //textColor="white"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  textColor={Platform.OS === "ios" ? "white" : undefined}
                  accentColor="#6366ff" // Android specific color accent
                  //Cada vez que cambiamos la hora se guarda en el estado de tiempo
                  onChange={handleTimeChange}
                />
              )}
            </View>

            {/*reenderizamos las preguntas de tipo opciones*/}
            {questions.map((question) => {
              //Auqnue en el archivo tenemos ya todas las preguntas de este tipo hacemos la comprobación por si en un futuro se añaden más preguntas
              if (question.type === "options") {
                return (
                  <OptionQuestion
                    key={question.id} //Tenemos que poner una key única para cada pregunta (hijo)
                    question={question}
                    onAnswer={handleAnswer}
                  />
                );
              }
            })}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </View>
  );
};

export default WakeUpForm;
