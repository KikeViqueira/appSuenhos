import { Text, View } from "react-native";
import React, { Component, useState } from "react";
import { Switch } from "react-native";
import { scheduleAlarm } from "../utils/scheduleAlarm"; //Importamos la función que se encargará de enviar una notificación a la hora programada de la alarma
import { useEffect } from "react";
import * as Notifications from "expo-notifications";
import { playAlarmSound } from "../utils/playAlarmSound";

//Creamos nuestro componente que representará a cada alarma, que recibe el objeto alarma, si está habilitada o no y la función para activar o desactivar la alarma
const AlarmItem = ({ alarm }) => {
  //Creamos el estado de la alarma para ver si está activada o no
  const [isEnabled, setIsEnabled] = useState(false);

  const [soundObject, setSoundObject] = useState(null); //Declaramos un estado para guardar el objeto de sonido de la alarma
  const [isAudioPlaying, setIsAudioPlaying] = useState(null);

  //Cuando cambia el objeto sonido se ejecuta su useEffect
  useEffect(() => {
    /*Nos tenemos que subscribir para saber si la notificación ha sido enviada o no, una vez se ha enviado ejecutamos el sonido de la alarma
   en bucle y guardamos dicho objeto sonido en el estado correspondiente de la alarma, la cual se encarga de que cuando se apague el switch
    la alarma se desactivará y dejará de sonar */
    const handleNotifications = async () => {
      if (isEnabled) {
        const subscription = Notifications.addNotificationReceivedListener(
          async () => {
            console.log(
              "Notificación recibida, intentando reproducir sonido..."
            );
            console.log(alarm.sound);
            //Reproducimos el sonido de la alarma y recuperamos el objeto de sonido
            if (!soundObject) {
              const soundObjectLocal = await playAlarmSound(alarm.sound);
              if (soundObjectLocal && !isAudioPlaying) {
                console.log("Sonido cargado y configurado en bucle.");
                //Comprobamos que el objeto recuperado es válido
                soundObjectLocal.setIsLoopingAsync(true); //Configuramos el sonido en bucle
                setSoundObject(soundObjectLocal); //Guardamos el objeto de sonido en el estado de la alarma
                setIsAudioPlaying(true);
              }
            }
          }
        );
      } else {
        console.log("La hemos liado");
        await Notifications.cancelAllScheduledNotificationsAsync();
        console.log(
          "Hay sonido, desactivando alarma",
          soundObject,
          isAudioPlaying
        );
        if (soundObject) {
          try {
            console.log(
              "Hay sonido, desactivando alarma",
              soundObject,
              isAudioPlaying
            );
            await soundObject.stopAsync();
            await soundObject.unloadAsync();
            setSoundObject(null);
            setIsAudioPlaying(false);
          } catch (error) {
            console.error("Error al detener el sonido anterior:", error);
          }
        }
      }
    };

    handleNotifications();

    /*Devolvemos implicitamente la función de cancelar la subscripción en soundObject,
    así desde el componente alarma cuando la desactivemos podemos parar el objeto del sonido*/
  }, [isEnabled]);

  console.log(alarm);

  //Definimos ahora la función que activará o desactivará la alarma
  const toggleEnabled = async () => {
    setIsEnabled(!isEnabled);
    console.log("Cambiando enable a ", !isEnabled);
    //Cuando se llama a set el valor de isEnabled no se actualiza hasta que se acabe la función de TOGGLEENABLED
    //Si la alarma esta activada la programamos
    if (!isEnabled) {
      //Nos aseguramos que la hora de la alarma sea un string
      const formattedTime =
        alarm.time instanceof Date
          ? alarm.time.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })
          : alarm.time;

      /*Activamos la alarma a la hora y minutos que nos ha puesto el usuario, separando la hora y los minutos mediante split sabiendo que las horas 
      están a la izquierda de los dos puntos y los minutos a la derecha. A mayores le pasamos el sonido que ha seleccionado el usuario y la función
      que se encargará de cambiar el estado del objeto de sonido de la alarma
      */
      const notification = await scheduleAlarm(
        formattedTime.split(":")[0],
        formattedTime.split(":")[1],
        alarm.sound,
        setSoundObject
      );

      console.log("Notificacion programada ", notification);
    }
  };
  //Creamos una vista que almacena a toda la alarma
  //Primero hacemos la estructura de la parte de la izquierda de la propia alarma donde tenemos la hora, días y etiqueta de la misma
  //Después haremos el view que contenga al switch de la alarma
  return (
    <View className="bg-[#1e273a] w-[95%] flex flex-row justify-between items-center self-center p-6 rounded-lg">
      <View className="flex gap-3">
        <Text className="text-4xl font-bold color-white">
          {
            //Tenemos que asegurarnos de lo que estamos intentando mostrar es un String y no un Date
            alarm.time instanceof Date
              ? alarm.time.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : alarm.time
          }
        </Text>
        <View className="flex flex-row gap-4">
          <Text className="color-[#CDCDE0] font-semibold">
            {
              //En el caso de que alarm.repeat exista y tenga más de cero elementos mostramos los días que se repite la alarma
              alarm.repeat && alarm.repeat.length > 0
                ? alarm.repeat.map((day) => day + " ")
                : //En caso contrario mostramos 'Never'
                  "Never"
            }
          </Text>
          <Text className="color-[#CDCDE0] font-semibold">{alarm.label}</Text>
        </View>
      </View>

      <View>
        <Switch
          trackColor={{ false: "#CDCDE0", true: "#6366FF" }}
          thumbColor="#FFFFFF"
          ios_backgroundColor="#FFFFFF"
          //Dependiendo de si la alarma está habilitada o no, el switch se mostrará activado o desactivado
          onValueChange={toggleEnabled}
          value={isEnabled}
        />
      </View>
    </View>
  );
};

export default AlarmItem;
