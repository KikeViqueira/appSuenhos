import {
  View,
  Text,
  SectionList,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import React from "react";
import { router, useLocalSearchParams } from "expo-router";
import { tips } from "../constants/tips";
import { ChevronLeft, Bookmark } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";

/*De la lista de tips, al seleccionar uno se accede a este componente y se muestra la información del tip seleccionado,
de una manera completa donde el user puede obtener más información sobre el tip en el que está interesado.
*/
const TipDetail = () => {
  //Obtenemos el tipId que hemos recibido como parámetro
  const { tipId } = useLocalSearchParams();

  //recuperamos el tip correspondiente en base al id para enseñar su info detallada, pasando tipId a número que lo recibimos como String
  const tip = tips.find((tip) => tip.id === Number(tipId));

  //Comprobamos que el tip que se ha pasado exista
  if (!tip) {
    return <Text className="text-white">Tip no encontrado</Text>;
  }

  //Guardamos el icono como un componente, asi usamos un string en vez de un objeto y evitamos errores de invalid type
  const IconComponent = tip.icon;

  //Delimitamos las secciones para el SectionList
  const sections = [
    { title: "Beneficios", data: tip.details.benefits, type: "bullet" },
    {
      title: "Cómo aplicarlo",
      data: tip.details.implementation,
      type: "number",
    },
  ];

  return (
    <SafeAreaView className="flex-1 pt-3 w-full h-full bg-primary">
      {/* En caso de que el contenido se desborde de la pantalla, se desplazara hacia arriba gracias a flexGrow y ScrollView */}

      {/* Botón de volver junto con el icono de bookmark */}
      <View className="flex flex-row justify-between items-center px-8">
        <TouchableOpacity
          onPress={() => router.back()}
          className="flex flex-row gap-2 items-center py-4"
        >
          <ChevronLeft size={24} color="white" />
          <Text className="text-lg font-semibold color-white">
            Volver a la lista de tips
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={
            //TODO: Tenemos que llamar al endpoint de la api para que guarde el tip en la lista de tips favs del user
            //TODO: Tambien tenemos que cambiar el estado del icono de bookmark para que el user sepa que lo tiene como guardado
            () => {
              console.log(
                "Guardado en favoritos el tip: ",
                tip.id,
                "con nombre: ",
                tip.title
              );
            }
          }
        >
          <Bookmark size={28} color="white" />
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} bounces={false}>
        <View className="relative flex-1 w-full h-full">
          {/* Contenido */}
          <View className="flex flex-col gap-6 justify-center items-center w-[90%] self-center">
            {/* Icono y Título */}
            <View className="flex flex-row gap-4 justify-center items-end">
              {IconComponent && <IconComponent color={tip.color} />}
              <Text
                className="font-bold text-[#6366ff] pt-4"
                style={{ fontSize: 24 }}
              >
                {tip.title}
              </Text>
            </View>

            {/* Descripción */}
            <Text className="text-base text-white">
              {tip.details.fullDescription}
            </Text>

            {/* Secciones */}
            <SectionList
              sections={sections}
              keyExtractor={(item, index) => item + index}
              renderSectionHeader={({ section: { title } }) => (
                <View className="bg-[#1e273a] min-w-[100%] self-center flex flex-col justify-between p-4 gap-4 rounded-lg border border-[#323d4f] mb-2">
                  <Text className="text-[#6366ff] font-bold text-lg">
                    {title}
                  </Text>
                </View>
              )}
              renderItem={({ item, index, section }) => (
                <View className="flex flex-row gap-3 items-start p-4 mb-2 w-[90%]">
                  <Text className="font-bold text-[#6366ff] pt-[2px]">
                    {section.type === "number" ? `${index + 1}.` : "•"}
                  </Text>
                  <Text className="text-base text-white">{item}</Text>
                </View>
              )}
              scrollEnabled={false} // Desactiva el scroll de SectionList
            />
          </View>

          {/* Indicador visual de más contenido y saber que estamos al final de la página */}
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.3)"]}
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: 30,
            }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default TipDetail;
