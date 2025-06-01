import {
  Text,
  TouchableOpacity,
  SafeAreaView,
  View,
  Platform,
} from "react-native";
import React, { useState } from "react";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Feather } from "@expo/vector-icons";

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

  /*
   * Definimos el estado para guardar la fecha de nacimiento que ha seleccionado el usuario, cuando el DatePicker esta visble y cuando hay un error o no
   * 
   * Ponemos como fecha inicial la máxima posible que el user puede seleccionar
  
  */
  const [date, setDate] = useState(maxDate);
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
    /*
     * En la BD lo que nos interesa es guardar la fecha de nacimiento del user, ya que si guardamos solo la edad, cada año tendríamos que actualizarla
     * Con la fecha sea el momento que sea que la recuperemos, siempre tendremos la edad actual del user mediante la resta de la fecha actual menos la de nacimiento
     */

    // Obtiene el string en formato ISO, por ejemplo: "2000-01-15T00:00:00.000Z"
    const isoDate = date.toISOString().split("T")[0]; // Extrae "YYYY-MM-DD"
    updateResponse("question3", isoDate);
    //Una vez guardamos la respuesta seleccionada, navegamos a la siguiente pregunta
    nextQuestion();
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
    <View className="items-center justify-center flex-1 h-full px-6 py-8">
      {/* Contenedor principal */}
      <View className="items-center justify-center flex-1 w-full">
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
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
              }}
            >
              <View className="flex-row items-center justify-between">
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
            <View className="flex-row items-center gap-3 mb-2">
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
            <View className="p-4 mt-4 border bg-red-500/10 rounded-xl border-red-500/30">
              <Text className="text-center text-red-400">{error}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Botones de navegación */}
      <View className="w-full">
        <View className="flex-row justify-between gap-4">
          {/* Botón de Volver */}
          <TouchableOpacity
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
              <Text className="text-lg font-bold text-white">Continuar</Text>
              <Feather name="arrow-right" size={20} color="white" />
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
