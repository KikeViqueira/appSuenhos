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
import { ChevronLeft, Download, ChevronDown } from "lucide-react-native";
import { router } from "expo-router";
import useDRM from "../hooks/useDRM";
import { useAuthContext } from "../context/AuthContext";
import * as Print from "expo-print"; // Usamos expo-print en lugar de react-native-html-to-pdf
import * as Sharing from "expo-sharing";
import useTips from "../hooks/useTips";
import { getDailyTipFlag } from "../hooks/useTips";
import { LinearGradient } from "expo-linear-gradient";

const DrmReport = () => {
  const { getDrmToday, error, drmToday } = useDRM();
  const { generateTip, getTips, tips } = useTips();
  const [tipButtonState, setTipButtonState] = useState("default"); //Controla el estado del botón a la hora de generar el tip
  const [showScrollIndicator, setShowScrollIndicator] = useState(true);
  const scrollY = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  //Recuperamos la info del user ya que necesitamos su nombre para poner en el informe que el user va a descargar
  const { userInfo } = useAuthContext();

  // Función para detectar si estamos al final del scroll
  const handleScroll = (event) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    scrollY.setValue(offsetY);

    const layoutHeight = event.nativeEvent.layoutMeasurement.height;
    const contentHeight = event.nativeEvent.contentSize.height;
    const isEndReached = layoutHeight + offsetY >= contentHeight - 20;

    if (isEndReached && showScrollIndicator) {
      // Fade out animation when reaching the bottom
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setShowScrollIndicator(false);
      });
    } else if (!isEndReached && !showScrollIndicator) {
      // Fade in animation when not at the bottom
      setShowScrollIndicator(true);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  const handleGenerateTip = async () => {
    if (tipButtonState === "generating") return;

    setTipButtonState("generating");
    try {
      await generateTip();
      setTipButtonState("generated");

      // Actualizar los tips para asegurar que se muestra el nuevo tip en la lista
      await getTips();

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
    } catch (error) {
      console.error("Error generando tip:", error);
      setTipButtonState("default");
      Alert.alert(
        "Error",
        "No se pudo generar el tip. Inténtalo de nuevo más tarde."
      );
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
      // Ejecutar ambas operaciones en paralelo para mejor rendimiento
      await Promise.all([getDrmToday(), getTips()]);

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
              font-family: Arial, sans-serif;
              margin: 50px;
              color: #000;
            }
            .date {
              font-size: 12px;
              text-align: right;
              margin-bottom: 20px;
            }
            .header {
              text-align: center;
              margin-bottom: 40px;
            }
            .title {
              font-size: 24px;
              font-weight: bold;
              margin: 0;
            }
            .subtitle {
              font-size: 18px;
              margin: 5px 0 0 0;
            }
            .content {
              font-size: 14px;
              line-height: 1.6;
              margin-bottom: 60px;
            }
            .footer {
              position: fixed;
              bottom: 20px;
              left: 0;
              right: 0;
              text-align: center;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="date">${drmToday.timeStamp}</div>
          <div class="header">
            <div class="title">INFORME DRM</div>
            <div class="subtitle">${userInfo.name}</div>
          </div>
          <div class="content">
            ${drmToday.report}
          </div>
          <div class="footer">
            Generado por ZzzTime
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
      console.log("PDF generado en: ", uri);

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

  return (
    <SafeAreaView className="flex-1 w-full h-full bg-primary">
      <View className="flex flex-row items-center justify-between py-4 w-[90%] self-center">
        <View className="flex flex-row items-center justify-start gap-4">
          <TouchableOpacity
            //Dejamos que el user pueda volver a las gráficas en caso de que haya entrado sin querer en la pestaña
            onPress={() => router.back()}
            className="flex flex-row items-center gap-2 py-2"
          >
            <ChevronLeft size={24} color="white" />
          </TouchableOpacity>
          <Text
            className="text-center font-bold text-[#6366ff] py-2"
            style={{ fontSize: 24 }}
          >
            Cuestionario diario DRM
          </Text>
        </View>
        <View className="flex-row items-center gap-4">
          <TouchableOpacity
            //Cuando pinchemos en el botón de descargar el informe llamamos a la función para pasarlo a PDF
            onPress={createPDF}
          >
            <Download size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <View className="flex-1 flex-col justify-between items-center w-[90%] self-center mb-10">
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
              {/*Si el drmToday no es vacío lo reenderizamos, en caso contrario ponemos un mensaje de que no se ha hecho el cuestionario hoy*/}
              {drmToday.report !== ""
                ? drmToday.report
                : "No se ha generado el cuestionario de hoy"}
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
                <ChevronDown size={24} color="white" />
              </View>
            </Animated.View>
          )}
        </View>

        <TouchableOpacity
          className={`py-4 rounded-xl items-center w-full ${getButtonStyle()}`}
          //Si el botón esta en default llamamos a crear tip, si este ya está creado navegamos a la pestaña de tips
          onPress={
            tipButtonState === "default" ? handleGenerateTip : navigateToTips
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
      </View>
    </SafeAreaView>
  );
};

export default DrmReport;
