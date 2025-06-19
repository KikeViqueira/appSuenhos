import {
  Text,
  TouchableOpacity,
  SafeAreaView,
  View,
  Platform,
} from "react-native";
import React, { useState, useEffect } from "react";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Feather } from "@expo/vector-icons";

//Recibimos la función para modificar el objeto de respuestas
export default function Question3({
  updateResponse,
  nextQuestion,
  previousQuestion,
  currentResponse = "", // Recibimos la respuesta actual
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

  /*
   * Definimos el estado para guardar la fecha de nacimiento que ha seleccionado el usuario, cuando el DatePicker esta visble y cuando hay un error o no
   * 
   * Ponemos como fecha inicial la máxima posible que el user puede seleccionar
  
  */
  const [date, setDate] = useState(maxDate);
  const [showDatePicker, setShowDatePicker] = useState(false); //Para saber cuando estamos en android y asi manejar su comportamiento.
  const [error, setError] = useState(null);

  //Definimos ahora el estado para saber si se ha seleccionado una respuesta, en este caso la edad
  const [selected, setSelected] = useState(currentResponse ? true : null);

  // Efecto ÚNICO para inicializar la fecha cuando se monta el componente
  useEffect(() => {
    if (currentResponse) {
      try {
        const responseDate = new Date(currentResponse);
        setDate(responseDate);
        setSelected(true);
      } catch (error) {
        console.error("Error al parsear la fecha:", error);
        setDate(maxDate);
        setSelected(null);
      }
    }
    // No incluimos dependencias para que solo se ejecute una vez
  }, []);

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

  //Función para continuar a la siguiente pregunta (ya no actualiza la respuesta, solo navega)
  const handleContinue = () => {
    // Solo navegamos a la siguiente pregunta, la respuesta ya fue actualizada en handleDateChange
    nextQuestion();
  };

  //Función que tiene la lógica de manejar el evento del DateTimePicker
  const handleDateChange = (event, selectedDate) => {
    if (Platform.OS === "android") setShowDatePicker(false); //Ponemos en false para no renderizar seguido el picker de android

    const currentDate = selectedDate || date;
    const isoDate = currentDate.toISOString().split("T")[0];

    setDate(currentDate);
    setError(null); // Borra el mensaje de error si selecciona una fecha válida
    setSelected(true);

    // Solo actualizar la respuesta si la fecha es diferente
    if (isoDate !== currentResponse) {
      updateResponse("question3", isoDate);
    }
  };

  const openDatePicker = () => {
    if (Platform.OS === "android") setShowDatePicker(true);
  };

  return (
    <View className="flex-1 justify-center items-center px-6 py-8 h-full">
      {/* Contenedor principal */}
      <View className="flex-1 justify-center items-center w-full">
        {/* Título de la pregunta */}
        <View className="mb-8">
          <Text
            className="mb-4 font-bold text-center text-white"
            style={{ fontSize: 26, lineHeight: 32 }}
          >
            ¿Cuál es tu fecha de nacimiento?
          </Text>
          <View className="w-16 h-1 bg-[#6366ff] rounded-full self-center" />
        </View>

        {/* Contenedor del date picker */}
        <View className="mb-4">
          {/*Muestra el botón para abrir el DateTimePicker si estamos en Android*/}
          {Platform.OS === "android" && (
            <TouchableOpacity
              onPress={openDatePicker}
              className="w-full mb-6 p-5 bg-[#1a2332] border-2 border-[#252e40] rounded-2xl"
            >
              <View className="flex-row justify-between items-center">
                <Text className="text-base text-white">
                  {date.toLocaleDateString("es-ES", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </Text>
                <Feather name="calendar" size={20} color="#6366ff" />
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

          {/* Información adicional */}
          <View className="bg-[#6366ff]/10 p-4 rounded-xl border border-[#6366ff]/30 mt-4">
            <View className="flex-row gap-3 items-center mb-2">
              <Feather name="info" size={16} color="#6366ff" />
              <Text className="text-[#6366ff] text-base font-semibold">
                Fecha seleccionada
              </Text>
            </View>
            <Text className="text-base font-medium text-white">
              {date.toLocaleDateString("es-ES", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </Text>
            <Text className="mt-1 text-base text-gray-400">
              Edad: {calculateAge(date)} años
            </Text>
          </View>

          {/*Si la edad no cumple no está entre los valores permitidos mostramos el error por pantalla*/}
          {error && (
            <View className="p-4 mt-4 rounded-xl border bg-red-500/10 border-red-500/30">
              <Text className="text-center text-red-400">{error}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Botones de navegación */}
      <View className="w-full">
        <View className="flex-row gap-4 justify-between">
          {/* Botón de Volver */}
          <TouchableOpacity
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
            disabled={!selected}
            className="flex-1 py-4 rounded-2xl"
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
        </View>
      </View>
    </View>
  );
}
