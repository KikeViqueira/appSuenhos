import { View, Text, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import { playAlarmSound } from "../utils/playAlarmSound";

//recibimos del formulario de alarma el sonido seleccionado y la función que se encargará de cambiar el sonido seleccionado
const SoundPicker = ({ sound, setSound }) => {
  //Lista de sonidos disponibles
  const sounds = ["Default", "Chime", "Beep", "Ring"];
  //Estado para saber si existe un sonido seleccionado actualmente y si este se está reproduciendo
  const [soundObject, setSoundObject] = useState(null);

  //Función que cambia el sonido seleccionado
  const changeSound = async (newSound) => {
    setSound(newSound);

    // Detener el sonido actual si existe y es válido
    if (soundObject) {
      try {
        await soundObject.stopAsync();
        await soundObject.unloadAsync();
      } catch (error) {
        console.error("Error al detener el sonido anterior:", error);
      }
    }

    // Reproducir el nuevo sonido y guardar el nuevo objeto de sonido
    const newSoundObject = await playAlarmSound(newSound);
    //Si el nuevo objeto de sonido es válido lo guardamos en el estado para que cuando se cambie después de nuevo de sonido podamos detenerlo, si no no se podrá detener
    if (newSoundObject) {
      setSoundObject(newSoundObject); // Guardar el nuevo objeto de sonido en el estado
    }
  };

  return (
    <View>
      <Text>Sound</Text>
      {sounds.map((s) => (
        //Para cada sonido se renderiza un botón que al ser presionado cambia el sonido seleccionado
        <TouchableOpacity
          className="m-4"
          key={s}
          //Ponemos como nuevo sonido seleccionado el que se ha presionado
          onPress={() => changeSound(s)}
        >
          {
            //El sonido seleccionado se muestra en color morado para que el usuario sepa visualmente que sonido tiene seleccionado
            sound === s ? (
              <Text className="text-purple-500">{s}</Text>
            ) : (
              <Text>{s}</Text>
            )
          }
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default SoundPicker;
