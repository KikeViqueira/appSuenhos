import {
  View,
  Text,
  Button,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
//Importamos el componente AlarmItem y AlarmForm
import AlarmItem from "../../components/AlarmItem";
import AlarmForm from "../../components/AlarmForm";
//Importamos iconos
import icons from "../../constants/icons";

const Alarm = () => {
  //Creamos los estados para saber si el menú de info de la alarma (modal) está abierto o cerrado, y para saber las alarmas que tiene el usuario
  const [isFormVisible, setFormVisible] = useState(false);
  const [alarms, setAlarms] = useState([]); //Array de alarmas

  //Función para cambiar el estado de si el formulario de añadir alarma está visible o no
  const toggleFormVisible = () => {
    setFormVisible(!isFormVisible);
  };

  //Función para añadir una nueva alarma
  const addAlarm = (newAlarm) => {
    //Tenemos que crear la alarma con un id único para que React pueda identificarla
    //(CUANDO TENGAMOS BASE DE DATOS SE QUITARÁ ESTO)
    const alarmWithId = { ...newAlarm, id: Date.now().toString() };
    //Metemos la nueva alarma al final del array estado que almacena las alarmas del usario
    setAlarms((prevAlarms) => [...prevAlarms, alarmWithId]);
    setFormVisible(false); //Cerramos el formulario ya que hemos añadido ya la nueva alarma
  };

  return (
    <SafeAreaView className="h-full bg-primary">
      <TouchableOpacity onPress={toggleFormVisible}>
        <Image source={icons.plus} />
      </TouchableOpacity>

      {/*Renderizamos las alarmas si existen dentro de un ScrollView por si tenemos muchas alarmas y no nos cogen en la página*/}
      <ScrollView>
        {alarms.length > 0 ? (
          alarms.map((alarm) => (
            //Le indicamos a React que cada alarma es única con la key
            <AlarmItem key={alarm.id} alarm={alarm}></AlarmItem>
          ))
        ) : (
          <Text>No alarms</Text>
        )}
      </ScrollView>

      {/*Componente alarmForm para tener el modal para insertar o modificar alarmas en el caso de que lo pongamos en visible*/}
      <AlarmForm
        visible={isFormVisible}
        onClose={toggleFormVisible}
        onSave={addAlarm}
      />
    </SafeAreaView>
  );
};

export default Alarm;
/*
Separación de Responsabilidades: Al hacer que cada pestaña (como "Alarm") sea un componente, podemos gestionar la lógica y los datos específicos
de esa pantalla en un solo lugar, sin mezclar con otras pestañas. Esto facilita el desarrollo y mantenimiento.

Integración en el Sistema de Tabs: Cada pestaña de navegación puede tener un componente que representa una pantalla completa. Al hacer que "Alarm"
sea un componente, simplemente lo referenciamos en el sistema de navegación, y React Native sabe que debe cargar ese componente cuando el usuario
selecciona la pestaña "Alarm".
*/
