import {
  View,
  Text,
  Modal,
  SafeAreaView,
  Button,
  ScrollView,
  Alert,
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

  // Función que valida si todas las respuestas están completas (Si todas las respuestas son distintas de null)
  const isFormComplete = () => {
    return time !== null && question1 !== null && question2 !== null;
  };

  //Función que se encarga de enviar los datos de la respuesta al componente padre y cerrar el modal
  const handleSave = () => {
    if (!isFormComplete()) {
      Alert.alert(
        "Formato Incorrecto",
        "Por favor, rellena todas las preguntas"
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
            <Button
              title="Save"
              onPress={handleSave}
              disabled={!isFormComplete}
            ></Button>
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
              {/* Contenedor que encierra la hora de la alarma*/}
              <DateTimePicker
                value={time}
                mode="time"
                is24Hour={true}
                display="spinner"
                textColor="white"
                //Cada vez que cambiamos la hora se guarda en el estado de tiempo
                onChange={(event, selectedTime) => {
                  if (selectedTime) {
                    setTime(selectedTime);
                  }
                }}
              />
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
