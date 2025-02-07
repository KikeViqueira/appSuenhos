import React, { useState, useRef, useEffect } from "react";
import { View, Text, TouchableOpacity, FlatList } from "react-native";
import { Audio } from "expo-av";
import { Play, Pause, Repeat } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Slider from "@react-native-community/slider";

const relaxationSounds = [
  {
    id: "1",
    title: "Ocean Waves",
    source: require("../../assets/sounds/ocean-waves.mp3"),
  },
  {
    id: "2",
    title: "Forest Ambience",
    source: require("../../assets/sounds/forest-ambience.mp3"),
  },
  {
    id: "3",
    title: "Rain Sounds",
    source: require("../../assets/sounds/rain-sound.mp3"),
  },
  {
    id: "4",
    title: "Birds in Forest",
    source: require("../../assets/sounds/birds-in-forest.mp3"),
  },
];

const Music = () => {
  const [currentSound, setCurrentSound] = useState(null); //Guardamos el sonido que está sonando actualmente
  const soundRef = useRef(null); //Una referencia a el
  const [isLooping, setIsLooping] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

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
    if (currentSound?.id === sound.id && !isPlaying && progress > 0) {
      // Resume the paused sound
      if (soundRef.current) {
        await soundRef.current.playAsync();
        setIsPlaying(true);
        return;
      }
    }

    if (soundRef.current) {
      await soundRef.current.unloadAsync();
    }

    //Ejecutamos el nuevo sonido y actualizamos la referencia y el sonido actual
    const { sound: newSound } = await Audio.Sound.createAsync(sound.source, {
      shouldPlay: true,
      //Que este en bucle o no ahora dependerá del user
      isLooping: isLooping,
    });

    //Configuramos el sonido para que cuando acabe se detenga
    newSound.setOnPlaybackStatusUpdate((status) => {
      setIsPlaying(status.isPlaying);
      if (status.didJustFinish) {
        if (!isLooping) {
          //Si el audio termina y no esta en loop se detiene y se resetea el estado de las variables
          setIsPlaying(false);
          setCurrentSound(null);
          setProgress(0);
        }
      }
    });
    soundRef.current = newSound;
    setCurrentSound(sound);
    setIsPlaying(true);
    setProgress(0);
  };

  const stopSound = async () => {
    if (soundRef.current) {
      try {
        // Pause the sound instead of stopping completely
        await soundRef.current.pauseAsync();
        setIsPlaying(false);
      } catch (error) {
        console.error("Error pausando sonido: ", error);
      }
    }
  };

  const toggleLooping = async () => {
    if (soundRef.current) {
      //Indicamos que el audio debería de reproducirse en loop
      await soundRef.current.setIsLoopingAsync(!isLooping);
      setIsLooping(!isLooping); //Guardamos el estado actual
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
          {/* Botón para repetir o no el audio */}

          <TouchableOpacity
            onPress={() =>
              //Solo permitimos activar el loop si el audio ya estaba sonando
              currentSound?.id === item.id ? toggleLooping() : null
            }
          >
            {isLooping ? (
              <Repeat color="white" size={24} />
            ) : (
              //Si el sonido no se esta reproduciendo, ponemos el color del icono en azul si el audio es el que se esta reproduciendo, y en gris si no para mostrar al usuario como que la opción esta desactivada visualmente
              <Repeat
                color={`${
                  currentSound?.id === item.id ? "#1e273a" : "#626364"
                }`}
                size={24}
              />
            )}
          </TouchableOpacity>

          {/* Botón para pausar o reproducir el audio */}
          <TouchableOpacity
            onPress={() =>
              currentSound?.id === item.id ? stopSound() : playSound(item)
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

  return (
    <SafeAreaView className="flex-1 bg-primary">
      <Text
        className="text-center font-bold text-[#6366ff] py-4"
        style={{ fontSize: 24 }}
      >
        Sonidos Relajantes
      </Text>
      <FlatList
        data={relaxationSounds}
        renderItem={renderSoundItem}
        keyExtractor={(item) => item.id}
        contentContainerClassName="pb-4 gap-4"
      />
    </SafeAreaView>
  );
};

export default Music;
