import { Text, View } from 'react-native'
import React, { Component, useState } from 'react'
import { Switch } from 'react-native';

//Creamos nuestro componente que representará a cada alarma, que recibe el objeto alarma, si está habilitada o no y la función para activar o desactivar la alarma
const AlarmItem = ({alarm, enabled, onToggle}) => {
    //Creamos una vista que almacena a toda la alarma
    //Primero hacemos la estructura de la parte de la izquierda de la propia alarma donde tenemos la hora, días y etiqueta de la misma
    //Después haremos el view que contenga al switch de la alarma
    return (
        <View className="bg-[#323d4f] w-[95%] flex flex-row justify-between items-center self-center p-6 border-[1px] border-[#CDCDE0] rounded-md">
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
                    onValueChange={onToggle}
                    value={enabled}
                />
            </View>

            
        </View>
    );
};

export default AlarmItem