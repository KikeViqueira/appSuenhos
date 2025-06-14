import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Linking,
} from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, AntDesign } from "@expo/vector-icons";
import { router } from "expo-router";

const Help = () => {
  const [expandedFaq, setExpandedFaq] = useState(null);

  const faqData = [
    {
      id: 1,
      question: "¿Cómo se generan los tips personalizados?",
      answer:
        "Nuestro sistema de generación de tips utiliza un enfoque multicapa que analiza tu información personal, patrones de sueño registrados, respuestas a los cuestionarios matutinos y datos del DRM. Además, mantiene un registro de los tips que ya has recibido para evitar repeticiones y asegurar que cada consejo sea único y relevante para tu situación específica. Cuantos más datos proporciones a través de los cuestionarios, más precisos y personalizados serán tus tips.",
    },
    {
      id: 2,
      question: "¿Puedo chatear con la IA más de una vez al día?",
      answer:
        "Actualmente, ZzzTime AI está diseñado como un diario personal, permitiendo una conversación por día. Esta metodología ayuda a crear un historial consistente de tus patrones de sueño y evita la sobrecarga de información.",
    },
    {
      id: 3,
      question: "¿Mis datos personales están seguros?",
      answer:
        "Sí, tu privacidad es nuestra prioridad. Todos tus datos se almacenan de forma segura y encriptada. Nunca compartimos información personal con terceros y puedes eliminar tu cuenta en cualquier momento.",
    },
    {
      id: 4,
      question: "¿Cómo puedo ver mis estadísticas de sueño?",
      answer:
        "Puedes acceder a tus estadísticas desde la pestaña 'Stats' en la navegación inferior. Allí encontrarás gráficos de tu progreso, patrones de sueño y análisis detallados de tu actividad.",
    },
    {
      id: 5,
      question: "¿Qué hacer si no recibo notificaciones?",
      answer:
        "Verifica que las notificaciones estén activadas en tu perfil y en la configuración de tu dispositivo. Si el problema persiste, intenta reiniciar la aplicación o contactar soporte.",
    },
  ];

  const handleEmailPress = () => {
    Linking.openURL("mailto:soporte@zzztime.app");
  };

  const toggleFaq = (faqId) => {
    setExpandedFaq(expandedFaq === faqId ? null : faqId);
  };

  const FaqItem = ({ item }) => {
    const isExpanded = expandedFaq === item.id;

    return (
      <TouchableOpacity
        onPress={() => toggleFaq(item.id)}
        className="bg-[#1e2a47] rounded-xl p-4 mb-3 border border-[#323d4f]/30"
      >
        <View className="flex-row items-center justify-between">
          <Text className="flex-1 pr-3 text-base font-medium text-white">
            {item.question}
          </Text>
          <View
            className={`transform ${isExpanded ? "rotate-180" : "rotate-0"}`}
          >
            <Feather name="chevron-down" size={20} color="#6366ff" />
          </View>
        </View>

        {isExpanded && (
          <View className="mt-4 pt-4 border-t border-[#323d4f]/50">
            <Text className="text-sm text-[#8a94a6] leading-6">
              {item.answer}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="w-full h-full bg-primary">
      <View className="flex flex-col w-full h-full">
        {/* Header */}
        <View className="flex flex-row items-center justify-start gap-4 p-4">
          <TouchableOpacity onPress={() => router.back()}>
            <AntDesign name="arrowleft" size={28} color="#6366ff" />
          </TouchableOpacity>
          <Text
            className="text-center font-bold text-[#6366ff] py-4"
            style={{ fontSize: 24 }}
          >
            Centro de Ayuda
          </Text>
        </View>

        <ScrollView
          className="flex-1 px-4"
          showsVerticalScrollIndicator={true}
          contentContainerStyle={{ paddingBottom: 20 }}
          indicatorStyle="white"
        >
          {/* Welcome Section */}
          <View className="bg-[#1e2a47] rounded-xl p-6 mb-6 border border-[#323d4f]/30">
            <View className="items-center mb-4">
              <View className="bg-[#6366ff]/10 p-4 rounded-full mb-3">
                <Feather name="help-circle" size={32} color="#6366ff" />
              </View>
              <Text className="mb-2 text-xl font-bold text-center text-white">
                ¿Necesitas ayuda?
              </Text>
              <Text className="text-base text-[#8a94a6] text-center leading-6">
                Estamos aquí para ayudarte a sacar el máximo provecho de ZzzTime
                AI. Encuentra respuestas a las preguntas más frecuentes o
                contacta con nuestro equipo.
              </Text>
            </View>
          </View>

          {/* FAQ Section */}
          <View className="mb-6">
            <View className="flex-row items-center gap-3 mb-4">
              <View className="bg-[#15db44]/10 p-2 rounded-full">
                <Feather name="message-circle" size={20} color="#15db44" />
              </View>
              <Text className="text-xl font-bold text-white">
                Preguntas Frecuentes
              </Text>
            </View>

            {faqData.map((item) => (
              <FaqItem key={item.id} item={item} />
            ))}
          </View>

          {/* Contact Section */}
          <View className="bg-[#1e2a47] rounded-xl p-6 border border-[#323d4f]/30">
            <View className="flex-row items-center gap-3 mb-4">
              <View className="bg-[#6366ff]/10 p-2 rounded-full">
                <Feather name="mail" size={20} color="#6366ff" />
              </View>
              <Text className="text-xl font-bold text-white">
                Contacto Directo
              </Text>
            </View>

            <Text className="text-base text-[#8a94a6] mb-6 leading-6">
              ¿No encuentras lo que buscas? Nuestro equipo está disponible para
              ayudarte con cualquier consulta específica sobre ZzzTime AI.
            </Text>

            {/* Email Contact */}
            <TouchableOpacity
              onPress={handleEmailPress}
              className="bg-[#323d4f]/30 p-4 rounded-xl mb-4 flex-row items-center gap-3"
            >
              <View className="bg-[#15db44]/10 p-2 rounded-lg">
                <Feather name="mail" size={18} color="#15db44" />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-medium text-[#15db44] uppercase tracking-wide mb-1">
                  Email de Soporte
                </Text>
                <Text className="text-base font-medium text-white">
                  soporte@zzztime.app
                </Text>
              </View>
              <Feather name="external-link" size={16} color="#8a94a6" />
            </TouchableOpacity>

            {/* Response Time */}
            <View className="bg-[#323d4f]/30 p-4 rounded-xl flex-row items-center gap-3">
              <View className="bg-[#6366ff]/10 p-2 rounded-lg">
                <Feather name="clock" size={18} color="#6366ff" />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-medium text-[#6366ff] uppercase tracking-wide mb-1">
                  Tiempo de Respuesta
                </Text>
                <Text className="text-base font-medium text-white">
                  Respondemos en menos de 24 horas
                </Text>
              </View>
            </View>
          </View>

          {/* App Info Section */}
          <View className="bg-[#1e2a47] rounded-xl p-6 mt-6 border border-[#323d4f]/30">
            <View className="flex-row items-center gap-3 mb-4">
              <View className="bg-[#6366ff]/10 p-2 rounded-full">
                <Feather name="info" size={20} color="#6366ff" />
              </View>
              <Text className="text-xl font-bold text-white">
                Sobre ZzzTime AI
              </Text>
            </View>

            <Text className="text-base text-[#8a94a6] mb-4 leading-6">
              ZzzTime AI es tu compañero personal para mejorar la calidad del
              sueño a través del análisis inteligente de tus patrones de
              descanso y sueños.
            </Text>

            <View className="flex-row justify-between">
              <View className="flex-1 mr-2">
                <Text className="text-sm font-medium text-[#6366ff] uppercase tracking-wide mb-1">
                  Versión
                </Text>
                <Text className="text-base font-medium text-white">2.1.0</Text>
              </View>
              <View className="flex-1 ml-2">
                <Text className="text-sm font-medium text-[#6366ff] uppercase tracking-wide mb-1">
                  Última Actualización
                </Text>
                <Text className="text-base font-medium text-white">
                  Junio 2025
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default Help;
