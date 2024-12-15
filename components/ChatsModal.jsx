import {
  View,
  Text,
  Modal,
  SafeAreaView,
  TouchableOpacity,
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
  const [filteredChats, setFilteredChats] = useState([]);

  //Obtenemos los chats en base a la fecha seleccionada por el user
  const handleSearchByDate = () => {
    //Pasamos la fecha a formato ISO (YYYY-MM-DDTHH:MM:SSZ), dividimos el string para obtener la parte de la fecha mediante el separador de "T"
    const formattedDate = selectedDate.toISOString().split("T")[0];
    const filtered = chats.filter((chat) => chat.date === formattedDate);
    setFilteredChats(filtered);
  };

  return (
    <View>
      <Modal visible={isVisible}>
        <SafeAreaView className="flex-1 bg-primary">
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
          <View>
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display="default"
              //Cada vez que cambiamos la hora se guarda en el estado de tiempo
              onChange={(event, date) => setSelectedDate(date || new Date())}
            />
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
};

export default ChatsModal;
