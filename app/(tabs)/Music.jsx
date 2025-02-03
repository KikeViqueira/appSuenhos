import React, { useState, useRef } from "react";
import { View, Text, TouchableOpacity, FlatList } from "react-native";
import { Audio } from "expo-av";
import { Colors } from "../../constants/Colors";
import { LinearGradient } from "expo-linear-gradient";
import { Play, Pause } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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
    title: "White Noise",
    source: require("../../assets/sounds/birds-in-forest.mp3"),
  },
];

const Music = () => {
  //Guardamos el sonido que está sonando actualmente
  const [currentSound, setCurrentSound] = useState(null);
  const soundRef = useRef(null);

  const playSound = async (sound) => {
    if (soundRef.current) {
      await soundRef.current.unloadAsync();
    }

    //Ejecutamos el nuevo sonido y actualizamos la referencia y el sonido actual
    const { sound: newSound } = await Audio.Sound.createAsync(sound.source, {
      shouldPlay: true,
      isLooping: true,
    });
    soundRef.current = newSound;
    setCurrentSound(sound);
  };

  const stopSound = async () => {
    if (soundRef.current) {
      await soundRef.current.stopAsync();
      await soundRef.current.unloadAsync();
      soundRef.current = null;
      setCurrentSound(null);
    }
  };

  const renderSoundItem = ({ item }) => (
    <TouchableOpacity
      onPress={() =>
        //Si presionamos encima del sonido que estamos ejecutando lo detenemos y si no lo estamos ejecutando lo iniciamos
        currentSound?.id === item.id ? stopSound() : playSound(item)
      }
      //Cuando ejecutemos un sonido o este sin sonar el contenido tiene que tener un determinado color de fondo
      className={`${
        currentSound?.id === item.id ? "bg-[#6366ff]" : "bg-[#1e273a]"
      } w-[95%] self-center flex p-6 gap-4  rounded-lg border border-[#323d4f]`}
    >
      <View className="flex-row justify-between items-center">
        <Text className="text-base font-semibold text-white">{item.title}</Text>
        {/* Si estamos ejecutando este sonido lo detenemos y si no lo ejecutamos, indicand el respectivo icono en el botón */}
        {currentSound?.id === item.id ? (
          <Pause color="white" size={24} />
        ) : (
          <Play color="white" size={24} />
        )}
      </View>
    </TouchableOpacity>
  );

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
