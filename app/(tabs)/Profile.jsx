import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Alert,
  ScrollView,
  Switch,
} from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, MaterialCommunityIcons, Octicons } from "@expo/vector-icons";
import placeholderImage from "../../assets/images/placeholder.png";
import * as ImagePicker from "expo-image-picker";
import PictureOptions from "../../components/PictureOptions";
import { router } from "expo-router";
import LogOutModal from "../../components/LogOutModal";
import ChangePasswordModal from "../../components/ChangePasswordModal";
import ChatContributionGraph from "../../components/ChatContributionGraph";
import { useAuthContext } from "../../context/AuthContext";
import useUser from "../../hooks/useUser";

const Profile = () => {
  //Hacemos states tanto para guardar la foto como para controlar que el modal de opciones de cámara este desplegado o no

  const [image, setImage] = useState(placeholderImage); //Valor por default
  const [showModal, setshowModal] = useState(false);
  const [showModalLogOut, setshowModalLogOut] = useState(false);
  const [showModalChangePassword, setshowModalChangePassword] = useState(false);
  const [isSwitchEnabled, setIsSwitchEnabled] = useState(false);
  //Estado para saber si el user tiene una foto de perfil propia o tiene el placeholder
  const [hasCustomImage, setHasCustomImage] = useState(false);

  //Recuperamos la info del user que se ha logueado en la app mediante el contexto de Auth y la función para cerrar sesión
  const { userInfo, logout } = useAuthContext();
  //Importamos la llamada al endpoint de updateUser
  const { deleteProfilePicture, updateProfilePicture } = useUser();

  //Cuando carguemos la pantalla tenemos que cargar la foto de perfil que el user tenga en la BD
  /*
   * El componente que espera react en las image es un objeto con la propiedad uri
   * por eso si queremos que se renderice la imagen tenemos que entregar un objeto con la propiedad uri
   * {uri: "url de la imagen"}
   * En el caso de que no haya imagen, le pasamos la imagen de placeholder que tenemos en assets
   */
  useEffect(() => {
    //Como el user siempre tiene foto de perfil ya que cuando crea la cuenta se le asigna directamente el placeholder (image), tenemos que mirar si la imagen es distinta a la de placeholder
    if (userInfo.profilePicture !== image.uri)
      setImage({ uri: userInfo.profilePicture });
    setHasCustomImage(true);
  }, []);

  //TODO:AQUI ES DONDE TENEMOS QUE HACER EL COMPORTAMIENTO DE LA FUNCIÓN QUE SE ENCARGARÁ DE ACTIVAR/DESACTIVAR LAS NOTIFICACIONES
  //TODO: TENEMOS QUE METER ESTO EN EL ASYNC STORAGE PARA QUE SE GUARDE EL ESTADO DE LAS NOTIFICACIONES, Y CARGARLO CON UN USEEFFECT CUANDO ENTREMOS EN LA APP
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
          mediaTypes: ["image/*"],
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
      if (result.assets[0].fileSize > 20 * 1024 * 1024) {
        Alert.alert(
          "Imagen demasiado grande",
          "El archivo no puede superar los 20MB."
        );
        return;
      }
      savePicture({ imagen: result.assets[0].uri });
    }
  };

  //Función para borrar la foto que el user tiene de perfil
  const deletePicture = async () => {
    try {
      //Si el user tiene una foto de perfil personalizada, la borramos y le asignamos el placeholder
      if (hasCustomImage) {
        await deleteProfilePicture();
        setImage(placeholderImage);
        setHasCustomImage(false);
        setshowModal(false);
      }
      //TODO: DECIRLE AL USER QUE ES LO QUE ESTA PASANDO SI ESO
    } catch (error) {
      Alert.alert(
        "Error",
        "Ha sucedido un error a la hora de borrar la foto, inténtalo de nuevo"
      );
    }
  };

  //Función para saber el type de la foto
  const getFileType = (uri) => {
    const extension = uri.split(".").pop();
    const mimeType = `image/${extension === "jpg" ? "jpeg" : extension}`;
    return { extension, mimeType };
  };

  //Función para guardar la foto en el estado que hemos definido y a mayores guardarla en la base de datos
  const savePicture = async ({ imagen }) => {
    try {
      const { extension, mimeType } = getFileType(imagen);
      const sanitizedUserName = userInfo.name
        ?.replace(/\s+/g, "_")
        .toLowerCase();
      //Hacemos el objeto que espera la api que se le pase
      const form = new FormData();
      form.append("file", {
        uri: imagen,
        type: mimeType,
        name: `profilePicture-${sanitizedUserName}.${extension}`,
      });
      await updateProfilePicture(form);
      //Como estamos guardando una   foto dinámica, tenemos que pasarla a un URI y asi pasar el objeto y que react sepa que es una foto que no está en el proyecto
      //Y de esta manera puede cargarla como imagen en la aplicación
      setImage({ uri: imagen });
      setHasCustomImage(true);
      setshowModal(false);
    } catch (error) {
      Alert.alert(
        "Error",
        "Ha sucedido un error a la hora de guardar la foto, inténtalo de nuevo"
      );
    }
  };

  return (
    <SafeAreaView className="w-full h-full bg-primary">
      <View className="flex flex-col gap-4 px-4 mt-4 w-full h-full">
        {/* Header */}
        <Text
          className="text-center font-bold text-[#6366ff] py-4 "
          style={{ fontSize: 24 }}
        >
          Configuración de la cuenta
        </Text>

        <ScrollView
          contentContainerStyle={{
            flexGrow: 1, //Puede crecer y adaptarse al nuevo tamaño y scroll
            gap: 10,
            width: "100%",
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* User Profile Photo */}
          <View className="items-center mb-8">
            <View className="relative">
              <Image source={image} className="w-32 h-32 rounded-full" />
              <TouchableOpacity
                className="absolute bottom-0 right-0 bg-[#6366FF] p-2 rounded-full"
                // Cuando hagamos click en el botón de la cámara tenemos que enseñar el modal con las diferentes opciones al usuario
                onPress={() => setshowModal(true)}
              >
                <Feather name="camera" size={20} color="white" />
              </TouchableOpacity>
            </View>
            <Text className="mt-4 text-xl text-white font-psemibold">
              {userInfo?.name || "UserName Placeholder"}
            </Text>
          </View>

          {/* Picture Options Modal */}
          <PictureOptions
            visible={showModal}
            setModalVisible={setshowModal}
            uploadPicture={uploadPicture}
            deletePicture={deletePicture}
          />
          {/*GRÁFICA QUE MUESTRA CUANTOS DÍAS DEL MES EL USER HA INTERACCIONADO CON EL CHAT Y HA HABLADO SOBRE SUS SUEÑOS*/}
          <View className="flex flex-col items-center bg-[#1e2a47] rounded-xl p-4 mb-4">
            <View className="flex flex-row gap-2 items-center mb-2">
              <Octicons name="verified" size={20} color="#fff" />
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
            </View>
            <Text className="text-white font-pregular">
              {userInfo?.email || "user@domain.com"}
            </Text>
          </View>

          <View className="bg-[#1e2a47] rounded-xl p-4 flex-col gap-4">
            <Text className="text-white font-pmedium">Fecha de nacimiento</Text>
            <Text className="text-white font-pregular">
              {userInfo?.birthDate || "YYYY-MM-DD"}
            </Text>
          </View>

          {/* Disable Notifications Switch */}
          <View className="bg-[#1e2a47] p-4 rounded-xl flex-row justify-between">
            <View className="flex-row gap-2 items-center">
              <Feather name="bell" color="white" size={20} />
              <Text className="text-lg text-white font-psemibold">
                Notificaciones Activas
              </Text>
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
              <Feather name="lock" color="white" size={20} />
              <Text className="text-lg text-white font-psemibold">
                Cambiar Contraseña
              </Text>
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
            logOut={logout}
          />

          {/* favsTips Button */}
          <TouchableOpacity
            className="bg-[#1e2a47] p-4 rounded-xl items-start"
            //Cuando presionamos el botón tenemos que navegar a la pantalla de mis tips favoritos
            onPress={() => router.push("../FavTips")}
          >
            <View className="flex-row gap-2 items-center">
              <MaterialCommunityIcons
                name="bookmark-outline"
                color="white"
                size={24}
              />
              <Text className="text-lg text-white font-psemibold">
                Mis Tips Favoritos
              </Text>
            </View>
          </TouchableOpacity>

          {/* Help Button */}
          <TouchableOpacity
            className="bg-[#1e2a47] p-4 rounded-xl items-start"
            //TODO: Tenemos que hacer una panatlla donde el user pueda recibir ayuda en caso de problemas
          >
            <View className="flex-row gap-2 items-center">
              <Feather name="help-circle" color="white" size={24} />
              <Text className="text-lg text-white font-psemibold">Ayuda</Text>
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
            logOut={logout}
          />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default Profile;
