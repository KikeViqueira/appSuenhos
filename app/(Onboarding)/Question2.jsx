import {
  Text,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  View,
} from "react-native";
import React, { useState } from "react";
import Icon from "react-native-vector-icons/FontAwesome";

//Recibimos la función para modificar el objeto de respuestas
export default function Question2({
  updateResponse,
  nextQuestion,
  previousQuestion,
}) {
  //Definimos ahora las distintas respuestas a esta pregunta
  const options = [
    //Cada respuesta esta definida por un id y un texto
    { id: 1, option: "Ninguno" },
    { id: 2, option: "Entre 1 y 2 días" },
    { id: 3, option: "Entre 3 y 4 días" },
    { id: 4, option: "Entre 5 y 6 días" },
    { id: 5, option: "Todos los días" },
  ];

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
      updateResponse("question2", selectedOption);
      //Una vez guardamos la respuesta seleccionada, navegamos a la siguiente pregunta
      nextQuestion();
    }
  };

  return (
    <SafeAreaView className="flex items-center justify-center w-full h-full bg-primary">
      <View
        className="flex flex-col w-[90%] justify-center items-center gap-8"
        style={{
          height: "auto",
        }}
      >
        <Text
          className="text-center font-bold color-[#6366ff]"
          style={{ fontSize: 24 }}
        >
          ¿Cuántos días haces actividad física a la semana?
        </Text>
        <FlatList
          contentContainerStyle={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 8,
          }}
          style={{ width: "100%" }}
          data={options}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              /*Al presionar un botón se selecciona la respuesta y se guarda en el estado el id de ella.
                Tenemos que llamar así a la función para que se ejecute al presionar el botón y no al renderizar el componente*/
              onPress={() => setSelected(item.id)}
              className="flex flex-row items-center w-full gap-4 px-8 py-4 rounded-2xl"
              style={{
                backgroundColor: selected === item.id ? "#162030" : "#1a2c46",
              }}
            >
              {
                //la opción que se haya seleccionado se muestra en color morado para que el usuario sepa visualmente que opción tiene seleccionada
                selected === item.id ? (
                  <Text className="text-lg text-center color-[#6366ff] w-full">
                    {item.option}
                  </Text>
                ) : (
                  <Text className="w-full text-lg text-center color-white">
                    {item.option}
                  </Text>
                )
              }
            </TouchableOpacity>
          )}
        />

        <View className="flex flex-row justify-between w-full">
          {/* Botón de Volver */}
          <TouchableOpacity
            //Cuando se presiona el botón tenemos que volver a la pregunta anterior, indicandole al componente padre puede volver a la pregunta anterior
            onPress={previousQuestion}
            className="flex flex-row items-center gap-4 px-8 py-4 bg-[#323d4f] rounded-3xl"
          >
            <Icon name="arrow-left" size={24} color="white" />
            <Text className="text-lg text-center color-white">Volver</Text>
          </TouchableOpacity>
          {/* Botón de Continuar */}
          <TouchableOpacity
            onPress={handleSelection}
            //Si no hay una opción seleccionada el botón se muestra deshabilitado
            disabled={!selected}
            className="flex flex-row items-center gap-4 px-8 py-4 bg-[#323d4f] rounded-3xl"
            style={{
              opacity: selected ? 1 : 0.3,
            }}
          >
            <Text className="text-lg text-center color-white">Continuar</Text>
            <Icon name="arrow-right" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
