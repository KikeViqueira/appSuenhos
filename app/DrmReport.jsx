import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  Animated,
} from "react-native";
import React, { useEffect, useState, useRef } from "react";
import { Feather, FontAwesome5 } from "@expo/vector-icons";
import { router } from "expo-router";
import useDRM from "../hooks/useDRM";
import { useAuthContext } from "../context/AuthContext";
import * as Print from "expo-print"; // Usamos expo-print en lugar de react-native-html-to-pdf
import * as Sharing from "expo-sharing";
import useTips from "../hooks/useTips";
import { getDailyTipFlag } from "../hooks/useTips";
import { LinearGradient } from "expo-linear-gradient";
import useNotifications from "../hooks/useNotifications";
import APIErrorModal from "../components/APIErrorModal";

const DrmReport = () => {
  const { getDrmToday, drmToday } = useDRM();
  const { generateTip } = useTips();
  const [tipButtonState, setTipButtonState] = useState("default"); //Controla el estado del botón a la hora de generar el tip
  const [showScrollIndicator, setShowScrollIndicator] = useState(true);
  const scrollY = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Estados para el modal de error
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorModalType, setErrorModalType] = useState("generateTip");

  //Recuperamos la info del user ya que necesitamos su nombre para poner en el informe que el user va a descargar
  const { userInfo } = useAuthContext();

  // Hook de notificaciones
  const { cancelNotificationById, scheduleNotificationWithId } =
    useNotifications();

  // Función para detectar si estamos al final del scroll
  const handleScroll = (event) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    scrollY.setValue(offsetY);

    const layoutHeight = event.nativeEvent.layoutMeasurement.height;
    const contentHeight = event.nativeEvent.contentSize.height;

    // Si el scroll está cerca del final, ocultar el indicador (similar a Stats.jsx)
    if (layoutHeight + offsetY >= contentHeight - 20) {
      setShowScrollIndicator(false);
    } else {
      setShowScrollIndicator(true);
    }
  };

  // Efecto para manejar la animación del indicador cuando cambia su visibilidad
  useEffect(() => {
    if (showScrollIndicator) {
      // Mostrar con animación
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      // Ocultar con animación
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [showScrollIndicator, fadeAnim]);

  const handleGenerateTip = async () => {
    if (tipButtonState === "generating") return;

    setTipButtonState("generating");
    try {
      const result = await generateTip();
      //Tenemos que comprobar si se ha producido un error al generar el tip, si es asi volvemos al estado inicial dando feedback al user de que está pasando, si no da se crea correctamente el tip
      if (result) {
        setTipButtonState("generated");

        // Cancelar la notificación de recordatorio ya que el usuario generó el tip
        cancelNotificationById("DailyTip");

        // Mostrar mensaje al usuario
        Alert.alert(
          "Tip generado",
          "Se ha generado un nuevo tip personalizado. ¿Quieres verlo ahora?",
          [
            {
              text: "Más tarde",
              style: "cancel",
            },
            {
              text: "Ver ahora",
              onPress: () => router.push("./(tabs)/Tips"),
            },
          ]
        );
      } else {
        setTipButtonState("default");
        // Mostrar modal de error en lugar de Alert
        setErrorModalType("generateTip");
        setShowErrorModal(true);
      }
    } catch (error) {
      console.error("Error generando tip:", error);
      setTipButtonState("default");
      // Mostrar modal de error en lugar de Alert
      setErrorModalType("generateTip");
      setShowErrorModal(true);
    }
  };

  // Función para verificar si se ha generado un tip hoy
  const checkDailyTipStatus = async () => {
    try {
      const tipFlag = await getDailyTipFlag();
      if (tipFlag) {
        setTipButtonState("generated");
      } else {
        setTipButtonState("default");
      }
    } catch (error) {
      console.error("Error al verificar el estado del tip diario:", error);
      setTipButtonState("default");
    }
  };

  // Cargar los datos iniciales cuando el componente se monta
  useEffect(() => {
    const loadInitialData = async () => {
      // Intentamos cargar el informe DRM del día de hoy
      await getDrmToday();

      // Verificar estado del tip diario después de cargar los datos
      await checkDailyTipStatus();
    };

    loadInitialData();
  }, []);

  const navigateToTips = () => {
    router.push("./(tabs)/Tips");
  };

  /*
   * Función para generar el informe en PDF y descargarlo en el dispositivo del user
   * ya sea en IOS o Android.
   */

  const createPDF = async () => {
    // Generamos el HTML del informe con las variables dinámicas
    const htmlContent = `
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {
              font-family: 'Segoe UI', Arial, sans-serif;
              margin: 40px;
              color: #1e2a47;
              background-color: #f8f9fa;
            }
            .container {
              max-width: 800px;
              margin: 0 auto;
              background-color: white;
              padding: 40px;
              border-radius: 12px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .date {
              font-size: 14px;
              text-align: right;
              margin-bottom: 30px;
              color: #6366ff;
              font-weight: 500;
            }
            .header {
              text-align: center;
              margin-bottom: 40px;
              padding-bottom: 20px;
              border-bottom: 2px solid #6366ff;
            }
            .title {
              font-size: 28px;
              font-weight: bold;
              margin: 0;
              color: #1e2a47;
            }
            .subtitle {
              font-size: 20px;
              margin: 10px 0 0 0;
              color: #6366ff;
              font-weight: 500;
            }
            .content {
              font-size: 16px;
              line-height: 1.8;
              margin-bottom: 60px;
              color: #323d4f;
            }
            .content h2 {
              color: #1e2a47;
              font-size: 20px;
              margin-top: 30px;
              margin-bottom: 15px;
            }
            .content p {
              margin-bottom: 15px;
            }
            .footer {
              text-align: center;
              font-size: 14px;
              color: #6366ff;
              padding-top: 20px;
              border-top: 1px solid #e2e8f0;
            }
            .logo {
              text-align: center;
              margin-bottom: 20px;
            }
            .logo-text {
              font-size: 24px;
              font-weight: bold;
              color: #6366ff;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="date">${drmToday.timeStamp}</div>
            <div class="header">
              <div class="logo">
                <span class="logo-text">ZzzTime</span>
              </div>
              <div class="title">INFORME DRM</div>
              <div class="subtitle">${userInfo.name}</div>
            </div>
            <div class="content">
              ${drmToday.report}
            </div>
            <div class="footer">
              Generado por ZzzTime - Tu compañero de sueño
            </div>
          </div>
        </body>
      </html>
    `;

    try {
      // Generamos el PDF con expo-print
      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        base64: false,
      });

      // Usamos expo-sharing para que el usuario pueda decidir dónde guardar el PDF
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri);
      } else {
        alert("La opción de compartir no está disponible en este dispositivo.");
      }
    } catch (error) {
      console.error("Error al generar el PDF:", error);
    }
  };

  // Determinar el texto y estilo del botón según el estado
  const getButtonText = () => {
    switch (tipButtonState) {
      case "generating":
        return "Generando tip...";
      case "generated":
        return "Ver Tip Generado de hoy";
      default:
        return "Generar Tip Personalizado";
    }
  };

  const getButtonStyle = () => {
    switch (tipButtonState) {
      case "generating":
        return "bg-[#15db44]/60";
      case "generated":
        return "bg-[#6366ff]";
      default:
        return "bg-[#15db44]";
    }
  };

  // Verificar si hay datos de informe disponibles
  const hasReportData = drmToday && drmToday.report && drmToday.report !== "";

  return (
    <SafeAreaView className="flex-1 w-full h-full bg-primary">
      <View className="flex flex-row items-center justify-between py-4 w-[90%] self-center">
        <TouchableOpacity
          //Tenemos que usar replace ya que podemos acceder a esta pestaña desde dos sitios distintos
          onPress={() => router.replace("./(tabs)/Stats?section=drm")}
          className="flex flex-row gap-4 justify-start items-center py-2"
        >
          <Feather name="chevron-left" size={24} color="white" />
          <Text
            className="text-center font-bold text-[#6366ff] py-2"
            style={{ fontSize: 24 }}
          >
            Cuestionario diario DRM
          </Text>
        </TouchableOpacity>

        {hasReportData && (
          <View className="flex-row gap-4 items-center">
            <TouchableOpacity
              //Cuando pinchemos en el botón de descargar el informe llamamos a la función para pasarlo a PDF
              onPress={createPDF}
            >
              <Feather name="download" size={24} color="white" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View className="flex-1 flex-col justify-between items-center w-[90%] self-center mb-10">
        {hasReportData ? (
          <>
            <View className="max-h-[90%] relative">
              <ScrollView
                ref={scrollViewRef}
                contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
                showsVerticalScrollIndicator={true}
                indicatorStyle="white"
                className="border-b border-gray-700"
                onScroll={handleScroll}
                scrollEventThrottle={16}
              >
                <Text className="mb-4 text-lg text-white" selectable={true}>
                  {drmToday.report}
                </Text>
              </ScrollView>

              {/* Indicador de scroll animado */}
              {showScrollIndicator && (
                <Animated.View
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    opacity: fadeAnim,
                    alignItems: "center",
                    paddingBottom: 10,
                  }}
                >
                  <LinearGradient
                    colors={["transparent", "rgba(18, 24, 38, 0.9)"]}
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: 70,
                    }}
                  />
                  <View className="bg-[#6366ff] p-2 rounded-full">
                    <Feather name="chevron-down" size={24} color="white" />
                  </View>
                </Animated.View>
              )}
            </View>

            <TouchableOpacity
              className={`items-center py-4 w-full rounded-xl ${getButtonStyle()}`}
              //Si el botón esta en default llamamos a crear tip, si este ya está creado navegamos a la pestaña de tips
              onPress={
                tipButtonState === "default"
                  ? handleGenerateTip
                  : navigateToTips
              }
              //Desactivamos cualquier funcionalidad del botón mientras se este generando un tip
              disabled={tipButtonState === "generating"}
            >
              {tipButtonState === "generating" ? (
                <Text className="ml-2 text-lg text-white font-psemibold">
                  {getButtonText()}
                </Text>
              ) : (
                <Text className="text-lg text-white font-psemibold">
                  {getButtonText()}
                </Text>
              )}
            </TouchableOpacity>
          </>
        ) : (
          <View className="flex-1 justify-center items-center w-full">
            <View className="w-full items-center justify-center p-8 bg-[#1e2a47] rounded-xl flex gap-5">
              <View className="flex-row w-full">
                <View className="w-2 h-full bg-[#ff4757]" />
                <View className="flex-1">
                  <View className="p-4 mb-4 rounded-full bg-[#2a2a4a] self-center">
                    <Feather name="alert-triangle" size={60} color="#ff4757" />
                  </View>
                  <Text className="mb-2 text-2xl font-bold text-center text-white">
                    No hay informe DRM disponible
                  </Text>
                  <Text className="text-base text-center text-[#8a94a6] px-4 mb-4">
                    Para generar un informe DRM necesitas asegurarte de tener al
                    menos un cuestionario de registro matutino en la última
                    semana.
                  </Text>
                </View>
              </View>

              <View className="p-4 w-full rounded-xl">
                <View className="flex-row items-center mb-3">
                  <FontAwesome5
                    name="clipboard-list"
                    size={22}
                    color="#6366ff"
                  />
                  <Text className="ml-2 text-xl font-semibold text-[#6366ff]">
                    ¿Qué necesitas hacer?
                  </Text>
                </View>
                <View className="flex-row items-start mb-2">
                  <View className="w-6 h-6 rounded-full bg-[#6366ff] items-center justify-center mt-0.5 mr-2">
                    <Text className="font-bold text-white">1</Text>
                  </View>
                  <Text className="flex-1 text-white">
                    Completar un cuestionario matutino como mínimo una vez en
                    los últimos 7 días
                  </Text>
                </View>
                <View className="flex-row items-start mb-2">
                  <View className="w-6 h-6 rounded-full bg-[#6366ff] items-center justify-center mt-0.5 mr-2">
                    <Text className="font-bold text-white">2</Text>
                  </View>
                  <Text className="flex-1 text-white">
                    Rellenar el propio formulario DRM para tener un mejor
                    contexto y poder entregarte un informe mucho más preciso
                  </Text>
                </View>
                <View className="flex-row items-start">
                  <View className="w-6 h-6 rounded-full bg-[#6366ff] items-center justify-center mt-0.5 mr-2">
                    <Text className="font-bold text-white">3</Text>
                  </View>
                  <Text className="flex-1 text-white">
                    Pinchar en el botón de generar infome y venir a esta pestaña
                    a consultarlo
                  </Text>
                </View>
              </View>

              <View className="w-full bg-[#232e45] p-4 rounded-xl border border-[#3d4a69]">
                <View className="flex-row items-start">
                  <View className="bg-[#6366ff]/10 p-2 rounded-full mr-3">
                    <Feather name="info" size={20} color="#6366ff" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-[#6366ff] mb-1">
                      Mayor precisión con más datos
                    </Text>
                    <Text className="text-sm text-[#d1d5db]">
                      Ten en cuenta que cuantos más cuestionarios matutinos
                      completes, más preciso y personalizado será tu informe
                      DRM.
                    </Text>
                  </View>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => router.back()}
                className="py-3 px-6 bg-[#6366ff] rounded-xl"
                activeOpacity={0.7}
              >
                <Text className="text-base font-medium text-white">
                  Volver a inicio
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Modal de error para API */}
        <APIErrorModal
          visible={showErrorModal}
          onClose={() => setShowErrorModal(false)}
          errorType={errorModalType}
        />
      </View>
    </SafeAreaView>
  );
};

export default DrmReport;
