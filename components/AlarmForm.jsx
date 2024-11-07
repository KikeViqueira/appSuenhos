import {
  View,
  Text,
  Modal,
  Button,
  TouchableOpacity,
  Switch,
  TextInput,
  SafeAreaView,
} from "react-native";
import React, { useState } from "react";
import DateTimePicker from "@react-native-community/datetimepicker";
import RepeatDaysPicker from "./RepeatDaysPicker";
import SoundPicker from "./SoundPicker";
import playAlarmSound from "../utils/playAlarmSound";

const AlarmForm = ({ visible, initialAlarm, onSave, onClose }) => {
  //Creamos los distintos estados para los diferentes campos que tendremos en el menú de alarma

  //tenemos que tener en cuenta tanto la creación como la edición de la alarma, por lo que por los parámetros de la función tenemos que pasar la referencia a la alarma que se está editando
  //O no se pasará nada si se está creando una nueva alarma

  const [time, setTime] = useState(
    initialAlarm ? initialAlarm.time : new Date()
  );
  //El siguiente campo hace referncia a los días que el usuario quiere que se repita la alarma, en el caso de que no se pase nada se inicializa como un array vacío que se rendizará
  const [repeatDays, setRepeatDays] = useState(
    initialAlarm ? initialAlarm.repeat : []
  );

  //Alarm es el texto que se verá en el input a base de poder escribir encima de él
  const [label, setLabel] = useState(
    initialAlarm ? initialAlarm.label : "Alarm"
  );
  const [sound, setSound] = useState(
    initialAlarm ? initialAlarm.sound : "Default"
  );
  const [snooze, setSnooze] = useState(
    initialAlarm ? initialAlarm.snooze : false
  );
  //Necesitamos un estado para saber si el usuario tiene el modal de las horas de seleccion activadas o no
  const [show, setShow] = useState(false);

  //Función que se encarga de enviar los datos de la alarma al componente padre y cerrar el modal
  const handleSave = () => {
    //Ambas funciones se reciben del componente padre, en este caso Alarm.jsx
    onSave({
      time,
      repeat: repeatDays,
      label,
      sound,
      snooze,
    });

    onClose();
  };

  return (
    //Cuando renderizamos el modal, este se muestra en un nuevo contexto encima de la pantalla principal
    //Por lo tanto si queremos que lo que este dentro del modal se vea correctamente tenemos que poner dentro de este componente un SafeAreaView
    <View>
      <Modal visible={visible} animationType="slide">
        <SafeAreaView>
          <View className="flex flex-row justify-between">
            <Button title="Back" onPress={onClose} />
            <Text>Edit Alarm</Text>
            <Button title="Save" onPress={handleSave} />
          </View>

          {/* Contenedor que encierra la hora de la alarma*/}

          <DateTimePicker
            value={time}
            mode="time"
            is24Hour={true}
            display="default"
            className="bg-black"
            //Cada vez que cambiamos la hora se guarda en el estado de tiempo
            onChange={(event, selectedTime) => {
              setShow(false);
              if (selectedTime) {
                setTime(selectedTime);
              }
            }}
          />

          {/* Selección de Días */}
          <RepeatDaysPicker
            selectedDays={repeatDays}
            onToggleDay={setRepeatDays}
          />

          {/* Etiqueta de la alarma */}
          <View>
            <Text>Label</Text>
            <TextInput
              placeholder="Alarm"
              placeholderTextColor="#a0aec0"
              value={label}
              onChangeText={(nuevoTexto) => setLabel(nuevoTexto)}
            />
          </View>

          {/* Selección de sonido */}
          <SoundPicker sound={sound} setSound={setSound} />
        </SafeAreaView>
      </Modal>
    </View>
  );
};

export default AlarmForm;
