import {
  Text,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  View,
  StatusBar,
} from "react-native";
import React, { useState, useEffect } from "react";
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
  currentResponse = "", // Recibimos la respuesta actual
}) => {
  //Definimos ahora el estado para saber si se ha seleccionado una respuesta
  const [selected, setSelected] = useState(null);

  // Efecto para sincronizar el estado con la respuesta actual
  useEffect(() => {
    if (currentResponse) {
      // Encontrar la opción que coincide con la respuesta actual
      const matchingOption = options.find(
        (option) => option.option === currentResponse
      );
      setSelected(matchingOption ? matchingOption.id : null);
    } else {
      // Si no hay respuesta, limpiamos la selección
      setSelected(null);
    }
  }, [currentResponse, options]);

  // Función para manejar la selección de una opción
  const handleOptionSelect = (optionId) => {
    const selectedOption = options.find(
      (option) => option.id === optionId
    ).option;

    // Solo actualizar si la respuesta es diferente a la actual
    if (selectedOption !== currentResponse) {
      setSelected(optionId);
      updateResponse(questionKey, selectedOption);
    } else {
      // Si es la misma respuesta, solo actualizar el estado visual
      setSelected(optionId);
    }
  };

  //Función para continuar a la siguiente pregunta (ya no actualiza la respuesta, solo navega)
  const handleContinue = () => {
    if (selected) {
      if (final) {
        // Para la pregunta final, necesitamos pasar los datos actualizados
        const selectedOption = options.find(
          (option) => option.id === selected
        ).option;
        updateResponse(questionKey, selectedOption, (updatedData) => {
          onFinish(updatedData);
        });
      } else {
        // Para preguntas normales, solo navegamos
        nextQuestion();
      }
    }
  };

  return (
    <View className="flex-1 justify-center items-center px-6 py-8">
      {/* Contenedor principal */}
      <View className="flex-1 justify-center w-full max-w-lg">
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
                onPress={() => handleOptionSelect(item.id)}
                className={`p-5 rounded-2xl border-2 ${
                  selected === item.id
                    ? "bg-[#6366ff]/15 border-[#6366ff]"
                    : "bg-[#1a2332] border-[#252e40]"
                }`}
                activeOpacity={0.8}
              >
                <View className="flex-row gap-4 items-center">
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
            onPress={handleContinue}
            //Si no hay una opción seleccionada el botón se muestra deshabilitado
            disabled={!selected}
            className="py-4 w-full rounded-2xl"
            style={{
              backgroundColor: "#6366ff",
              opacity: selected ? 1 : 0.4,
            }}
          >
            <View className="flex-row gap-3 justify-center items-center">
              <Text className="text-lg font-bold text-white">Continuar</Text>
              <Feather name="arrow-right" size={20} color="white" />
            </View>
          </TouchableOpacity>
        ) : (
          <View className="flex-row gap-4 justify-between">
            {/* Botón de Volver */}
            <TouchableOpacity
              //Cuando se presiona el botón tenemos que volver a la pregunta anterior, indicandole al componente padre puede volver a la pregunta anterior
              onPress={previousQuestion}
              className="flex-1 py-4 rounded-2xl bg-[#252e40]"
            >
              <View className="flex-row gap-3 justify-center items-center">
                <Feather name="arrow-left" size={20} color="white" />
                <Text className="text-lg font-semibold text-white">Volver</Text>
              </View>
            </TouchableOpacity>

            {/* Botón de Continuar */}
            <TouchableOpacity
              onPress={handleContinue}
              //Si no hay una opción seleccionada el botón se muestra deshabilitado
              disabled={!selected}
              className="flex-1 py-4 rounded-2xl"
              style={{
                backgroundColor: "#6366ff",
                opacity: selected ? 1 : 0.4,
              }}
            >
              <View className="flex-row gap-3 justify-center items-center">
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
