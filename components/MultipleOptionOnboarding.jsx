import {
  Text,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  View,
  StatusBar,
} from "react-native";
import React, { useState } from "react";
import { CircleArrowLeft, CircleArrowRight } from "lucide-react-native";

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
    <SafeAreaView className="flex justify-center items-center w-full h-full bg-primary">
      <View
        className="flex flex-col w-[90%] justify-center items-center gap-10"
        style={{
          height: "auto",
        }}
      >
        <Text
          className="text-center font-bold color-[#6366ff]"
          style={{ fontSize: 24 }}
        >
          {questionText}
        </Text>
        <FlatList
          contentContainerStyle={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 12,
            paddingVertical: 10,
          }}
          style={{ width: "100%" }}
          data={options}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setSelected(item.id)}
              className="flex flex-row gap-4 items-center px-6 py-4 w-full rounded-xl"
              style={{
                backgroundColor: selected === item.id ? "#162030" : "#1a2c46",
                borderWidth: selected === item.id ? 1 : 0,
                borderColor: "#6366ff",
                shadowColor: selected === item.id ? "#6366ff" : "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: selected === item.id ? 0.3 : 0.1,
                shadowRadius: 5,
                elevation: selected === item.id ? 4 : 2,
              }}
            >
              {selected === item.id ? (
                <Text
                  className="text-lg text-center color-[#6366ff] w-full font-bold"
                  style={{ letterSpacing: 0.5 }}
                >
                  {item.option}
                </Text>
              ) : (
                <Text className="w-full text-lg text-center color-white">
                  {item.option}
                </Text>
              )}
            </TouchableOpacity>
          )}
        />

        {/* Dependiendo de si la pregunta es la primera o no tendremos que reenderizar un botón de solo continuar, o dos 
          (uno para continuar y otro para retroceder) respectivamente */}
        {first ? (
          //Boton de Continuar unicamente
          <TouchableOpacity
            onPress={handleSelection}
            //Si no hay una opción seleccionada el botón se muestra deshabilitado
            disabled={!selected}
            className="flex flex-row gap-4 items-center px-8 py-4 rounded-xl"
            style={{
              backgroundColor: "#6366ff",
              opacity: selected ? 1 : 0.3,
              shadowColor: "#6366ff",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 5,
              elevation: 6,
            }}
          >
            <Text className="text-lg font-bold text-center color-white">
              Continuar
            </Text>
            <CircleArrowRight size={24} color="white" />
          </TouchableOpacity>
        ) : (
          <View className="flex flex-row justify-between w-full">
            {/* Botón de Volver */}
            <TouchableOpacity
              //Cuando se presiona el botón tenemos que volver a la pregunta anterior, indicandole al componente padre puede volver a la pregunta anterior
              onPress={previousQuestion}
              className="flex flex-row gap-4 items-center px-6 py-4 rounded-xl"
              style={{
                backgroundColor: "#323d4f",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 3,
                elevation: 3,
              }}
            >
              <CircleArrowLeft size={24} color="white" />
              <Text className="text-lg font-semibold text-center color-white">
                Volver
              </Text>
            </TouchableOpacity>
            {/* Botón de Continuar */}
            <TouchableOpacity
              onPress={handleSelection}
              //Si no hay una opción seleccionada el botón se muestra deshabilitado
              disabled={!selected}
              className="flex flex-row gap-4 items-center px-6 py-4 rounded-xl"
              style={{
                backgroundColor: "#6366ff",
                opacity: selected ? 1 : 0.3,
                shadowColor: "#6366ff",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 5,
                elevation: 6,
              }}
            >
              {/*Dependiendo de si la pregunta es la de mitad de las que preguntamos o es la última, ponemos un texto u otro */}
              {final ? (
                <Text className="text-lg font-bold text-center color-white">
                  Finalizar
                </Text>
              ) : (
                <Text className="text-lg font-bold text-center color-white">
                  Continuar
                </Text>
              )}
              <CircleArrowRight size={24} color="white" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

export default MultipleOptionOnboarding;
