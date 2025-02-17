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
import { Play, Pause, Repeat, Upload, Trash2 } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Slider from "@react-native-community/slider";
import * as DocumentPicker from "expo-document-picker";

//Si queremos que al cambiar el emoticono del bucle solo se cambie en el audio que se esta reproduciendo, tenemos que guardar variable looping dentro de cada uno de ellos
const relaxationSounds = [
  {
    id: "1",
    title: "Ocean Waves",
    source: require("../../assets/sounds/ocean-waves.mp3"),
    isLooping: false,
    isDefault: true,
  },
  {
    id: "2",
    title: "Forest Ambience",
    source: require("../../assets/sounds/forest-ambience.mp3"),
    isLooping: false,
    isDefault: true,
  },
  {
    id: "3",
    title: "Rain Sounds",
    source: require("../../assets/sounds/rain-sound.mp3"),
    isLooping: false,
    isDefault: true,
  },
  {
    id: "4",
    title: "Birds in Forest",
    source: require("../../assets/sounds/birds-in-forest.mp3"),
    isLooping: false,
    isDefault: true,
  },
];

const Music = () => {
  const [currentSound, setCurrentSound] = useState(null); //Guardamos el sonido que está sonando actualmente
  const soundRef = useRef(null); //Una referencia a el
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  //Definimos los estados para controlar el número de audios que sube el user a la app
  const [userSounds, setUserSounds] = useState([]);
  const maxSounds = 6;

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
      const { sound: newSound } = await Audio.Sound.createAsync(sound.source, {
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
      className={`${
        currentSound?.id === item.id ? "bg-[#6366ff]" : "bg-[#1e273a]"
      } w-[95%] self-center flex p-6 gap-4 rounded-lg border border-[#323d4f]`}
    >
      <View className="flex-row justify-between items-center">
        <Text className="text-base font-semibold text-white">{item.title}</Text>
        <View className="flex-row gap-5 items-center">
          {/*Botón para eliminar sonidos si estos han sido subidos por el user*/}
          {!item.isDefault && (
            <TouchableOpacity
            //TODO: TENEMOS QUE LLAMAR AL ENDPOINT PARAELIMINAR EL SONIDO DE LA BD
            >
              <Trash2 color="#ff6b6b" size={28} />
            </TouchableOpacity>
          )}

          {/* Botón para repetir o no el audio */}
          <TouchableOpacity
            onPress={() =>
              //Solo permitimos activar el loop si el audio ya estaba sonando
              currentSound?.id === item.id ? toggleLooping() : null
            }
          >
            {currentSound?.id === item.id && currentSound?.isLooping ? (
              <Repeat color="white" size={24} />
            ) : (
              //Si el sonido se esta reproduciendo, ponemos el color del icono en azul si el audio es el que se esta reproduciendo, y en gris si no para mostrar al usuario como que la opción esta desactivada visualmente
              <Repeat
                color={`${
                  currentSound?.id === item.id && currentSound?.isLooping
                    ? "#1e273a"
                    : "#626364"
                }`}
                size={24}
              />
            )}
          </TouchableOpacity>

          {/* Botón para pausar o reproducir el audio */}
          <TouchableOpacity
            onPress={() =>
              currentSound?.id === item.id && isPlaying
                ? stopSound()
                : playSound(item)
            }
          >
            {currentSound?.id === item.id && isPlaying ? (
              <Pause color="white" size={24} />
            ) : (
              <Play color="white" size={24} />
            )}
          </TouchableOpacity>
        </View>
      </View>
      {currentSound?.id === item.id && (
        <View className="mt-2">
          <Slider
            minimumValue={0}
            maximumValue={duration}
            value={progress}
            onSlidingComplete={changePosition}
            minimumTrackTintColor="white" //Color de la barra de progreso una vez se haya pasado esa parte de la reproducción
            maximumTrackTintColor="#323d4f" //Color de lo que queda por reproducir
            thumbTintColor="white"
          />
          <View className="flex-row justify-between">
            <Text className="text-white">{formatTime(progress)}</Text>
            <Text className="text-white">{formatTime(duration)}</Text>
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
          "Solo puedes subir 5 sonidos, para subir uno nuevo borra alguno que ya no te interese"
        );
        return;
      }

      //llamamos al document picker
      const result = await DocumentPicker.getDocumentAsync({
        type: "audio/*" /*Solo permitir archivos de audio (* en el segundo parámetro indica que acepta cualquier tipo de extension)
      audio/mpeg = MP3 files
      audio/wav = WAV files
      audio/ogg = OGG files
      audio/* = ALL audio file types
      */,
        copyToCacheDirectory: true, //Permitimos que expo lea el fichero nada más sea seleccionado
      });

      if (!result.canceled) {
        //Comprobamos que el archivo del user no supere cierto tamaño
        const maxFileSize = 10 * 1024 * 1024; //TODO: Ponemos el tamaño límite en 10 MB
        if (result.size > maxFileSize) {
          Alert.alert(
            "Archivo demasiado grande",
            "El archivo no puede superar los 10 MB"
          );
          return;
        }

        //Si el resultado ha sido exitoso y no supera el tamaño incluído, creamos un objeto sonido nuevo //TODO: Por ahora los guardamos de manera estática
        const newSound = {
          id: `user-${Date.now()}`,
          title: result.assets[0].name,
          source: { uri: result.assets[0].uri }, //URI para que la función createAsync funcione
          isLooping: false,
          isDefault: false, //TODO/ Campo en la BD que indica si el sonido es subido por un user o no
        };

        console.log(newSound.source);

        //TODO:Guardar el audio en la BD, por ahora lo guardamos en el estado de userSounds
        setUserSounds((prevSounds) => [...prevSounds, newSound]);
        console.log(userSounds);
      }
    } catch (error) {
      Alert.alert("Error", "No se pudo subir el sonido");
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
      <TouchableOpacity
        className="bg-[#6366ff] w-[95%] self-center flex p-6 gap-4 rounded-3xl border border-[#323d4f]"
        onPress={uploadSound}
      >
        <View className="flex-row justify-between items-center">
          <Text className="text-lg text-white font-psemibold">
            Sube sonidos propios
          </Text>
          <Upload color="white" size={24} className="p-2" />
        </View>
      </TouchableOpacity>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1, //Puede crecer y adaptarse al nuevo tamaño y scroll
          paddingBottom: 20,
        }}
        showsVerticalScrollIndicator={false} //Ocultamos la barra de scroll
      >
        {/*Comprobamos si el user tiene sonidos subidos, si es ese caso tenemos que renderizar la parte correspondiente en la app */}
        {userSounds.length > 0 && (
          <View>
            <Text
              className="py-4 ml-4 font-bold text-white text-start"
              style={{ fontSize: 18 }}
            >
              Mis sonidos
            </Text>
            <FlatList
              data={userSounds}
              renderItem={renderSoundItem}
              keyExtractor={(item) => item.id}
              contentContainerClassName="pb-4 gap-4"
              scrollEnabled={false}
            />
          </View>
        )}

        <Text
          className="py-4 ml-4 font-bold text-white text-start"
          style={{ fontSize: 18 }}
        >
          Sonidos por defecto
        </Text>
        <FlatList
          data={relaxationSounds}
          renderItem={renderSoundItem}
          keyExtractor={(item) => item.id}
          contentContainerClassName="pb-4 gap-4"
          scrollEnabled={false} //Prevenimos el nested scrolling
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default Music;
