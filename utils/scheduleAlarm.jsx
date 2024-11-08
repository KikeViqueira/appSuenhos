import { View, Text } from "react-native";
import React from "react";
import { Audio } from "expo-av";
import * as Notifications from "expo-notifications";

//Función asíncrona que una vez que se le pasa la hora y los minutos, programa una notificación para cuando llegue esa hora la alarma
//Recibe también el sonido para que cuando llegue la hora de la alarma se reproduzca el sonido que el usuario ha seleccionado, llamando a la función playAlarmSound
export const scheduleAlarm = async (hour, minute, sound, setSoundObject) => {
  //Medimos el tiempo actual
  const now = new Date();

  //Creamos un ojeto que almacene la instancia de tiempo en la que tiene que sonar la alarma
  const alarmTime = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    hour,
    minute
  );

  //Si la hora ya ha pasado hoy la programamos para el día siguiente
  if (alarmTime <= now) {
    alarmTime.setDate(alarmTime.getDate() + 1);
  }

  //Calculamos el tiempo restante en segundos
  const triggerInSeconds = (alarmTime.getTime() - now.getTime()) / 1000;

  //Esperamos a que se programe la notificación
  const notification = await Notifications.scheduleNotificationAsync({
    content: {
      title: "Alarma",
      body: "Es hora de despertar !",
      sound: sound,
    },
    trigger: { seconds: triggerInSeconds },
  });

  if (notification) return notification;
};
