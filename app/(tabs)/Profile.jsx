import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Alert,
  ScrollView,
  Switch,
} from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Camera,
  Edit2,
  BookmarkCheck,
  HelpCircle,
  LockKeyhole,
  BellRing,
  BadgeCheck,
} from "lucide-react-native";
import placeholderImage from "../../assets/images/placeholder.png";
import * as ImagePicker from "expo-image-picker";
import PictureOptions from "../../components/PictureOptions";
import { router } from "expo-router";
import LogOutModal from "../../components/LogOutModal";
import ChangePasswordModal from "../../components/ChangePasswordModal";
import ChangeEmailModal from "../../components/ChangeEmailModal";
import ChatContributionGraph from "../../components/ChatContributionGraph";

const Profile = () => {
  //Hacemos states tanto para guardar la foto como para controlar que el modal de opciones de cámara este desplegado o no
  const [imagen, setImage] = useState(placeholderImage);
  const [showModal, setshowModal] = useState(false);
  const [showModalLogOut, setshowModalLogOut] = useState(false);
  const [showModalChangePassword, setshowModalChangePassword] = useState(false);
  const [showModalChangeEmail, setshowModalChangeEmail] = useState(false);
  const [isSwitchEnabled, setIsSwitchEnabled] = useState(false);

  //TODO:AQUI ES DONDE TENEMOS QUE HACER EL COMPORTAMIENTO DE LA FUNCIÓN QUE SE ENCARGARÁ DE ACTIVAR/DESACTIVAR LAS NOTIFICACIONES
  const toggleEnabled = async () => {
    setIsSwitchEnabled(!isSwitchEnabled);
  };

  //hacemos función de guardar foto que incluye las opciones de sacar foto o elegir una de la galería, en base al parámetro que reciba
  const uploadPicture = async ({ mode }) => {
    //tenemos que definir la función como asíncrona para poder usar métodos await que esperan a que se resuelvan promesas

    let result = {}; //Variable para guardar la foto del user de manera local

    if (mode === "gallery") {
      try {
        await ImagePicker.requestMediaLibraryPermissionsAsync();
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ["images"], // El contenido que dejamos seleccionar de la galería son las fotos
          allowsEditing: true,
          aspect: [4, 3],
          quality: 1,
        });
      } catch (error) {
        //Notificamos al usuario de que ha sucedido un error a la hora de seleccionar una determinada foto de la galería
        Alert.alert(
          "Error",
          "Ha sucedido un error a la hora de seleccionar la foto de la galería, inténtalo de nuevo"
        );
      }
    } else {
      //Estamos en el caso de que el user sube una foto de perfil sacada directamente desde la cámara
      try {
        await ImagePicker.requestCameraPermissionsAsync();
        result = await ImagePicker.launchCameraAsync({
          cameraType: ImagePicker.CameraType.front, //hacemos que la cámara por defecto sea la frontal a la hora de sacar la foto
          allowsEditing: true,
          aspect: [4, 3],
          quality: 1,
        });
      } catch (error) {
        //Notificamos al usuario de que ha sucedido un error a la hora de sacar la foto
        Alert.alert(
          "Error",
          "Ha sucedido un error a la hora de sacar la foto, inténtalo de nuevo"
        );
      }
    }

    //Comprobamos que el resultado no haya sido cancelado y guardamos la foto
    if (!result.canceled) {
      savePicture({ imagen: result.assets[0].uri });
    }
  };

  //Función para borrar la foto que el user tiene de perfil
  const deletePicture = async () => {
    try {
      setImage(placeholderImage);
      setshowModal(false);
    } catch (error) {
      Alert.alert(
        "Error",
        "Ha sucedido un error a la hora de borrar la foto, inténtalo de nuevo"
      );
    }
  };

  //Función para guardar la foto en el estado que hemos definido y a mayores guardarla en la base de datos
  const savePicture = async ({ imagen }) => {
    // TODO : Implementar el guardado en la base de datos cuando tengamos la API
    try {
      console.log("Guardando la foto", imagen);
      //Como estamos guardando una foto dinámica, tenemos que pasarla a un URI y asi pasar el objeto y que react sepa que es una foto que no está en el proyecto
      //Y de esta manera puede cargarla como imagen en la aplicación
      setImage({ uri: imagen });
      setshowModal(false);
    } catch (error) {
      Alert.alert(
        "Error",
        "Ha sucedido un error a la hora de guardar la foto, inténtalo de nuevo"
      );
    }
  };

  //Función para cerrar la sesión del user
  const logOut = () => {
    //TODO: TENDRIAMOS QUE LLAMAR AL ENDPOINT PARA CERRAR LA SESIÓN
    setshowModalLogOut(false);
    router.push("/sign-in");
  };

  return (
    <SafeAreaView className="flex-1 bg-primary">
      <View className="flex flex-col flex-1 gap-4 px-4 py-6">
        {/* Header */}
        <Text
          className="text-center font-bold text-[#6366ff] py-4 "
          style={{ fontSize: 24 }}
        >
          Configuración de la cuenta
        </Text>

        {/* User Profile Photo */}
        <View className="items-center mb-8">
          <View className="relative">
            <Image source={imagen} className="w-32 h-32 rounded-full" />
            <TouchableOpacity
              className="absolute bottom-0 right-0 bg-[#6366FF] p-2 rounded-full"
              // Cuando hagamos click en el botón de la cámara tenemos que enseñar el modal con las diferentes opciones al usuario
              onPress={() => setshowModal(true)}
            >
              <Camera size={20} color="white" />
            </TouchableOpacity>
          </View>
          <Text className="mt-4 text-xl text-white font-psemibold">
            Enrique Viqueira
          </Text>
        </View>

        {/* Picture Options Modal */}
        <PictureOptions
          visible={showModal}
          setModalVisible={setshowModal}
          uploadPicture={uploadPicture}
          deletePicture={deletePicture}
        />

        <ScrollView
          contentContainerStyle={{
            flexGrow: 1, //Puede crecer y adaptarse al nuevo tamaño y scroll
            gap: 10,
            width: "100%",
          }}
          showsVerticalScrollIndicator={false}
        >
          {/*GRÁFICA QUE MUESTRA CUANTOS DÍAS DEL MES EL USER AHA INTERACCIONADO CON EL CHAT Y HA HABLADO SOBRE SUS SUEÑOS*/}
          <View className="flex flex-col items-center bg-[#1e2a47] rounded-xl p-4 mb-4">
            <View className="flex flex-row gap-2 items-center mb-2">
              <BadgeCheck size={20} color="#fff" />
              <Text
                className="text-lg font-bold color-[#6366ff]"
                style={{ fontSize: 18 }}
              >
                Mapa de Contribución de Chats Diarios
              </Text>
            </View>
            <View className="flex items-center mr-4">
              <ChatContributionGraph />
            </View>
            <Text className="text-sm text-center text-gray-400">
              Visualiza tu interacción diaria con el chat y mejora tu
              experiencia.
            </Text>
          </View>

          {/* Personal Information */}
          <View className="bg-[#1e2a47] rounded-xl p-4">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-white font-pmedium">
                Correo Electrónico
              </Text>
              <TouchableOpacity
                //Cuando lo presionemos tenemos que poner visible el modal para cambiar el correo del user
                onPress={() => setshowModalChangeEmail(true)}
              >
                <Edit2 size={20} color="#6366FF" />
              </TouchableOpacity>
            </View>
            <Text className="text-white font-pregular">
              enrique.viqueira@example.com
            </Text>
          </View>

          {/* Change Email Modal */}
          <ChangeEmailModal
            visible={showModalChangeEmail}
            setModalVisible={setshowModalChangeEmail}
            //TODO: TENEMOS QUE LLAMAR A LA FUNCIÓN DE CAMBIAR ATRIBUTOS DEL USER PATCH QUE TENEMOS QUE METER EN EL USEAPI
            //TODO: TENEMOS EN EL VALOR DEL CORREO ACTUAL DEL USER CUANDO ENTRAMOS EN LA PANTALLA DE PROFILE Y HACEMOS UN GET DE LA INFO DEL USER QUE ESTA AUTENTICADO
            //currentEmail={}
            //changeEmail={}
            logOut={logOut}
          />

          <View className="bg-[#1e2a47] rounded-xl p-4 flex-col gap-4">
            <Text className="text-white font-pmedium">Fecha de nacimiento</Text>
            <Text className="text-white font-pregular">25 agosto 2002</Text>
          </View>

          {/* Disable Notifications Switch */}
          <View className="bg-[#1e2a47] p-4 rounded-xl flex-row justify-between">
            <View className="flex-row gap-2 items-center">
              <Text className="text-lg text-white font-psemibold">
                Notificaciones Activas
              </Text>
              <BellRing color="white" />
            </View>
            <Switch
              trackColor={{ false: "#FFFFFF", true: "#6366FF" }}
              thumbColor="#FFFFFF"
              ios_backgroundColor="#FFFFFF"
              //TODO: TENEMOS QUE IMPLEMENTAR LA LOGICA PARA DESACTIVAR O ACTIVAR LAS NOTIFICACIONES DEPENDIENDO DEL ESTADO DEL SWITCH
              onValueChange={toggleEnabled}
              value={isSwitchEnabled}
            />
          </View>

          {/* Change Password Button */}
          <TouchableOpacity
            className="bg-[#1e2a47] p-4 rounded-xl items-start"
            //Cuando pinchamos en el botón tenemos que enseñar el modal de cambiar la contraseña
            onPress={() => setshowModalChangePassword(true)}
          >
            <View className="flex-row gap-2 items-center">
              <Text className="text-lg text-white font-psemibold">
                Cambiar Contraseña
              </Text>
              <LockKeyhole color="white" />
            </View>
          </TouchableOpacity>

          {/* Change Password Modal */}
          <ChangePasswordModal
            visible={showModalChangePassword}
            setModalVisible={setshowModalChangePassword}
            //TODO: TENEMOS QUE LLAMAR A LA FUNCIÓN DE CAMBIAR ATRIBUTOS DEL USER PATCH QUE TENEMOS QUE METER EN EL USEAPI, LO QUE NO SE ES COMO HACER LO DE LA CONTRASEÑA ACTUAL
            //TODO: SI HACER UNA FUNCION EN LA API O TENER UN CONTEXT DE DONDE LA SAQUEMOS O EL KEYSTORAGE O ALGO ASI
            //currentPassword={}
            //changePassword={}
            logOut={logOut}
          />

          {/* favsTips Button */}
          <TouchableOpacity
            className="bg-[#1e2a47] p-4 rounded-xl items-start"
            //Cuando presionamos el botón tenemos que navegar a la pantalla de mis tips favoritos
            onPress={() => router.push("../FavTips")}
          >
            <View className="flex-row gap-2 items-center">
              <Text className="text-lg text-white font-psemibold">
                Mis Tips Favoritos
              </Text>
              <BookmarkCheck color="white" />
            </View>
          </TouchableOpacity>

          {/* Help Button */}
          <TouchableOpacity
            className="bg-[#1e2a47] p-4 rounded-xl items-start"
            //TODO: Tenemos que hacer una panatlla donde el user pueda recibir ayuda en caso de problemas
          >
            <View className="flex-row gap-2 items-center">
              <Text className="text-lg text-white font-psemibold">Ayuda</Text>
              <HelpCircle color="white" />
            </View>
          </TouchableOpacity>

          {/* Logout Button */}
          <TouchableOpacity
            className="bg-[#ff6b6b] py-4 rounded-xl items-center"
            //Cuando presionemos el botón enseñaremos al user un pop-up de confirmación
            onPress={() => setshowModalLogOut(true)}
          >
            <Text className="text-lg text-white font-psemibold">
              Cerrar Sesión
            </Text>
          </TouchableOpacity>

          {/* LogOut Modal */}
          <LogOutModal
            visible={showModalLogOut}
            setModalVisible={setshowModalLogOut}
            logOut={logOut}
          />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default Profile;
