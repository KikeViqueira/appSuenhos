import { View, Text, FlatList, TouchableOpacity } from "react-native";
import React from "react";

//Del menú recibimos los días seleccionados y la función que se encargará de cambiar el estado de los días seleccionados
const RepeatDaysPicker = ({ selectedDays, onToggleDay }) => {
  //Definimos posibles días de la semana
  const days = ["M", "T", "W", "F", "S"];

  const toggleDay = (day) => {
    onToggleDay((prevDays) =>
      prevDays.includes(day)
        ? prevDays.filter((d) => d !== day)
        : [...prevDays, day]
    );
  };

  return (
    <View className="flex gap-4">
      <Text>Repeat</Text>
      <FlatList
        className="flex gap-4"
        data={days}
        keyExtractor={(item) => item}
        horizontal
        //Por cada día de la semana se renderiza un botón que al ser presionado cambia el estado de los días seleccion
        renderItem={({ item, index }) => (
          <TouchableOpacity
            className="m-4"
            onPress={() => toggleDay(item)}
            key={index}
          >
            {
              //Los días seleccionados se muestran en color morado para que le usuario sepa visualmente que días tiene seleccionados
              selectedDays.includes(item) ? (
                <Text className="text-purple-500">{item}</Text>
              ) : (
                <Text>{item}</Text>
              )
            }
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

export default RepeatDaysPicker;
