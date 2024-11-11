import { Text, TouchableOpacity, SafeAreaView, TextInput } from "react-native";
import React, { useState } from "react";
import DateTimePicker from "@react-native-community/datetimepicker";

//Recibimos la función para modificar el objeto de respuestas
export default function Question3({
  updateResponse,
  nextQuestion,
  previousQuestion,
}) {
  //Definimos el estado para guardar la fecha de nacimiento que ha seleccionado el usuario, cuando el DatePicker esta visble y cuando hay un error o no
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(true);
  const [error, setError] = useState("");

  //Definimos ahora el estado para saber si se ha seleccionado una respuesta, en este caso la edad
  const [selected, setSelected] = useState(null);

  //Calculamos la edad en base a la fecha de nacimiento seleccionada
  const calculateAge = (birthday) => {
    const today = new Date();
    let age = today.getFullYear() - birthday.getFullYear();
    //Si la diferencia es menor que 0 significa que aún no ha llegado su cumpleaños este año
    let monthDifference = today.getMonth() - birthday.getMonth();

    //Ajustamos la edad si aún no ha llegado su cumpleaños este año, en el caso de que el mes sea cero miramos los días para saber si ha cumplido o no
    /*Ejemplos: 11/11/2024 - 7/7/2003 = 21 años
                11/11/2024 - 7/12/2003 = 20 años
    */
    if (
      monthDifference < 0 ||
      (monthDifference === 0 && today.getDate() < birthday.getDate())
    )
      age--;

    return age;
  };

  //Función para ver si existe una respuesta seleccionada y podemos continuar
  const handleSelection = () => {
    //llamamos a la función de calcular la edad en base a la fecha seleccionada
    const age = calculateAge(date);
    console.log("Edad: ", age);
    //El rango de edad tiene que ser un número entre 10 y 100 [Se han puesto estos valores por convención]
    if (age >= 10 && age <= 100) {
      updateResponse("question3", age.toString());
      //Una vez guardamos la respuesta seleccionada, navegamos a la siguiente pregunta
      nextQuestion();
    } else {
      setError(
        "Solo se puede usar la aplicación si tienes entre 10 y 100 años"
      );
    }
  };

  return (
    <SafeAreaView>
      <Text>¿Cuántos años tienes?</Text>

      {/* Muestra el DateTimePicker si showPicker es true */}
      {showPicker && (
        <DateTimePicker
          value={date}
          mode="date"
          //El display default toma como referencia el mode para elegir el formato adecuado
          display="default"
          onChange={(event, selectedDate) => {
            const currentDate = selectedDate || date;
            setShowPicker(false);
            setDate(currentDate);
            setError(""); // Borra el mensaje de error si selecciona una fecha válida
            setSelected(true);
          }}
        />
      )}

      {/*Mostramos la fecha que el usuario ha seleccionado*/}
      <Text>Fecha seleccionada : {date.toLocaleDateString()}</Text>

      {/* Botón para reabrir el DateTimePicker */}
      <TouchableOpacity onPress={() => setShowPicker(true)}>
        <Text>Cambiar fecha</Text>
      </TouchableOpacity>

      {/* Botón de Continuar */}
      <TouchableOpacity
        onPress={handleSelection}
        //Si no hay una opción seleccionada el botón se muestra deshabilitado
        disabled={!selected}
      >
        <Text>Continuar</Text>
      </TouchableOpacity>

      {/* Botón de Volver */}
      <TouchableOpacity
        //Cuando se presiona el botón tenemos que volver a la pregunta anterior
        onPress={previousQuestion}
      >
        <Text>Volver</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
