import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Alert,
  ScrollView,
} from "react-native";
import { Audio } from "expo-av";
import { Play, Pause, Repeat, Upload, Trash2, Ban } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Slider from "@react-native-community/slider";
import * as DocumentPicker from "expo-document-picker";
import useSound from "../../hooks/useSound";
import { uploadSoundToCloudinary } from "../../services/Cloudinary";

const Music = () => {
  //Recuperamos las funcionalidades del useSound para usar en este componente
  const {
    staticSounds,
    getAllStaticSounds,
    userSounds,
    getUserSounds,
    deleteUserSound,
    postSound,
  } = useSound();

  const [currentSound, setCurrentSound] = useState(null); //Guardamos el sonido que está sonando actualmente
  const soundRef = useRef(null); //Una referencia a el
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  //Definimos los estados para controlar el número de audios que sube el user a la app
  const maxSounds = 6;

  /*
   * La función getSoundSource se encarga de obtener el asset correcto para reproducir el sonido.
   *
   * - Para sonidos estáticos (los que vienen por defecto en la app), React Native requiere
   *   que se utilice require en tiempo de compilación, por lo que no se puede determinar
   *   dinámicamente la ruta del asset. Aquí, usamos un switch para mapear la propiedad 'fileUrl'
   *   (que proviene de la BD) al asset correspondiente.
   *
   * - Para sonidos dinámicos (subidos por el usuario), se asume que el objeto 'sound' ya posee
   *   en su propiedad 'source' el objeto { uri: ... } con la URL del recurso, permitiendo cargar
   *   el audio de forma remota.
   *
   * Esta separación es esencial para tener una solución escalable y profesional:
   *  - Los sonidos estáticos quedan incluidos en el bundle mediante require.
   *  - Los sonidos subidos por el usuario se cargan dinámicamente sin necesidad de modificar el código.
   */
  const getSoundSource = (sound) => {
    if (!sound.isDefault) {
      // Sonido subido por el usuario: ya se tiene la URI
      // Pero necesitamos asegurarnos que esté en el formato correcto para Audio.Sound.createAsync
      return { uri: sound.source };
    }
    // Sonido estático: usamos require para incluir el asset en el bundle
    switch (sound.source) {
      case "../../assets/sounds/ocean-waves.mp3":
        return require("../../assets/sounds/ocean-waves.mp3");
      case "../../assets/sounds/forest-ambience.mp3":
        return require("../../assets/sounds/forest-ambience.mp3");
      case "../../assets/sounds/rain-sound.mp3":
        return require("../../assets/sounds/rain-sound.mp3");
      case "../../assets/sounds/birds-in-forest.mp3":
        return require("../../assets/sounds/birds-in-forest.mp3");
      default:
        return null; // O bien un asset por defecto
    }
  };

  //Tenemos que hacer cuando se reenderice el componente llamar a la función que recupera los sonidos estáticos
  useEffect(() => {
    //Los sonidos que hemos recuperado se guardan en el estado de staticSounds del useSound
    getAllStaticSounds();
    //Recuperamos también los sonidos que el user ha subido a la app
    getUserSounds();
  }, []);

  useEffect(() => {
    //Actualizamos de una manera constante el progreso del sonido
    let progressInterval;
    const updateProgress = async () => {
      if (soundRef.current) {
        const status = await soundRef.current.getStatusAsync(); //Obtenemos el estado del sonido
        if (status.isLoaded) {
          //Si el sonido esta cargado actualizamos el progreso y la duración
          setProgress(status.positionMillis);
          setDuration(status.durationMillis);
        }
      }
    };

    if (isPlaying) {
      progressInterval = setInterval(updateProgress, 1000);
    }

    return () => {
      if (progressInterval) {
        clearInterval(progressInterval);
      }
    };
  }, [isPlaying]);

  const playSound = async (sound) => {
    try {
      console.log("Antes de reproducir: ", {
        sound,
        currentSound,
        isPlaying,
        progress,
      });

      // Obtenemos el asset adecuado, ya sea estático (mediante require) o dinámico (por URI)
      const soundSource = getSoundSource(sound);
      if (!soundSource) {
        console.error("No se pudo obtener el asset para el sonido:", sound);
        return;
      }

      if (currentSound?.id === sound.id && !isPlaying && progress > 0) {
        // Resume the paused sound
        if (soundRef.current) {
          await soundRef.current.setPositionAsync(progress);
          await soundRef.current.playAsync();
          setIsPlaying(true);
          console.log("Reanudando sonido: ", sound.id);
          return;
        }
      }

      //Si cambiamos el sonido reseteamos el progreso
      if (currentSound?.id !== sound.id) {
        setProgress(0);
      }

      if (soundRef.current) {
        await soundRef.current.unloadAsync();
      }

      //Ejecutamos el nuevo sonido y actualizamos la referencia y el sonido actual
      const { sound: newSound } = await Audio.Sound.createAsync(soundSource, {
        shouldPlay: true,
        isLooping: sound.isLooping || false,
      });

      //Configuramos el sonido para que cuando acabe se detenga
      newSound.setOnPlaybackStatusUpdate((status) => {
        setIsPlaying(status.isPlaying);
        if (status.didJustFinish && !status.isLooping) {
          //Si el audio termina y no esta en loop se detiene y se resetea el estado de las variables
          setIsPlaying(false);
          setCurrentSound(null);
          setProgress(0);
        }
      });
      soundRef.current = newSound;
      setCurrentSound({ ...sound, isLooping: sound.isLooping || false }); //En este caso usamos el estado directamente
      setIsPlaying(true);
      console.log("Reproduciendo sonido: ", sound.id);
    } catch (error) {
      console.error("Error reproduciendo sonido: ", error);
      Alert.alert("Error", `No se pudo reproducir el sonido: ${error.message}`);
    }
  };

  const stopSound = async () => {
    if (soundRef.current) {
      try {
        console.log("Antes de pausar: ", { currentSound, isPlaying, progress });

        await soundRef.current.pauseAsync(); //Pausar sonido

        const status = await soundRef.current.getStatusAsync(); //Obtener estado actualizado

        setIsPlaying(false); //Asegurar que React detecta el cambio
        setProgress(status.positionMillis); //Guardamos la posición actual

        console.log("Después de pausar: ", {
          currentSound,
          isPlaying,
          progress,
        });
      } catch (error) {
        console.error("Error pausando sonido: ", error);
      }
    }
  };

  const toggleLooping = async () => {
    if (soundRef.current && currentSound) {
      //Recuperamos el valor contrario al guardado en la variable isLooping del audio actual
      const newIsLooping = !currentSound.isLooping;
      try {
        await soundRef.current.setIsLoopingAsync(newIsLooping);
        //De esta manera nos aseguramos de estar trabajando con el último estado guardado del componente, lo cual es esencial en escenarios de múltiples actualizaciones
        setCurrentSound((prevSound) => ({
          ...prevSound,
          isLooping: newIsLooping,
        })); //Guardamos el nuevo estado dentro del sonido actual
      } catch (error) {
        console.error("Error cambiando el bucle del sonido: ", error);
      }
    }
  };

  const changePosition = async (position) => {
    if (soundRef.current) {
      //Pondemos el audio en la pos indicada por el user
      await soundRef.current.setPositionAsync(position);
      setProgress(position);
    }
  };

  //Función encargada de renderizar cada uno de los elementos del flatlist, en este caso objetos del array de relax sounds
  const renderSoundItem = ({ item }) => (
    <View
      className={`w-[95%] self-center p-5 rounded-xl border ${
        currentSound?.id === item.id ? "border-[#8a8cff]" : "border-[#323d4f]"
      } shadow-md mb-1`}
    >
      <View className="flex-row items-center justify-between mb-3">
        <Text
          className={`text-lg font-semibold ${
            currentSound?.id === item.id ? "text-white" : "text-gray-200"
          }`}
        >
          {item.name}
        </Text>

        <View className="flex-row items-center gap-4">
          {/* Botón para repetir o no el audio */}
          <TouchableOpacity
            className={`p-2 rounded-full ${
              currentSound?.id === item.id && currentSound?.isLooping
                ? "bg-white/20"
                : "bg-transparent"
            }`}
            onPress={() =>
              currentSound?.id === item.id ? toggleLooping() : null
            }
          >
            <Repeat
              color={
                currentSound?.id === item.id
                  ? currentSound?.isLooping
                    ? "white"
                    : "rgba(255,255,255,0.5)"
                  : "#626364"
              }
              size={20}
            />
          </TouchableOpacity>

          {/* Botón para pausar o reproducir el audio - MANTENER EXACTAMENTE LA MISMA LÓGICA ORIGINAL */}
          <TouchableOpacity
            className={`w-10 h-10 rounded-full mr-3 items-center justify-center ${
              currentSound?.id === item.id ? "bg-white/20" : "bg-[#6366ff]/20"
            }`}
            onPress={() =>
              currentSound?.id === item.id && isPlaying
                ? stopSound()
                : playSound(item)
            }
          >
            {currentSound?.id === item.id && isPlaying ? (
              <Pause color="white" size={20} />
            ) : (
              <Play
                color={currentSound?.id === item.id ? "white" : "#6366ff"}
                size={20}
              />
            )}
          </TouchableOpacity>

          {/* Botón para eliminar sonidos si estos han sido subidos por el user */}
          {!item.isDefault && (
            <TouchableOpacity
              className="p-2 rounded-full bg-[#ff6b6b]/20"
              onPress={() => deleteUserSound(item.id)}
            >
              <Trash2 color="#ff6b6b" size={20} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Control y visualización del reproductor */}
      {currentSound?.id === item.id && (
        <View className="w-full mt-1">
          <Slider
            minimumValue={0}
            maximumValue={duration}
            value={progress}
            onSlidingComplete={changePosition}
            minimumTrackTintColor="white"
            maximumTrackTintColor="rgba(255,255,255,0.3)"
            thumbTintColor="white"
            thumbStyle={{ width: 15, height: 15 }}
            trackStyle={{ height: 4, borderRadius: 2 }}
          />
          <View className="flex-row justify-between mt-1">
            <Text className="text-sm text-white/80">
              {formatTime(progress)}
            </Text>
            <Text className="text-sm text-white/80">
              {formatTime(duration)}
            </Text>
          </View>
        </View>
      )}
    </View>
  );

  const formatTime = (milliseconds) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  //Creamos la función para que el user pueda subir sus audios
  const uploadSound = async () => {
    try {
      //Primero lo que tenemos que comprobar es si el user puede subir sonidos
      if (userSounds.length >= maxSounds) {
        Alert.alert(
          "Límite alcanzado",
          "Solo puedes subir 6 sonidos, para subir uno nuevo borra alguno que ya no te interese"
        );
        return;
      }

      //llamamos al document picker
      const result = await DocumentPicker.getDocumentAsync({
        /*
         * Solo permitir archivos de audio (* en el segundo parámetro indica que acepta cualquier tipo de extension)
         * audio/mpeg = MP3 files
         * audio/wav = WAV files
         * audio/ogg = OGG files
         * audio/* = ALL audio file types
         */
        type: "audio/*",
        copyToCacheDirectory: true, //Permitimos que expo lea el fichero nada más sea seleccionado
      });

      if (!result.canceled) {
        //Comprobamos que el archivo del user no supere cierto tamaño
        const maxFileSize = 10 * 1024 * 1024; //Ponemos el tamaño límite en 10 MB
        if (result.assets[0].size > maxFileSize) {
          Alert.alert(
            "Archivo demasiado grande",
            "El archivo no puede superar los 10 MB"
          );
          return;
        }

        //TODO: Mostrar un mensaje de carga

        //Antes de guardar el sonido en la BD tenemos que guardarlo en la nube para poder obtenerlo en cualquier dispositivo
        const cloudinaryUrl = await uploadSoundToCloudinary({
          uri: result.assets[0].uri,
          name: result.assets[0].name,
        });

        if (!cloudinaryUrl) {
          Alert.alert(
            "Error al subir",
            "No se pudo subir el archivo a la nube. Inténtalo de nuevo."
          );
          return;
        }

        //Creamos el objeto que vamos a guardar en la bd
        const newSound = {
          /**
           * Creamos la estructura del objeto sound que espera la api
           * en el método postSound para que no sucedan errores al llamar al endpoint
           */
          name: result.assets[0].name,
          source: cloudinaryUrl, //URI para que la función createAsync funcione
        };

        console.log(newSound);
        //llamamos al endpoint encargado de subir el sonido en la app
        await postSound(newSound);
        //Una vez subido el sonido por parte del user tenemos que llamar a la función que recupera los sonidos del user
        await getUserSounds();
        console.log(userSounds);
      }
    } catch (error) {
      console.error("Error completo al subir el sonido:", error);
      Alert.alert(
        "Error",
        `No se pudo subir el sonido: ${error.message || "Error desconocido"}`
      );
    }
  };

  return (
    <SafeAreaView className="flex-1 gap-4 bg-primary">
      <Text
        className="text-center font-bold text-[#6366ff] py-4 mt-3"
        style={{ fontSize: 24 }}
      >
        Sonidos Relajantes
      </Text>

      <View className="w-[95%] self-center">
        <TouchableOpacity
          className={`${
            userSounds.length >= maxSounds ? "bg-[#ff6b6b]" : "bg-[#6366ff]"
          } w-full self-center flex p-6 gap-4 rounded-3xl border border-[#323d4f]`}
          onPress={uploadSound}
        >
          <View className="flex-row items-center justify-between">
            <Text className="text-lg text-white font-psemibold">
              {userSounds.length >= maxSounds
                ? "Elimina sonidos para subir nuevos"
                : "Sube sonidos propios"}
            </Text>
            {userSounds.length >= maxSounds ? (
              <Ban color="white" size={24} className="p-2" />
            ) : (
              <Upload color="white" size={24} className="p-2" />
            )}
          </View>
        </TouchableOpacity>

        <View className="flex-row justify-end mt-2">
          <Text className="mr-2 text-white">
            {userSounds.length}/{maxSounds} sonidos subidos
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{
          flexGrow: 1, //Puede crecer y adaptarse al nuevo tamaño y scroll
          paddingBottom: 20,
        }}
        indicatorStyle="white"
        showsVerticalScrollIndicator={true} //Ocultamos la barra de scroll
      >
        {/*Comprobamos si el user tiene sonidos subidos, si es ese caso tenemos que renderizar la parte correspondiente en la app */}
        {userSounds.length > 0 && (
          <View className="mb-6">
            <View className="flex-row items-center mt-2 mb-4 ml-4">
              <View className="w-1 h-5 bg-[#ff6b6b] rounded-full mr-2" />
              <Text
                className="font-bold text-white text-start"
                style={{ fontSize: 18 }}
              >
                Mis sonidos
              </Text>
            </View>
            <FlatList
              data={userSounds}
              renderItem={renderSoundItem}
              keyExtractor={(item) => item.id}
              contentContainerClassName="pb-2 gap-4"
              scrollEnabled={false}
            />
          </View>
        )}

        <View className="mb-6">
          <View className="flex-row items-center mt-2 mb-4 ml-4">
            <View className="w-1 h-5 bg-[#6366ff] rounded-full mr-2" />
            <Text
              className="font-bold text-white text-start"
              style={{ fontSize: 18 }}
            >
              Sonidos por defecto
            </Text>
          </View>
          <FlatList
            data={staticSounds}
            renderItem={renderSoundItem}
            keyExtractor={(item) => item.id}
            contentContainerClassName="pb-2 gap-4"
            scrollEnabled={false} //Prevenimos el nested scrolling
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Music;
