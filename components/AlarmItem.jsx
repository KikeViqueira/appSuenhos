import { Text, View } from 'react-native'
import React, { Component, useState } from 'react'
import { Switch } from 'react-native';
import * as Notifications from 'expo-notifications';


//Programamos una notificación que funcione como alarma, la función es asíncrona porque estamos esperando a que se programe la notificación y asi no dependemos de la velocidad de ejecución del código
const scheduleAlarm = async (hour, minute) => {
    //Medimos el tiempo actual
    const now = new Date();
    //Creamos un ojeto que almacene la instancia de tiempo en la que tiene que sonar la alarma
    const alarmTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minute);

    //Si la hora ya ha pasado hoy la programamos para el día siguiente
    if (alarmTime <= now){
        alarmTime.setDate(alarmTime.getDate() + 1)
    }

    //Calculamos el tiempo restante en segundos
    const triggerInSeconds = (alarmTime.getTime() - now.getTime()) / 1000

    //Esperamos a que se programe la notificación
    await Notifications.scheduleNotificationAsync({
        content: {
            title: "Alarma",
            body: "Es hora de despertar !",
            sound: "default",
        },
        trigger: {seconds: triggerInSeconds},

    });

};


//Creamos nuestro componente que representará a cada alarma, que recibe el objeto alarma, si está habilitada o no y la función para activar o desactivar la alarma
const AlarmItem = ({alarm}) => {
     //Creamos el estado de la alarma
    const [isEnabled, setIsEnabled] = useState(false);

    //Definimos ahora la función que activará o desactivará la alarma
    const toggleEnabled = async () => {
        setIsEnabled(!isEnabled);
        //Cuando se llama a set el valor de isEnabled no se actualiza hasta que se acabe la función de TOGGLEENABLED
        //Si la alarma esta activada la programamos
        if (!isEnabled){
            await scheduleAlarm(19, 29);
        }else{
            //Si cancelamos la alarma (Apagar el switch), cancelamos todas las notificaciones programadas
            await Notifications.cancelAllScheduledNotificationsAsync();
        }

    }
    //Creamos una vista que almacena a toda la alarma
    //Primero hacemos la estructura de la parte de la izquierda de la propia alarma donde tenemos la hora, días y etiqueta de la misma
    //Después haremos el view que contenga al switch de la alarma
    return (
        <View className="bg-[#1e273a] w-[95%] flex flex-row justify-between items-center self-center p-6 rounded-lg">
            <View className="flex gap-3">
                <Text className="text-4xl font-bold color-white">{alarm.time}</Text>
                <View className="flex flex-row gap-4">
                    <Text className="color-[#CDCDE0] font-semibold">{alarm.days.map(day => day + ' ')}</Text>
                    <Text className="color-[#CDCDE0] font-semibold">{alarm.label}</Text>
                </View>
            </View>

            <View>
                <Switch 
                    trackColor={{false: "#CDCDE0", true: "#6366FF"}}
                    thumbColor= "#FFFFFF"
                    ios_backgroundColor= "#FFFFFF"
                    //Dependiendo de si la alarma está habilitada o no, el switch se mostrará activado o desactivado
                    onValueChange={toggleEnabled}
                    value={isEnabled}
                />
            </View>

            
        </View>
    );
};

export default AlarmItem