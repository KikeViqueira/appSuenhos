import { View, Text } from "react-native";
import React from "react";
import { playAlarmSound } from "./playAlarmSound";
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
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Alarma",
      body: "Es hora de despertar !",
      sound: "default",
    },
    trigger: { seconds: triggerInSeconds },
  });

  console.log("Acabo aqui");

  /*Nos tenemos que subscribir para saber si la notificación ha sido enviada o no, una vez se ha enviado ejecutamos el sonido de la alarma
   en bucle y guardamos dicho objeto sonido en el estado correspondiente de la alarma, la cual se encarga de que cuando se apague el switch
    la alarma se desactivará y dejará de sonar */

  const subscription = Notifications.addNotificationResponseReceivedListener(
    async () => {
      //Reproducimos el sonido de la alarma y recuperamos el objeto de sonido
      const soundObject = await playAlarmSound(sound);
      if (soundObject) {
        //Comprobamos que el objeto recuperado es válido
        soundObject.setIsLoopingAsync(true); //Configuramos el sonido en bucle
        setSoundObject(soundObject); //Guardamos el objeto de sonido en el estado de la alarma
      }
    }
  );

  /*Devolvemos implicitamente la función de cancelar la subscripción en soundObject,
    así desde el componente alarma cuando la desactivemos podemos parar el objeto del sonido*/
  return () => subscription.remove();
};
