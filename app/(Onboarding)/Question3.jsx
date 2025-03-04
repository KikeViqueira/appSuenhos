import {
  Text,
  TouchableOpacity,
  SafeAreaView,
  View,
  Platform,
} from "react-native";
import React, { useState } from "react";
import DateTimePicker from "@react-native-community/datetimepicker";
import Icon from "react-native-vector-icons/FontAwesome";

//Recibimos la función para modificar el objeto de respuestas
export default function Question3({
  updateResponse,
  nextQuestion,
  previousQuestion,
}) {
  //Definimos las fechas que se le van a pasar al DateTimePicker
  const today = new Date();
  //De esta manera solo podrá usar la app users que tengan entre 10 y 100 años
  const minDate = new Date(
    today.getFullYear() - 100,
    today.getMonth(),
    today.getDate()
  );
  const maxDate = new Date(
    today.getFullYear() - 10,
    today.getMonth(),
    today.getDate()
  );

  //Definimos el estado para guardar la fecha de nacimiento que ha seleccionado el usuario, cuando el DatePicker esta visble y cuando hay un error o no
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false); //Para saber cuando estamos en android y asi manejar su comportamiento.
  const [error, setError] = useState(null);

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

    updateResponse("question3", age.toString());
    //Una vez guardamos la respuesta seleccionada, navegamos a la siguiente pregunta
    nextQuestion();

    //El rango de edad tiene que ser un número entre 10 y 100 [Se han puesto estos valores por convención]
    //TODO: comprobacion para android desactivada temporalmente por faklta de retroceso en los años rápida
    //TODO: YA NO NOS HACE FALLTA PORQUE HEMOS PUESTO UN RANGO DE FECHAS EN EL DATEPICKER, TENEN¡MOS QUE COMPROBAR QUE FUNCIONA EN ANDROID
    /*if (age >= 10 && age <= 100) {
      updateResponse("question3", age.toString());
      //Una vez guardamos la respuesta seleccionada, navegamos a la siguiente pregunta
      nextQuestion();
    } else {
      setError(
        "Solo se puede usar la aplicación si tienes entre 10 y 100 años"
      );
    }*/
  };

  //Función que tiene la lógica de manejar el evento del DateTimePicker
  const handleDateChange = (event, selectedDate) => {
    if (Platform.OS === "android") setShowDatePicker(false); //Ponemos en false para no renderizar seguido el picker de android

    const currentDate = selectedDate || date;
    setDate(currentDate);
    setError(null); // Borra el mensaje de error si selecciona una fecha válida
    setSelected(true);
  };

  const openDatePicker = () => {
    if (Platform.OS === "android") setShowDatePicker(true);
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
          ¿Cuántos años tienes?
        </Text>

        {/*Muestra el botón para abrir el DateTimePicker si estamos en Android*/}
        {Platform.OS === "android" && (
          <TouchableOpacity onPress={openDatePicker} className="w-full">
            <View className="bg-[#1e273a] p-4 rounded-xl">
              <Text className="text-center text-white">
                {date.toLocaleDateString()}
              </Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Muestra el DateTimePicker si showPicker*/}
        {(Platform.OS === "ios" || showDatePicker) && (
          <DateTimePicker
            value={date}
            mode="date"
            //El display default toma como referencia el mode para elegir el formato adecuado, pero nosotros usaremos el modo spinner
            display={Platform.OS === "ios" ? "spinner" : "default"}
            textColor={Platform.OS === "ios" ? "white" : undefined}
            accentColor="#6366ff" // Android specific color accent
            onChange={handleDateChange}
            //Indicamos la fecha mínima y máxima que se puede seleccionar
            minimumDate={minDate}
            maximumDate={maxDate}
          />
        )}

        {/*Mostramos la fecha que el usuario ha seleccionado*/}
        <Text className="w-full text-lg text-center color-white">
          Fecha seleccionada : {date.toLocaleDateString()}
        </Text>

        {/*Si la edad no cumple no está entre los valores permitidos mostramos el error por pantalla*/}
        {error && (
          <Text className="w-full text-lg text-center color-red-500">
            {error}
          </Text>
        )}

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
          >
            <Text className="text-lg text-center color-white">Continuar</Text>
            <Icon name="arrow-right" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
