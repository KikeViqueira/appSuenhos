import { Text, TouchableOpacity, SafeAreaView, FlatList } from "react-native";
import React, { useState } from "react";

//Recibimos la función para modificar el objeto de respuestas, para ir a la anterior pregunta y para finalizar el cuestionario
export default function Question5({
  updateResponse,
  previousQuestion,
  onFinish,
}) {
  //Definimos ahora las distintas respuestas a esta pregunta
  const options = [
    //Cada respuesta esta definida por un id y un texto
    { id: 1, option: "Muy bajo" },
    { id: 2, option: "Bajo" },
    { id: 3, option: "Moderado" },
    { id: 4, option: "Alto" },
    { id: 5, option: "Muy Alto" },
  ];

  //Definimos ahora el estado para saber si se ha seleccionado una respuesta
  const [selected, setSelected] = useState(null);

  //Función para ver si existe una respuesta seleccionada, guardarla y finalizar el cuestionario
  const handleSelection = () => {
    if (selected) {
      /*Si hay una respuesta seleccionada la guardamos en el objeto respuestas que recibimos del componente padre,
             para eso primmero tenemos que sacar la option en base al id que hay guardado en selected*/
      const selectedOption = options.find(
        (option) => option.id === selected
      ).option;
      updateResponse("question5", selectedOption);
      //Una vez guardamos la respuesta seleccionada, la pregunta finaliza el cuestionario y el componente padre ordena a rootlayout que muestre las pestañas de la aplicación
      onFinish();
    }
  };

  return (
    <SafeAreaView>
      <Text>¿Cuál es tu nivel de estrés diario?</Text>
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
        <Text>Finalizar</Text>
      </TouchableOpacity>

      {/* Botón de Volver */}
      <TouchableOpacity
        //Cuando se presiona el botón tenemos que volver a la pregunta anterior, indicandole al componente padre puede volver a la pregunta anterior
        onPress={previousQuestion}
      >
        <Text>Volver</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
