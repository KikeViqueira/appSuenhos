import {
  Text,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  View,
  StatusBar,
} from "react-native";
import React, { useState } from "react";
import { Feather } from "@expo/vector-icons";

const MultipleOptionOnboarding = ({
  questionText,
  options,
  questionKey,
  updateResponse,
  nextQuestion,
  previousQuestion,
  onFinish,
  first = false,
  final = false,
}) => {
  //Definimos ahora el estado para saber si se ha seleccionado una respuesta
  const [selected, setSelected] = useState(null);

  //Función para ver si existe una respuesta seleccionada y podemos continuar
  const handleSelection = () => {
    if (selected) {
      /*Si hay una respuesta seleccionada la guardamos en el objeto respuestas que recibimos del componente padre,
                 para eso primmero tenemos que sacar la option en base al id que hay guardado en selected*/
      const selectedOption = options.find(
        (option) => option.id === selected
      ).option;
      /*
       * Actualizamos el estado y, en el callback, avanzamos a la siguiente pregunta o finalizamos dependiendo de si es la última pregunta
       *
       * Recibimos de la función updateResponse el objeto de respuestas actualizado, y en el callback comprobamos si es la última pregunta o no
       * si lo es le pasamos el estado de las respuestas al componente padre para que pueda hacer la petición a la API con las respuestas del usuario
       * bien actualizadas
       *
       *
       * En nextQuestion() no lo usamos ya que tampoco lo necesitamos
       */

      updateResponse(questionKey, selectedOption, (updatedData) => {
        final ? onFinish(updatedData) : nextQuestion();
      });
    }
  };

  return (
    <View className="items-center justify-center flex-1 px-6 py-8">
      {/* Contenedor principal */}
      <View className="justify-center flex-1 w-full max-w-lg">
        {/* Pregunta principal */}
        <View className="mb-8">
          <Text
            className="mb-4 font-bold text-center text-white"
            style={{ fontSize: 26, lineHeight: 32 }}
          >
            {questionText}
          </Text>
          <View className="w-16 h-1 bg-[#6366ff] rounded-full mx-auto" />
        </View>

        {/* Opciones */}
        <View className="mb-8">
          <FlatList
            data={options}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              gap: 12,
              paddingVertical: 8,
            }}
            renderItem={({ item, index }) => (
              <TouchableOpacity
                onPress={() => setSelected(item.id)}
                className={`p-5 rounded-2xl border-2 transition-all duration-200 ${
                  selected === item.id
                    ? "bg-[#6366ff]/15 border-[#6366ff]"
                    : "bg-[#1a2332] border-[#252e40]"
                }`}
                style={{
                  shadowColor: selected === item.id ? "#6366ff" : "#000",
                  shadowOffset: {
                    width: 0,
                    height: selected === item.id ? 4 : 2,
                  },
                  shadowOpacity: selected === item.id ? 0.3 : 0.1,
                  shadowRadius: selected === item.id ? 8 : 3,
                  elevation: selected === item.id ? 6 : 2,
                }}
                activeOpacity={0.8}
              >
                <View className="flex-row items-center gap-4">
                  {/* Texto de la opción */}
                  <Text
                    className={`flex-1 text-base ${
                      selected === item.id
                        ? "text-white font-semibold"
                        : "text-gray-300"
                    }`}
                    style={{ lineHeight: 22 }}
                  >
                    {item.option}
                  </Text>

                  {/* Icono de selección */}
                  {selected === item.id && (
                    <View className="bg-[#6366ff] rounded-full p-1">
                      <Feather name="check" size={14} color="white" />
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            )}
          />
        </View>
      </View>

      {/* Botones de navegación */}
      <View className="w-full">
        {first ? (
          //Boton de Continuar unicamente
          <TouchableOpacity
            onPress={handleSelection}
            //Si no hay una opción seleccionada el botón se muestra deshabilitado
            disabled={!selected}
            className="w-full py-4 rounded-2xl"
            style={{
              backgroundColor: "#6366ff",
              opacity: selected ? 1 : 0.4,
              shadowColor: "#6366ff",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: selected ? 0.4 : 0,
              shadowRadius: 8,
              elevation: selected ? 8 : 0,
            }}
          >
            <View className="flex-row items-center justify-center gap-3">
              <Text className="text-lg font-bold text-white">Continuar</Text>
              <Feather name="arrow-right" size={20} color="white" />
            </View>
          </TouchableOpacity>
        ) : (
          <View className="flex-row justify-between gap-4">
            {/* Botón de Volver */}
            <TouchableOpacity
              //Cuando se presiona el botón tenemos que volver a la pregunta anterior, indicandole al componente padre puede volver a la pregunta anterior
              onPress={previousQuestion}
              className="flex-1 py-4 rounded-2xl bg-[#252e40]"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 4,
                elevation: 3,
              }}
            >
              <View className="flex-row items-center justify-center gap-3">
                <Feather name="arrow-left" size={20} color="white" />
                <Text className="text-lg font-semibold text-white">Volver</Text>
              </View>
            </TouchableOpacity>

            {/* Botón de Continuar */}
            <TouchableOpacity
              onPress={handleSelection}
              //Si no hay una opción seleccionada el botón se muestra deshabilitado
              disabled={!selected}
              className="flex-1 py-4 rounded-2xl"
              style={{
                backgroundColor: "#6366ff",
                opacity: selected ? 1 : 0.4,
                shadowColor: "#6366ff",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: selected ? 0.4 : 0,
                shadowRadius: 8,
                elevation: selected ? 8 : 0,
              }}
            >
              <View className="flex-row items-center justify-center gap-3">
                {/*Dependiendo de si la pregunta es la de mitad de las que preguntamos o es la última, ponemos un texto u otro */}
                <Text className="text-lg font-bold text-white">
                  {final ? "Finalizar" : "Continuar"}
                </Text>
                {final ? (
                  <Feather name="check" size={20} color="white" />
                ) : (
                  <Feather name="arrow-right" size={20} color="white" />
                )}
              </View>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

export default MultipleOptionOnboarding;
