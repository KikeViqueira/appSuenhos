import { Audio } from "expo-av";

//Función que reproduce el sonido de la alarma, asincrona ya que la reproducción de sonidos es una operación asíncrona
export async function playAlarmSound(soundName) {
  //Creamos un objeto de sonido
  const soundObject = new Audio.Sound();
  console.log(soundName);

  //Ahora vamos recorriendo los distintos archivos de sonido que tenemos para saber que alarma ha elegido el usario para reproducir
  try {
    //Definimos una variable la cual solo esta disponible en este bloque de código
    let soundFile;

    switch (soundName) {
      case "Chime":
        soundFile = require("../assets/sounds/fall.mp3");
        break;

      case "Beep":
        soundFile = require("../assets/sounds/slot.mp3");
        break;

      case "Ring":
        soundFile = require("../assets/sounds/toilet.mp3");
        break;

      default:
        soundFile = require("../assets/sounds/gol.mp3");
        break;
    }
    //Cuando se resuelva la promesa hacemos las siguientes funciones: Cargamos el archivo de sonido y lo reproducimos
    await soundObject.loadAsync(soundFile);
    await soundObject.playAsync();

    //Devolvemos el objeto sound
    return soundObject;
  } catch (error) {
    console.log(error);
    return null;
  }
}
