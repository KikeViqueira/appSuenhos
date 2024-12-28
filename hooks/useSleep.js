import { useEffect, useState, Alert } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function useSleep() {
  //Estado para guardar la hora en la que el user se va a dormir y para saber si el user esta durmiendo o no
  const [sleepTime, setSleepTime] = useState(null);
  const [isSleeping, setIsSleeping] = useState(false);

  //Función para guardar la hora en la que el user se va a dormir
  const calculateSleepStart = async () => {
    //Si el usuario no estaba durmiendo, le damos la hora actual
    if (!isSleeping) {
      const now = new Date();
      try {
        //Guardamos la hora en la que el user se ha dormido en el storage del dispositivo
        await AsyncStorage.setItem("sleepStart", now.toISOString()); //tenemos que pasarlo a string
        setSleepTime(now);
        setIsSleeping(true);
        console.log("Hora en la que el user se ha ido a dormir: ", now);

        //Programamos una notificación para que cuando hayan pasado 8 horas avisar al user de que debe resgistrar la hora en la que ha despertado
        const morningNotification =
          await Notifications.scheduleNotificationAsync({
            content: {
              title: "¿Pilas recargadas?",
              body: "No olvides registrar tu hora de despertar para calcular tu sueño.",
            },
            trigger: {
              hour: 8,
              minute: 0,
            },
          });
        return morningNotification;
      } catch (error) {
        console.error("Error al guardar la hora de inicio de sueño: ", error);
      }
    } else {
      Alert.alert(
        "Reiniciar el registro",
        "¿Estás seguro de querer reiniciar el registro de horas de sueño?",
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Reiniciar",
            onPress: () => {
              setIsSleeping(false);
              setSleepStart(null);
            },
          },
        ]
      );
    }
  };

  //Función para finalizar el registro de horas de sueño y calcular la duración de sueño
  const calculateSleepDuration = async (wakeUpTime) => {
    try {
      //recuperamos la hora de sueño en la que el user se fue a dormir
      const recoveredSleepStart = await AsyncStorage.getItem("sleepStart");
      if (recoveredSleepStart) {
        //Hemos recuperado la fecha en formato String y tenemos que pasarlo a Date
        const sleepStartTime = new Date(recoveredSleepStart);
        const duration = wakeUpTimeDate.getTime() - sleepStartTime.getTime(); //Hacemos la diferencia en milisegundos
      }

      if (duration < 0) {
        Alert.alert(
          "Tiempo inválido",
          "La hora de despertar debe ser posterior a la hora en que te fuiste a dormir"
        );
        return false;
      }

      const hours = Math.floor(duration / 3600000);

      //hacemos un objeto donde guardamos la info del registro del sueño
      const sleepData = {
        startTime: sleepStartTime.toISOString(),
        endTime: wakeUpTime.toISOString(),
        duration: hours,
      };

      //Liampiamos los estados, almacenamiento y notificaciones
      await AsyncStorage.removeItem("sleepStart");
      setIsSleeping(false);
      setSleepTime(null);
      Notifications.cancelAllScheduledNotificationsAsync();

      //Devolvemos el objeto con la info que necesitamos para guardar en la base de datos
      return sleepData;
    } catch (error) {
      console.error("Error al calcular la duración de sueño: ", error);
    }
  };

  //Cargamos la hora en la que el user se ha ido a dormir cuando se inicializa el hook
  useEffect(() => {
    //Definición de la función asíncrona
    const loadSleepData = async () => {
      try {
        const recoveredSleepStart = await AsyncStorage.getItem("sleepStart");
        if (recoveredSleepStart) {
          const sleepStartTime = new Date(recoveredSleepStart);
          const now = new Date();

          //Comprobamos si la hora en la que se ha ido a dormir lleva más de 24 horas almacenada en el storage
          if (now.getTime() - sleepStartTime.getTime() <= 24 * 60 * 60 * 1000) {
            setSleepTime(sleepStartTime);
            setIsSleeping(true);
          } else {
            //En este caso borramos la hora ya que al pasar tanto tiempo las medidas no serán consistentes y realistas para la hora de representarlas en la app
            await AsyncStorage.removeItem("sleepStart");
          }
        }
      } catch (error) {
        console.error("Error al cargar la hora de inicio de sueño: ", error);
      }
    };

    //llamamos a la función
    loadSleepData();
  }, []);

  //Devolvemos las funciones mas la bandera de si el user esta durmiendo o no para saber si se puede desplegar el formulariopara registrar el sueño
  //Hay que recordar que el requesito para rellenarlo es que el user estuviese durmiendo (boton de me voy a dormir activado)
  return {
    calculateSleepStart,
    calculateSleepDuration,
    sleepTime,
    isSleeping,
  };
}
