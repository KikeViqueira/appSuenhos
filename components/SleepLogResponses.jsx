import {
  View,
  Text,
  Modal,
  SafeAreaView,
  Button,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import React from "react";
import { AlertTriangle, Clock, MoonStar, Hourglass } from "lucide-react-native";

const SleepLogResponses = ({ isVisible, onClose, sleepLog }) => {
  const formatTime = (timeString) => {
    if (!timeString) return "No registrado";

    // Assuming timeString is in ISO format
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

  // Format duration from milliseconds to hours and minutes
  const formatDuration = (durationMs) => {
    if (!durationMs && durationMs !== 0) return "No registrado";

    try {
      // Convert to number if it's a string
      const ms =
        typeof durationMs === "string" ? parseInt(durationMs) : durationMs;

      // Convert milliseconds to hours and minutes
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

  // Check if sleepLog is empty or undefined
  const hasData = sleepLog && Object.keys(sleepLog).length > 0;

  return (
    <View>
      <Modal visible={isVisible} animationType="slide">
        <SafeAreaView className="flex flex-col w-full h-full gap-8 bg-primary">
          <View className="flex flex-row items-center justify-start gap-6 px-3">
            <Button title="Volver" onPress={onClose}></Button>
            <Text
              className="font-bold text-center color-white"
              style={{ fontSize: 24 }}
            >
              Respuestas de Hoy
            </Text>
          </View>

          <ScrollView
            contentContainerStyle={{
              display: "flex",
              alignItems: "center",
              justifyContent: "start",
              gap: 20,
              width: "100%",
              paddingBottom: 40,
            }}
          >
            {hasData ? (
              <View className="w-[90%] gap-6">
                {/* Sleep time */}
                <View className="bg-[#1e2a47] p-5 rounded-xl">
                  <View className="flex-row items-center gap-2 mb-3">
                    <MoonStar size={22} color="#6366ff" />
                    <Text className="text-xl font-bold color-[#6366ff]">
                      Hora de dormir
                    </Text>
                  </View>
                  <Text className="text-lg color-white">
                    {formatTime(sleepLog.sleepTime)}
                  </Text>
                </View>

                {/* Wake up time */}
                <View className="bg-[#1e2a47] p-5 rounded-xl">
                  <View className="flex-row items-center gap-2 mb-3">
                    <Clock size={22} color="#6366ff" />
                    <Text className="text-xl font-bold color-[#6366ff]">
                      Hora de despertar
                    </Text>
                  </View>
                  <Text className="text-lg color-white">
                    {formatTime(sleepLog.wakeUpTime)}
                  </Text>
                </View>

                {/* Sleep duration */}
                <View className="bg-[#1e2a47] p-5 rounded-xl">
                  <View className="flex-row items-center gap-2 mb-3">
                    <Hourglass size={22} color="#6366ff" />
                    <Text className="text-xl font-bold color-[#6366ff]">
                      Duración del sueño
                    </Text>
                  </View>
                  <Text className="text-lg color-white">
                    {formatDuration(sleepLog.duration)}
                  </Text>
                </View>

                {/* Questions */}
                {Object.entries(sleepLog).map(([key, value]) => {
                  // Skip time and duration fields as they are displayed separately
                  if (["wakeUpTime", "sleepTime", "duration"].includes(key))
                    return null;

                  return (
                    <View key={key} className="bg-[#1e2a47] p-5 rounded-xl">
                      <Text className="text-xl font-bold color-[#6366ff] mb-3">
                        {getQuestionText(key)}
                      </Text>
                      <Text className="text-lg color-white">
                        {String(value)}
                      </Text>
                    </View>
                  );
                })}
              </View>
            ) : (
              //Nunca debería entrar aquí a no ser que ocurra un fallo en la api al devolver la información del registro de hoy
              <View className="w-[90%] items-center justify-center gap-4 mt-10">
                <AlertTriangle size={60} color="#ff4757" />
                <Text className="text-xl text-center color-white">
                  No hay datos disponibles para hoy
                </Text>
                <Text className="text-base text-center color-[#8a94a6] px-4">
                  Completa el cuestionario matutino para ver tus respuestas
                  aquí.
                </Text>
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </View>
  );
};

export default SleepLogResponses;
