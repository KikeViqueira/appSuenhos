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
import React, { useState } from "react";
import DateTimePicker from "@react-native-community/datetimepicker";
import WakeUpQuestion1 from "./WakeUpQuestion1";
import WakeUpQuestion2 from "./WakeUpQuestion2";

const WakeUpForm = ({ isVisible, onClose, onSave }) => {
  //Definimos los estados para guardar las distintas partes de la respuesta
  const [time, setTime] = useState(new Date());
  const [question1, setQuestion1] = useState(null);
  const [question2, setQuestion2] = useState(null);
  //Estado para comprobar si la hora que se ha seleccionado es válida o no debido a que date no se puede poner a null
  const [isValidTime, setIsValidTime] = useState(true);

  //Función que se encarga de validar si se han respondido todas las preguntas
  const hasQuestionsAnswered = () => {
    return question1 !== null && question2 !== null;
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
    onSave({
      //Objeto newResponse que se recibe en la función de añadir del componente padre
      /*NOTA:
        - Cuando se hace el form ya se guarda la hora en la que el user se ha despertado, por eso no hace falta hacer una variable que guarde específicamente esto en el componente padre
      */
      time,
      question1,
      question2,
    });
    //Una vez guardamos la respuesta, tenemos que poner los estados a null para que la próxima vez que se abra el formulario estén vacíos
    setQuestion1(null);
    setQuestion2(null);

    onClose();
  };

  //Estado para saber cuando estamos controlando el comportamiento del timePicker en Android, inicialmente es falso
  const [showTimePicker, setShowTimePicker] = useState(false);

  //Función para guardar el valor que se ha seleccionado en el timePicker y poner la bandera a false para evitar su continua abertura en pantalla
  const handleTimeChange = (event, selectedTime) => {
    if (Platform.OS === "android") setShowTimePicker(false);

    //tenemos que comprobar que la hora que ponga el user que se ha levantado sea menor o igual a la hora actual, si no podrían exister medidas érroneas
    if (selectedTime && selectedTime <= new Date()) {
      setTime(selectedTime);
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
        <SafeAreaView className="flex flex-col gap-8 w-full h-full bg-primary">
          <View className="flex flex-row justify-between items-center px-3">
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

            {/*llamamos a las distintas preguntas de seleccionar opción*/}
            <WakeUpQuestion1 setQuestion={setQuestion1} />
            <WakeUpQuestion2 setQuestion={setQuestion2} />
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </View>
  );
};

export default WakeUpForm;
