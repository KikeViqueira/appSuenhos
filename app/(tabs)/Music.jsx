import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Alert,
  ScrollView,
  Modal,
  Animated,
  ActivityIndicator,
} from "react-native";
import { Audio } from "expo-av";
import { Feather, FontAwesome, Ionicons, AntDesign } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import Slider from "@react-native-community/slider";
import * as DocumentPicker from "expo-document-picker";
import useSound from "../../hooks/useSound";
import AsyncStorage from "@react-native-async-storage/async-storage";
import useFlags from "../../hooks/useFlags";

const Music = () => {
  //Recuperamos las funcionalidades del useSound para usar en este componente
  const {
    staticSounds,
    getAllStaticSounds,
    userSounds,
    getUserSounds,
    deleteUserSound,
    postSound,
    loading,
    error,
  } = useSound();

  const [currentSound, setCurrentSound] = useState(null); //Guardamos el sonido que está sonando actualmente
  const soundRef = useRef(null); //Una referencia a el
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  //Definimos los estados para controlar el número de audios que sube el user a la app
  const maxSounds = 6;

  // Estados para el temporizador
  const [timerModalVisible, setTimerModalVisible] = useState(false);
  const [timerDuration, setTimerDuration] = useState(null); // en milisegundos
  const [timerRemaining, setTimerRemaining] = useState(null);
  const [timerActive, setTimerActive] = useState(false);
  const timerOpacityAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  // Estados para indicadores de carga
  const [loadingModalVisible, setLoadingModalVisible] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [loadingType, setLoadingType] = useState(""); // "upload" o "delete"
  const [deletingSoundId, setDeletingSoundId] = useState(null);
  const loadingProgressAnim = useRef(new Animated.Value(0)).current;

  const { updateConfigFlagValue } = useFlags();

  const timerOptions = [
    { label: "15 min", value: 15 * 60 * 1000 },
    { label: "30 min", value: 30 * 60 * 1000 },
    { label: "1 hora", value: 60 * 60 * 1000 },
    { label: "2 horas", value: 2 * 60 * 60 * 1000 },
  ];

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

  // Cargar preferencias del temporizador al iniciar
  useEffect(() => {
    const loadTimerPreference = async () => {
      try {
        const savedValue = await AsyncStorage.getItem("preferredTimerDuration");
        if (savedValue) {
          setTimerDuration(parseInt(savedValue));
        }
      } catch (error) {
        console.error("Error cargando preferencias del temporizador:", error);
      }
    };

    loadTimerPreference();
  }, []);

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

  // Efecto para gestionar el temporizador
  useEffect(() => {
    let timerInterval;

    if (
      timerActive &&
      timerRemaining !== null &&
      isPlaying &&
      currentSound?.isLooping
    ) {
      // Actualizar la animación de progreso del temporizador
      if (timerDuration > 0) {
        const progress = 1 - timerRemaining / timerDuration;
        Animated.timing(progressAnim, {
          toValue: progress,
          duration: 300,
          useNativeDriver: false,
        }).start();
      }

      timerInterval = setInterval(() => {
        setTimerRemaining((prev) => {
          const newRemaining = prev - 1000;

          // Cuando quedan menos de 10 segundos, empezamos a animar la opacidad
          if (newRemaining <= 10000 && newRemaining > 0) {
            Animated.sequence([
              Animated.timing(timerOpacityAnim, {
                toValue: 0.3,
                duration: 500,
                useNativeDriver: true,
              }),
              Animated.timing(timerOpacityAnim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
              }),
            ]).start();
          }

          // Si el tiempo ha terminado, detenemos el sonido
          if (newRemaining <= 0) {
            stopSound();
            setTimerActive(false);
            setTimerRemaining(null);
            return null;
          }

          return newRemaining;
        });
      }, 1000);
    } else if (
      !isPlaying &&
      currentSound?.isLooping &&
      timerRemaining !== null
    ) {
      // Cuando el sonido está pausado pero aún tiene tiempo restante,
      // no necesitamos hacer nada, solo detenemos el intervalo
      // El temporizador se reactivará cuando se reanude la reproducción
    } else if (!currentSound?.isLooping && timerActive) {
      // Si se desactiva el bucle mientras el temporizador estaba activo, cancelamos el temporizador
      setTimerActive(false);
    }

    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, [timerActive, timerRemaining, isPlaying, currentSound?.isLooping]);

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

          // Restaurar el temporizador si hay tiempo restante y el sonido está en bucle
          if (timerRemaining !== null && currentSound.isLooping) {
            setTimerActive(true);
          }

          console.log("Reanudando sonido: ", sound.id);
          return;
        }
      }

      //Si cambiamos el sonido reseteamos el progreso
      if (currentSound?.id !== sound.id) {
        setProgress(0);

        // Reiniciamos el temporizador si el nuevo sonido está en bucle
        if (timerDuration && sound.isLooping) {
          setTimerRemaining(timerDuration);
          setTimerActive(true);
        }
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
          setTimerActive(false);
          setTimerRemaining(null);
        }
      });
      soundRef.current = newSound;
      setCurrentSound({ ...sound, isLooping: sound.isLooping || false }); //En este caso usamos el estado directamente
      setIsPlaying(true);

      // Activar temporizador si existe y el sonido está en bucle
      if (timerDuration && sound.isLooping) {
        setTimerRemaining(timerDuration);
        setTimerActive(true);
      }

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

        setIsPlaying(false); //Asegurar que React detecte el cambio
        setProgress(status.positionMillis); //Guardamos la posición actual

        // Pausar el temporizador sin cancelarlo, manteniendo el tiempo restante
        if (timerActive) {
          setTimerActive(false);
          // No reseteamos timerRemaining para mantener el tiempo cuando se reanude
        }

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

        // Si está activando el bucle y hay un temporizador configurado, lo activamos
        if (newIsLooping && timerDuration) {
          setTimerRemaining(timerDuration);
          setTimerActive(true);
        } else if (!newIsLooping) {
          // Si está desactivando el bucle, desactivamos el temporizador
          setTimerActive(false);
        }
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

  // Función para configurar el temporizador
  const setTimer = async (duration) => {
    setTimerDuration(duration);
    if (duration) {
      setTimerRemaining(duration);

      // Solo activar el temporizador si hay un sonido reproduciéndose en bucle
      if (currentSound?.isLooping && isPlaying) {
        setTimerActive(true);
      }

      // Guardar preferencia del usuario
      try {
        await AsyncStorage.setItem(
          "preferredTimerDuration",
          duration.toString()
        );
      } catch (error) {
        console.error("Error guardando preferencia de temporizador:", error);
      }

      //Actualizamos el estado de la bandera en la BD
      await updateConfigFlagValue(
        "preferredTimerDuration",
        duration.toString()
      );
    } else {
      await cancelTimer();
    }
    setTimerModalVisible(false);
  };

  // Función para cancelar el temporizador
  const cancelTimer = async () => {
    setTimerActive(false);
    setTimerRemaining(null);
    setTimerDuration(null);

    // Reset de la animación
    Animated.timing(progressAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: false,
    }).start();

    // Eliminar preferencia guardada
    try {
      await AsyncStorage.removeItem("preferredTimerDuration");
    } catch (error) {
      console.error("Error eliminando preferencia de temporizador:", error);
    }
  };

  // Función para formatear tiempo del temporizador
  const formatTimerTime = (milliseconds) => {
    if (!milliseconds) return "--:--";

    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes < 10 ? "0" : ""}${minutes}:${
        seconds < 10 ? "0" : ""
      }${seconds}`;
    }
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
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
          {item.name.length > 15
            ? item.name.substring(0, 15) + "..."
            : item.name}
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
            <Feather
              name="repeat"
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

          {/* Botón para pausar o reproducir el audio */}
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
              <Feather name="pause" color="white" size={20} />
            ) : (
              <Feather
                name="play"
                color={currentSound?.id === item.id ? "white" : "#6366ff"}
                size={20}
              />
            )}
          </TouchableOpacity>

          {/* Botón para eliminar sonidos si estos han sido subidos por el user */}
          {!item.isDefault && (
            <TouchableOpacity
              className={`p-2 rounded-full ${
                deletingSoundId === item.id
                  ? "bg-gray-500/20"
                  : "bg-[#ff6b6b]/20"
              }`}
              onPress={() => handleDeleteSound(item.id)}
              disabled={deletingSoundId === item.id}
            >
              {deletingSoundId === item.id ? (
                <ActivityIndicator size="small" color="#9ca3af" />
              ) : (
                <Feather name="trash-2" color="#ff6b6b" size={20} />
              )}
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

        // Mostrar indicador de carga
        setLoadingType("upload");
        setLoadingMessage("Subiendo el sonido...");
        setLoadingModalVisible(true);

        // Iniciar animación de progreso
        loadingProgressAnim.setValue(0);
        Animated.loop(
          Animated.sequence([
            Animated.timing(loadingProgressAnim, {
              toValue: 1,
              duration: 1500,
              useNativeDriver: true,
            }),
            Animated.timing(loadingProgressAnim, {
              toValue: 0,
              duration: 1500,
              useNativeDriver: true,
            }),
          ])
        ).start();

        const { extension, mimeType } = getFileType(result.assets[0].uri);

        //Limpiamos el nombre del audio, nos quedamos con lo que haya antes del punto
        const fileName = result.assets[0].name.split(".")[0];

        //Creamos el objeto que vamos a guardar en la bd
        const newSound = new FormData();
        newSound.append("file", {
          uri: result.assets[0].uri,
          name: `${fileName}.${extension}`,
          type: mimeType,
        });

        console.log(
          "SONIDO QUE EL USER QUIERES SUBIR A LA BASE DE DATOS: ",
          newSound
        );
        //llamamos al endpoint encargado de subir el sonido en la app
        await postSound(newSound);
        //Una vez subido el sonido por parte del user tenemos que llamar a la función que recupera los sonidos del user
        await getUserSounds();
        console.log(userSounds);

        // Ocultar indicador de carga
        loadingProgressAnim.stopAnimation();
        setLoadingModalVisible(false);

        // Mostrar mensaje de éxito
        Alert.alert("¡Éxito!", "Tu sonido se ha subido correctamente");
      }
    } catch (error) {
      console.error("Error completo al subir el sonido:", error);
      loadingProgressAnim.stopAnimation();
      setLoadingModalVisible(false);
      Alert.alert(
        "Error",
        `No se pudo subir el sonido: ${error.message || "Error desconocido"}`
      );
    }
  };

  // Función mejorada para eliminar sonidos con indicador de carga
  const handleDeleteSound = async (soundId) => {
    try {
      setDeletingSoundId(soundId);
      setLoadingType("delete");
      setLoadingMessage("Eliminando sonido...");
      setLoadingModalVisible(true);

      // Iniciar animación de progreso
      loadingProgressAnim.setValue(0);
      Animated.loop(
        Animated.sequence([
          Animated.timing(loadingProgressAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(loadingProgressAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();

      await deleteUserSound(soundId);

      loadingProgressAnim.stopAnimation();
      setLoadingModalVisible(false);
      setDeletingSoundId(null);

      // Mostrar mensaje de éxito
      Alert.alert(
        "¡Sonido eliminado!",
        "El sonido se ha eliminado correctamente"
      );
    } catch (error) {
      console.error("Error al eliminar el sonido:", error);
      loadingProgressAnim.stopAnimation();
      setLoadingModalVisible(false);
      setDeletingSoundId(null);
      Alert.alert(
        "Error",
        `No se pudo eliminar el sonido: ${error.message || "Error desconocido"}`
      );
    }
  };

  //Función para saber el type del audio que el user quiere subir
  const getFileType = (uri) => {
    const extension = uri.split(".").pop();
    const mimeType = `audio/${extension === "mp3" ? "mpeg" : extension}`;
    return { extension, mimeType };
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
              <FontAwesome name="ban" color="white" size={24} className="p-2" />
            ) : (
              <Feather name="upload" color="white" size={24} className="p-2" />
            )}
          </View>
        </TouchableOpacity>

        <View className="flex-row justify-end mt-2">
          <Text className="mr-2 text-white">
            {userSounds.length}/{maxSounds} sonidos subidos
          </Text>
        </View>
      </View>

      {/* Timer global section */}
      {(isPlaying && currentSound?.isLooping) || timerActive ? (
        <View className="w-[95%] self-center mb-2">
          <TouchableOpacity
            onPress={() => setTimerModalVisible(true)}
            className="bg-[#1e273a] p-4 rounded-xl shadow border border-[#323d4f] overflow-hidden"
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <View className="bg-[#6366ff]/20 p-2 rounded-full mr-3">
                  <Ionicons name="timer-outline" color="#6366ff" size={20} />
                </View>
                <View>
                  <Text className="font-semibold text-white">Temporizador</Text>
                  {timerActive ? (
                    <Animated.Text
                      className="text-[#6366ff]"
                      style={{ opacity: timerOpacityAnim }}
                    >
                      El sonido se detendrá en {formatTimerTime(timerRemaining)}
                    </Animated.Text>
                  ) : (
                    <Text className="text-gray-400">
                      {timerDuration
                        ? `Configurado: ${formatTimerTime(timerDuration)}`
                        : "No configurado"}
                    </Text>
                  )}
                </View>
              </View>

              {timerActive && (
                <TouchableOpacity
                  onPress={cancelTimer}
                  className="bg-[#ff6b6b]/20 p-2 rounded-full"
                >
                  <FontAwesome name="times" color="#ff6b6b" size={18} />
                </TouchableOpacity>
              )}
            </View>

            {/* Barra de progreso del temporizador */}
            {timerActive && timerDuration && (
              <View className="h-1 w-full bg-[#323d4f] rounded-full mt-3 overflow-hidden">
                <Animated.View
                  className="h-full bg-[#6366ff] rounded-full"
                  style={{
                    width: progressAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ["0%", "100%"],
                    }),
                  }}
                />
              </View>
            )}
          </TouchableOpacity>
        </View>
      ) : null}

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

      {/* Modal de carga */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={loadingModalVisible}
        onRequestClose={() => {}} // Evitamos que se cierre accidentalmente
      >
        <View className="items-center justify-center flex-1 bg-black/70">
          <View className="w-[80%] bg-[#1e2a47] p-8 rounded-2xl items-center">
            <View
              className={`w-16 h-16 rounded-full items-center justify-center mb-4 ${
                loadingType === "upload" ? "bg-[#6366ff]/20" : "bg-[#ff6b6b]/20"
              }`}
            >
              {loadingType === "upload" ? (
                <Feather name="upload" color="#6366ff" size={28} />
              ) : (
                <Feather name="trash-2" color="#ff6b6b" size={28} />
              )}
            </View>

            <ActivityIndicator
              size="large"
              color={loadingType === "upload" ? "#6366ff" : "#ff6b6b"}
              className="mb-4"
            />

            <Text className="mb-2 text-xl font-bold text-center text-white">
              {loadingType === "upload"
                ? "Subiendo sonido"
                : "Eliminando sonido"}
            </Text>

            <Text className="text-base text-center text-gray-300">
              {loadingMessage}
            </Text>

            {/* Barra de progreso animada */}
            <View className="w-full h-2 bg-[#323d4f] rounded-full mt-4 overflow-hidden">
              <Animated.View
                className={`h-full rounded-full ${
                  loadingType === "upload" ? "bg-[#6366ff]" : "bg-[#ff6b6b]"
                }`}
                style={{
                  width: "30%",
                  transform: [
                    {
                      translateX: loadingProgressAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 300], // Se mueve de izquierda a derecha
                      }),
                    },
                  ],
                  opacity: loadingProgressAnim.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0.3, 1, 0.3], // Efecto de pulsación
                  }),
                }}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal del temporizador */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={timerModalVisible}
        onRequestClose={() => setTimerModalVisible(false)}
      >
        <View className="items-center justify-center flex-1 bg-black/60">
          <View className="w-[85%] bg-[#1e2a47] p-6 rounded-2xl">
            <View className="flex-row items-center justify-between mb-5">
              <Text className="text-xl font-bold text-white">Temporizador</Text>
              <TouchableOpacity
                onPress={() => setTimerModalVisible(false)}
                className="p-1"
              >
                <AntDesign name="close" color="white" size={24} />
              </TouchableOpacity>
            </View>

            <Text className="mb-4 text-base text-white">
              Selecciona cuándo deseas que se detenga la reproducción del sonido
              en bucle
            </Text>

            <View className="mb-4">
              {timerOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  className={`flex-row items-center justify-between p-4 my-1 rounded-xl ${
                    timerDuration === option.value
                      ? "bg-[#6366ff]"
                      : "bg-[#323d4f]"
                  }`}
                  onPress={() => setTimer(option.value)}
                >
                  <Text className="font-semibold text-white">
                    {option.label}
                  </Text>
                  {timerDuration === option.value && (
                    <Feather name="check" color="white" size={20} />
                  )}
                </TouchableOpacity>
              ))}

              <TouchableOpacity
                className={`flex-row items-center justify-between p-4 my-1 rounded-xl ${
                  timerDuration === null ? "bg-[#6366ff]" : "bg-[#323d4f]"
                }`}
                onPress={() => setTimer(null)}
              >
                <Text className="font-semibold text-white">Sin límite</Text>
                {timerDuration === null && (
                  <Feather name="check" color="white" size={20} />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default Music;
