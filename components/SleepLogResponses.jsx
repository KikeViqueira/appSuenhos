import {
  View,
  Text,
  Modal,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import React from "react";
import NotFound from "./NotFound";
import { MaterialCommunityIcons, Feather, AntDesign } from "@expo/vector-icons";

const SleepLogResponses = ({ isVisible, onClose, sleepLog }) => {
  const formatTime = (timeString) => {
    if (!timeString) return "No registrado";

    //Suponemos que el timeString está en formato ISO
    try {
      const date = new Date(timeString);
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      console.error("Error formatting time:", e);
      return timeString;
    }
  };

  // Formateamos la duración de milisegundos a horas y minutos
  const formatDuration = (durationMs) => {
    if (!durationMs && durationMs !== 0) return "No registrado";

    try {
      // Convertimos a número si es una cadena
      const ms =
        typeof durationMs === "string" ? parseInt(durationMs) : durationMs;

      // Convertimos milisegundos a horas y minutos
      const hours = Math.floor(ms / 3600000);
      const minutes = Math.floor((ms % 3600000) / 60000);

      if (hours === 0) {
        return `${minutes} minutos`;
      } else if (minutes === 0) {
        return `${hours} ${hours === 1 ? "hora" : "horas"}`;
      } else {
        return `${hours} ${
          hours === 1 ? "hora" : "horas"
        } y ${minutes} minutos`;
      }
    } catch (e) {
      console.error("Error formatting duration:", e);
      return String(durationMs);
    }
  };

  const getQuestionText = (answerId) => {
    switch (answerId) {
      case "answer1":
        return "Calidad del sueño";
      case "answer2":
        return "Nivel de descanso";
      default:
        return answerId;
    }
  };

  //Función que para cuando se recorra el mapa de preguntas se le asigna un icono a cada una de ellas
  const getQuestionIcon = (answerId) => {
    switch (answerId) {
      case "answer1":
        return <Feather name="sun" size={22} color="#6366ff" />;
      case "answer2":
        return <Feather name="coffee" size={22} color="#6366ff" />;
      default:
        return null;
    }
  };

  //Comprobamos si el mapa de preguntas tiene datos
  const hasData = sleepLog && Object.keys(sleepLog).length > 0;

  return (
    <View>
      <Modal visible={isVisible} animationType="slide">
        <SafeAreaView className="flex flex-col w-full h-full bg-primary">
          <View className="flex flex-row items-center px-4 py-3 border-b border-[#2a3548]">
            <TouchableOpacity
              onPress={onClose}
              className="p-2 mr-3 bg-[#1e2a47] rounded-full"
              activeOpacity={0.7}
            >
              <Feather name="arrow-left" size={24} color="#6366ff" />
            </TouchableOpacity>
            <View className="flex-row items-center">
              <View className="w-2 h-14 mr-3 bg-[#6366ff] rounded-full" />
              <Text className="text-[24px] font-bold text-white">
                Respuestas de Hoy
              </Text>
            </View>
          </View>

          {hasData ? (
            <ScrollView
              className="flex-1"
              contentContainerStyle={{
                paddingVertical: 20,
                paddingHorizontal: 16,
                gap: 16,
              }}
              showsVerticalScrollIndicator={true}
              indicatorStyle="white"
            >
              <View className="w-full">
                {/* Sleep time - Enhanced card */}
                <View className="mb-4 overflow-hidden bg-[#1e2a47] rounded-xl shadow-lg">
                  <View className="flex-row">
                    <View className="w-2 h-full bg-[#4834d4]" />
                    <View className="flex-1 p-5">
                      <View className="flex-row items-center gap-2 mb-3">
                        <MaterialCommunityIcons
                          name="sleep"
                          size={22}
                          color="#6366ff"
                        />
                        <Text className="text-xl font-bold color-[#6366ff]">
                          Hora de dormir
                        </Text>
                      </View>
                      <Text className="text-lg color-white">
                        {formatTime(sleepLog.sleepTime)}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Wake up time - Enhanced card */}
                <View className="mb-4 overflow-hidden bg-[#1e2a47] rounded-xl shadow-lg">
                  <View className="flex-row">
                    <View className="w-2 h-full bg-[#ff4757]" />
                    <View className="flex-1 p-5">
                      <View className="flex-row items-center gap-2 mb-3">
                        <Feather name="clock" size={22} color="#6366ff" />
                        <Text className="text-xl font-bold color-[#6366ff]">
                          Hora de despertar
                        </Text>
                      </View>
                      <Text className="text-lg color-white">
                        {formatTime(sleepLog.wakeUpTime)}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Sleep duration - Enhanced card */}
                <View className="mb-4 overflow-hidden bg-[#1e2a47] rounded-xl shadow-lg">
                  <View className="flex-row">
                    <View className="w-2 h-full bg-[#feca57]" />
                    <View className="flex-1 p-5">
                      <View className="flex-row items-center gap-2 mb-3">
                        <AntDesign name="hourglass" size={22} color="#6366ff" />
                        <Text className="text-xl font-bold color-[#6366ff]">
                          Duración del sueño
                        </Text>
                      </View>
                      <Text className="text-lg color-white">
                        {formatDuration(sleepLog.duration)}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Questions - Enhanced cards */}
                {Object.entries(sleepLog).map(([key, value]) => {
                  //Campos del mapa que no representan preguntas
                  if (["wakeUpTime", "sleepTime", "duration"].includes(key))
                    return null;

                  return (
                    <View
                      key={key}
                      className="mb-4 overflow-hidden bg-[#1e2a47] rounded-xl shadow-lg"
                    >
                      <View className="flex-row">
                        <View className="w-2 h-full bg-[#1dd1a1]" />
                        <View className="flex-1 p-5">
                          <View className="flex-row items-center gap-2 mb-3">
                            {getQuestionIcon(key)}
                            <Text className="text-xl font-bold color-[#6366ff]">
                              {getQuestionText(key)}
                            </Text>
                          </View>
                          <Text className="text-lg color-white">
                            {String(value)}
                          </Text>
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            </ScrollView>
          ) : (
            <View className="items-center justify-center flex-1 px-6">
              <NotFound />

              <View className="items-center mb-8">
                <Text className="mb-3 text-2xl font-bold text-center text-white">
                  Cuestionario pendiente
                </Text>
                <Text className="text-base text-center text-[#8a94a6] px-6 leading-relaxed">
                  No se ha completado el cuestionario matutino de hoy o ha
                  habido un error al recuperar las respuestas
                </Text>
              </View>

              <TouchableOpacity
                onPress={onClose}
                className="py-4 px-8 bg-[#6366ff] rounded-xl shadow-lg"
                activeOpacity={0.8}
              >
                <Text className="text-base font-semibold text-white">
                  Volver
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </SafeAreaView>
      </Modal>
    </View>
  );
};

export default SleepLogResponses;
