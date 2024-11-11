import { Text, TouchableOpacity, SafeAreaView, FlatList } from "react-native";
import React, { useState } from "react";

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
    <SafeAreaView>
      <Text>¿Cuántas horas sueles dormir?</Text>
      <FlatList
        contentContainerStyle={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 8,
        }}
        data={options}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            /*Al presionar un botón se selecciona la respuesta y se guarda en el estado el id de ella.
                Tenemos que llamar así a la función para que se ejecute al presionar el botón y no al renderizar el componente*/
            onPress={() => setSelected(item.id)}
          >
            {
              //la opción que se haya seleccionado se muestra en color morado para que el usuario sepa visualmente que opción tiene seleccionada
              selected === item.id ? (
                <Text className="color-purple-500">{item.option}</Text>
              ) : (
                <Text>{item.option}</Text>
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
      >
        <Text>Continuar</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
