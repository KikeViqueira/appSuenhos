import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { LineChart } from "react-native-chart-kit";
import Icon from "react-native-vector-icons/FontAwesome";

const Estadisticas = () => {
  //Definimos un estado para saber si el modal de preguntas sobre la calidad del sueño está abierto o cerrado
  const [showModal, setShowModal] = useState(false);

  return (
    <SafeAreaView>
      <ScrollView>
        {/* Primera sección de la pestaña de estadísticas
          que servirá para registrar las horas de sueño del usuario y abrir el modal de preguntas nada más despertarse en relación a su calidad de sueño */}
        <View>
          <Text>Registro de Sueño</Text>
          <TouchableOpacity>
            <Icon name="moon-o" size={20} color="#111" />
            <Text>Me voy a dormir</Text>
          </TouchableOpacity>
          <TouchableOpacity>
            <Icon name="sun-o" size={20} color="#111" />
            <Text>Me acabo de despertar</Text>
          </TouchableOpacity>
        </View>

        {/* Segunda sección de la pestaña de estadísticas, que hace referencia a la gráfica que recoge las horas que el usario a dormido a lo largo de los días de la semana*/}
        <View>
          <LineChart
            data={{
              labels: ["L", "M", "M", "J", "V", "S", "D"],
              datasets: [
                {
                  data: [6, 7, 6.5, 8, 7.5, 9, 8.5], // Horas de sueño por día de la semana
                },
              ],
            }}
            width={Dimensions.get("window").width} // Ancho de la gráfica
            height={220}
            bezier // Curva de la línea
            yAxisLabel="h"
            yAxisInterval={1} //Intervalo de horas en el eje Y
            chartConfig={{
              backgroundGradientFrom: "#1E2923",
              backgroundGradientTo: "#08130D",
              //En las dos siguientes propiedades usamos backticks para poder meter el valor de la opacidad median una expresión. Además nos permite escribir en varias líneas si queremos
              color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`, // Color de la línea
              labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`, // Color de las etiquetas
              strokeWidth: 2, // Grosor de la línea
              useShadowColorFromDataset: false, // Sombra de la línea
            }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Estadisticas;
