import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import React, { useState } from "react";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import TipItem from "../../components/TipItem";
import { tips } from "../../constants/tips";
import { xorBy } from "lodash";
import { Trash2, Check, X } from "lucide-react-native";

const Tips = () => {
  /*
   *Creamos estado para guardar los tips que se seleccionan en la selección múltiple para ser eliminados
   *
   * También tenemos que crear un estado el cual funcionará como bandera para saber si estamos en el modo de selección múltiple o no
   */
  const [selectedTips, setSelectedTips] = useState([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  //hacemos la función para que al presionarse un tip nos lleve a la página del tip detallado correspondiente
  const handleTipPress = (tip) => {
    //Dependiendo del modo en el que estemos pulsar en un tip tendrá una acción asociada
    if (isSelectionMode) {
      setSelectedTips(xorBy(selectedTips, [tip], "id"));
    } else {
      router.push({
        pathname: "../TipDetail",
        params: { tipId: tip.id.toString() }, //Pasamos solo el id del tip para evitar problemas de serialización
      });
    }
  };

  //Función que se encarga de poner el modo de múltiple selección activado para su uso
  const handleDeletePress = () => {
    setIsSelectionMode(true);
  };

  //Función que se encarga de cancelar la eliminación múltiple y volver al estado por default
  const disableSelection = () => {
    setIsSelectionMode(false);
    setSelectedTips([]);
  };

  //Función para confirmar la eliminación de los tips que han sido seleccionados //TODO: TENEMOS QUE VER SI LOS TIPS QUE SE VAN A ELIMINAR SON MAYORES A CERO, Y ASI NO LLAMAR A LA API INUTILMENTE (SIZE O LENGTH)
  const confirmDeletion = () => {
    if (selectedTips.length > 0) {
      console.log(
        "Eliminando lo siguientes tips: " +
          selectedTips.map((tip) => tip.title).join(", ") //Enseñamos los title de los tips que han sido eliminados separados mediante comas
      );
      //TODO: AQUI TENDREMOS QUE LLAMAR EN EL FUTURO AL ENDPOINT DE LA API QUE SE ENCARGA DE ELIMINAR LOS TIPS SELECCIONADOS
      setSelectedTips([]); //Limpiamos los tips seleccionados
      setIsSelectionMode(false);
    }
  };

  return (
    <SafeAreaView className="w-full h-full bg-primary">
      <View className="flex flex-col items-center self-center justify-center w-full gap-8 mt-3">
        {/*Header*/}
        <View className="flex-row items-center justify-between w-[90%] ">
          <Text
            className="text-center font-bold text-[#6366ff] py-4"
            style={{ fontSize: 24 }}
          >
            Tips para un mejor Sueño
          </Text>

          {/*
           *Dependiendo de si está activada o no la bandera de isSelectionMode tenemos que rederizar un botón o el otro
           *Si está activada tenemos que cambiar el icono por uno de confirmar la eliminación
           *Si no lo está la papelera activará el modo de selección múltiple para eliminar tips
           */}
          {isSelectionMode ? (
            <View className="flex-row justify-between gap-5">
              <TouchableOpacity onPress={disableSelection}>
                <X color="white" size={28} />
              </TouchableOpacity>
              <TouchableOpacity onPress={confirmDeletion}>
                <Check color="#ff6b6b" size={28} />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity onPress={handleDeletePress}>
              <Trash2 color="#ff6b6b" size={28} />
            </TouchableOpacity>
          )}
        </View>

        <ScrollView
          contentContainerStyle={{
            flexGrow: 1, //Puede crecer y adaptarse al nuevo tamaño y scroll
            gap: 16,
            width: "90%",
          }}
          showsVerticalScrollIndicator={false}
        >
          {tips.map((tip, index) => (
            <TouchableOpacity
              //Para cada uno de los tips hacemos un botón que nos lleve a la página del tip detallado
              key={index}
              onPress={() => handleTipPress(tip)}
            >
              <TipItem
                key={index}
                title={tip.title}
                description={tip.description}
                icon={tip.icon}
                color={tip.color}
                isSelectionMode={isSelectionMode}
                /*
                 *Recorre el arreglo selectedTips con .some(), devuelve true si encuentra un elemento con el mismo id que el tip actual.
                 */
                isSelected={selectedTips.some((t) => t.id === tip.id)}
              />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default Tips;
