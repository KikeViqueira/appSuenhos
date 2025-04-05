import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from "react-native";
import React, { useEffect, useState } from "react";
import { ChevronLeft, Download } from "lucide-react-native";
import { router } from "expo-router";
import useDRM from "../hooks/useDRM";
import { useAuthContext } from "../context/AuthContext";
import * as Print from "expo-print"; // Usamos expo-print en lugar de react-native-html-to-pdf
import * as Sharing from "expo-sharing";

const DrmReport = () => {
  const { getDrmToday, error, drmToday } = useDRM();

  //Recuperamos la info del user ya que necesitamos su nombre para poner en el informe que el user va a descargar
  const { userInfo } = useAuthContext();

  const handleGenerateTip = () => {
    //TODO: Aqui tenemos que llamar al endpoint de la api para generar un tip personalizado para el user teniendo en cuenta toda su información
  };

  //Cuando el componente se reenderiza, hacemos la petición para obtener el cuestionario de hoy
  useEffect(() => {
    getDrmToday();
  }, []);

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
        <TouchableOpacity
          //Cuando pinchemos en el botón de descargar el informe llamamos a la función para pasarlo a PDF
          onPress={createPDF}
        >
          <Download size={24} color="white" />
        </TouchableOpacity>
      </View>

      <View className="flex-1 flex-col justify-between items-center w-[90%] self-center mb-10">
        <View className="max-h-[90%]">
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            showsVerticalScrollIndicator={true}
            indicatorStyle="white"
            className="border-b border-gray-700"
          >
            <Text className="mb-4 text-lg text-white" selectable={true}>
              {/*Si el drmToday no es vacío lo reenderizamos, en caso contrario ponemos un mensaje de que no se ha hecho el cuestionario hoy*/}
              {drmToday.report !== ""
                ? drmToday.report
                : "No se ha generado el cuestionario de hoy"}
            </Text>
          </ScrollView>
        </View>

        <TouchableOpacity
          TouchableOpacity
          className="bg-[#15db44] py-4 rounded-xl items-center w-full"
          onPress={handleGenerateTip}
        >
          <Text className="text-lg text-white font-psemibold">
            Generar Tip Personalizado
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default DrmReport;
