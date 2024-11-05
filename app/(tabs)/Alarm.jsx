import { View, Text } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
//Importamos el componente AlarmItem
import AlarmItem from '../../components/AlarmItem'

const Alarm = () => {

  //Creamos un objeto alarma que se lo pasaremos a AlarmItem
  const alarm = {
    id: 1,
    time: "19:29",
    days: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
    label: "Work",
  };

  return (
    <SafeAreaView className="h-full bg-primary">
      <AlarmItem alarm={alarm}></AlarmItem>
    </SafeAreaView>
  )
}

export default Alarm
/*
Separación de Responsabilidades: Al hacer que cada pestaña (como "Alarm") sea un componente, podemos gestionar la lógica y los datos específicos
de esa pantalla en un solo lugar, sin mezclar con otras pestañas. Esto facilita el desarrollo y mantenimiento.

Integración en el Sistema de Tabs: Cada pestaña de navegación puede tener un componente que representa una pantalla completa. Al hacer que "Alarm"
sea un componente, simplemente lo referenciamos en el sistema de navegación, y React Native sabe que debe cargar ese componente cuando el usuario
selecciona la pestaña "Alarm".
*/