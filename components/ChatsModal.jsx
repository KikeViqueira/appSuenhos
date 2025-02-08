import {
  View,
  Text,
  Modal,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
} from "react-native";
import React, { useState } from "react";
import { X } from "lucide-react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

const ChatsModal = ({ isVisible, onClose }) => {
  //Lista de chats estáticos que usaremos de prueba
  const chats = [
    { id: "1", date: "2024-04-01", summary: "Sueño sobre volar" },
    { id: "2", date: "2024-02-14", summary: "Regalo para novia" },
    { id: "3", date: "2024-01-6", summary: "Celebración de Reyes" },
  ];
  //Definimos los distintos estados que necesitamos para el model
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [filteredChats, setFilteredChats] = useState([]); //Guardaremos el chat filtrado en base a la fecha seleccionada
  const [hasSearched, setHasSearched] = useState(false);

  //Obtenemos los chats en base a la fecha seleccionada por el user
  const handleSearchByDate = () => {
    setHasSearched(true); //Activamos la bandera de búsqueda para saber si el user ha hecho una búsqueda
    //Pasamos la fecha a formato ISO (YYYY-MM-DDTHH:MM:SSZ), dividimos el string para obtener la parte de la fecha mediante el separador de "T"
    const formattedDate = selectedDate.toISOString().split("T")[0];
    //De los chats que tenemos renderizamos el que tenga la fecha que el user ha seleccionado
    const filtered = chats.filter((chat) => chat.date === formattedDate);
    setFilteredChats(filtered);
  };

  return (
    <View>
      <Modal visible={isVisible}>
        <SafeAreaView className="flex-1 w-full bg-primary">
          <View className="flex flex-row gap-4 justify-start items-center p-4">
            <TouchableOpacity onPress={onClose}>
              <X size={32} color={"#6366ff"} />
            </TouchableOpacity>
            <Text
              className="text-center font-bold text-[#6366ff] py-4"
              style={{ fontSize: 24 }}
            >
              Historial de Chats
            </Text>
          </View>

          {/*Buscador de un chat en base a la fecha*/}
          <View className="flex flex-row gap-4 justify-between items-center flex-wrap w-[90%] self-center">
            <Text className="text-lg text-white">
              Selecciona la fecha del chat
            </Text>

            <DateTimePicker
              value={selectedDate}
              mode="date"
              display="default"
              textColor="white"
              //Cada vez que cambiamos la hora se guarda en el estado de tiempo
              onChange={(event, date) => setSelectedDate(date || new Date())}
            />

            <TouchableOpacity
              className="bg-[#6366ff] p-4 rounded-xl w-full"
              onPress={handleSearchByDate}
            >
              <Text className="text-base font-semibold text-center text-white">
                Buscar
              </Text>
            </TouchableOpacity>
          </View>

          {/*Renderizamos el chat filtrado en base a la fecha seleccionada si el user le ha dado a buscar (hasSearched = True)*/}
          {hasSearched && (
            <View className="w-[90%] self-center mt-6">
              {/*En caso de que haya un chat filtrado mostramos su contenido: Summary y date.
              En otro caso lo que hacemos es mostrar un mensaje de error diciendo al user que no se ha encontrado un chat con la fecha que esta buscando*/}
              {filteredChats.length > 0 ? (
                <View className="bg-[#1e273a] w-full flex flex-col justify-between p-6 rounded-lg">
                  <Text className="mb-2 text-xl font-bold text-white">
                    {filteredChats[0].summary}
                  </Text>
                  <Text className="text-[#6366ff]">
                    {filteredChats[0].date}
                  </Text>
                </View>
              ) : (
                <View className="flex justify-center items-center py-4">
                  <Text className="text-base text-center text-white">
                    No se ha encontrado un chat correspondiente a este día
                  </Text>
                </View>
              )}
            </View>
          )}

          {/*Renderizamos los últimos chats recientes en base a los últimos x días*/}
          <View className="w-[90%] flex flex-col flex-1 gap-4 self-center mt-8">
            {chats.length > 0 ? (
              <>
                <Text className="mb-2 text-xl font-bold text-white">
                  Chats Recientes
                </Text>
                <FlatList
                  data={chats}
                  keyExtractor={(item) => item.id}
                  ItemSeparatorComponent={() => <View className="h-4" />}
                  renderItem={({ item }) => (
                    <View className="bg-[#1e273a] w-full flex flex-col justify-between p-6 rounded-lg">
                      <Text className="mb-2 text-xl font-bold text-white">
                        {item.summary}
                      </Text>
                      <Text className="text-[#6366ff]">{item.date}</Text>
                    </View>
                  )}
                />
              </>
            ) : (
              <View className="flex justify-center items-center py-8">
                <Text className="text-lg text-center text-white">
                  No hay chats registrados en estos momentos
                </Text>
                <Text className="text-base text-[#6366ff] text-center mt-2">
                  Los chats aparecerán aquí cuando los registres
                </Text>
              </View>
            )}
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
};

export default ChatsModal;
