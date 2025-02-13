import {
  Text,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import Icon from "react-native-vector-icons/FontAwesome";

//Recibimos la función para modificar el objeto de respuestas
export default function Question1({ updateResponse, nextQuestion }) {
  //Definimos ahora las distintas respuestas a esta pregunta
  const options = [
    //Cada respuesta esta definida por un id y un texto
    { id: 1, option: "Menos de 5 horas" },
    { id: 2, option: "Entre 5 y 6 horas" },
    { id: 3, option: "Entre 6 y 7 horas" },
    { id: 4, option: "Entre 7 y 8 horas" },
    { id: 5, option: "Más de 8 horas" },
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
      updateResponse("question1", selectedOption);
      //Una vez guardamos la respuesta seleccionada, navegamos a la siguiente pregunta, indicandole al componente padre que ya puede pasar a la siguiente pregunta
      nextQuestion();
    }
  };

  return (
    <SafeAreaView className="flex justify-center items-center w-full h-full bg-primary">
      <View
        className="flex flex-col w-[90%] justify-center items-center gap-8"
        style={{
          height: "auto",
        }}
      >
        <Text className="font-bold color-[#6366ff]" style={{ fontSize: 24 }}>
          ¿Cuántas horas sueles dormir?
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
              className="flex flex-row gap-4 items-center px-8 py-4 w-full rounded-2xl"
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
    </SafeAreaView>
  );
}
