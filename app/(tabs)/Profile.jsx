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
import * as ImagePicker from "expo-image-picker";
import PictureOptions from "../../components/PictureOptions";
import { router } from "expo-router";
import LogOutModal from "../../components/LogOutModal";
import ChangePasswordModal from "../../components/ChangePasswordModal";
import DisableNotificationsModal from "../../components/DisableNotificationsModal";
import DeleteAccountModal from "../../components/DeleteAccountModal";
import ChatContributionGraph from "../../components/ChatContributionGraph";
import { useAuthContext } from "../../context/AuthContext";
import useUser from "../../hooks/useUser";
import useNotifications from "../../hooks/useNotifications";
import LoadingModal from "../../components/LoadingModal";
import { CLOUDINARY_PLACEHOLDER_URL } from "../../config/config";

const Profile = () => {
  //Recuperamos la info del user que se ha logueado en la app mediante el contexto de Auth y la función para cerrar sesión
  const { userInfo, logout, deleteAccount } = useAuthContext();

  //Hacemos states tanto para guardar la foto como para controlar que el modal de opciones de cámara este desplegado o no
  const [image, setImage] = useState({
    uri: CLOUDINARY_PLACEHOLDER_URL,
  }); //Valor por default
  const [showModal, setshowModal] = useState(false);
  const [showModalLogOut, setshowModalLogOut] = useState(false);
  const [showModalChangePassword, setshowModalChangePassword] = useState(false);
  const [showModalDeleteAccount, setshowModalDeleteAccount] = useState(false);
  //Estado para controlar el modal de desactivar notificaciones
  const [showModalDisableNotifications, setShowModalDisableNotifications] =
    useState(false);
  //Estado para saber si el user tiene una foto de perfil propia o tiene el placeholder
  const [hasCustomImage, setHasCustomImage] = useState(false);

  // Estados para el modal de carga
  const [loadingModalVisible, setLoadingModalVisible] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [loadingType, setLoadingType] = useState(""); // "upload" o "delete"

  //Importamos la llamada al endpoint de updateUser
  const { deleteProfilePicture, updateProfilePicture } = useUser();

  //Importamos las funciones para manejar notificaciones
  const {
    notificationsEnabled,
    loading: notificationsLoading,
    enableNotifications,
    disableNotifications,
  } = useNotifications();

  //Cuando carguemos la pantalla tenemos que cargar la foto de perfil que el user tenga en la BD
  /*
   * El componente que espera react en las image es un objeto con la propiedad uri
   * por eso si queremos que se renderice la imagen tenemos que entregar un objeto con la propiedad uri
   * {uri: "url de la imagen"}
   * En el caso de que no haya imagen, le pasamos la imagen de placeholder que tenemos en assets
   */
  useEffect(() => {
    //Comprobamos si el user tiene una foto de perfil personalizada y setteamos los distintos estados en base a ello
    if (userInfo?.profilePicture && userInfo?.profilePicture !== image.uri) {
      setImage({ uri: userInfo?.profilePicture });
      setHasCustomImage(true);
    }
  }, [userInfo]);

  //Función para manejar el toggle de notificaciones
  const handleNotificationToggle = async () => {
    if (notificationsEnabled) {
      // Si están activadas y quiere desactivarlas, mostrar modal de confirmación
      setShowModalDisableNotifications(true);
    } else {
      // Si están desactivadas y quiere activarlas, activar directamente
      try {
        await enableNotifications();
      } catch (error) {
        Alert.alert(
          "Error",
          "No se pudieron activar las notificaciones. Inténtalo de nuevo."
        );
      }
    }
  };

  //Función que se ejecuta cuando el user confirma desactivar las notificaciones
  const handleConfirmDisableNotifications = async () => {
    try {
      await disableNotifications();
      Alert.alert(
        "Notificaciones desactivadas",
        "Se han cancelado todas las notificaciones programadas.",
        [{ text: "Entendido" }]
      );
    } catch (error) {
      Alert.alert(
        "Error",
        "No se pudieron desactivar las notificaciones. Inténtalo de nuevo."
      );
    }
  };

  //hacemos función de guardar foto que incluye las opciones de sacar foto o elegir una de la galería, en base al parámetro que reciba
  const uploadPicture = async ({ mode }) => {
    //tenemos que definir la función como asíncrona para poder usar métodos await que esperan a que se resuelvan promesas

    let result = {}; //Variable para guardar la foto del user de manera local

    if (mode === "gallery") {
      try {
        const permissionResult =
          await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (permissionResult.granted === false) {
          Alert.alert(
            "Permisos requeridos",
            "ZzzTime necesita acceso a tu galería de fotos para cambiar tu foto de perfil."
          );
          return;
        }

        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ["images"],
          allowsEditing: true,
          aspect: [4, 3],
          quality: 1,
        });
      } catch (error) {
        console.log("Error al acceder a la galería:", error);
        Alert.alert(
          "Error",
          "Ha sucedido un error a la hora de seleccionar la foto de la galería, inténtalo de nuevo"
        );
      }
    } else {
      //Estamos en el caso de que el user sube una foto de perfil sacada directamente desde la cámara
      try {
        const permissionResult =
          await ImagePicker.requestCameraPermissionsAsync();

        if (permissionResult.granted === false) {
          Alert.alert(
            "Permisos requeridos",
            "ZzzTime necesita acceso a tu cámara para tomar tu foto de perfil."
          );
          return;
        }

        result = await ImagePicker.launchCameraAsync({
          cameraType: ImagePicker.CameraType.front, //hacemos que la cámara por defecto sea la frontal a la hora de sacar la foto
          allowsEditing: true,
          aspect: [4, 3],
          quality: 1,
        });
      } catch (error) {
        console.log("Error al acceder a la cámara:", error);
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

      //Ocultamos el modal de opciones de cámara del user, solo si el user ha seleccionado una foto y no ha cancelado la operación de subida
      setshowModal(false);

      // Aumentamos el retraso para asegurar que el modal PictureOptions se cierre completamente antes de abrir el LoadingModal
      setTimeout(() => {
        // Mostrar indicador de carga inmediatamente después de seleccionar la imagen
        setLoadingType("upload");
        setLoadingMessage("Subiendo la foto de perfil...");
        setLoadingModalVisible(true);

        savePicture({ imagen: result.assets[0].uri });
      }, 500);
    }
  };

  //Función para borrar la foto que el user tiene de perfil
  const deletePicture = async () => {
    try {
      //Si el user tiene una foto de perfil personalizada, la borramos y le asignamos el placeholder
      if (hasCustomImage) {
        //Ocultamos el modal de opciones de cámara del user, solo si el user ha seleccionado una foto y no ha cancelado la operación de subida
        setshowModal(false);
        // Mostrar indicador de carga
        setLoadingType("delete");
        setLoadingMessage("Eliminando la foto de perfil...");
        setLoadingModalVisible(true);

        //Setteamos en el estado la url del placeholder
        const profilePicture = await deleteProfilePicture();
        setImage({ uri: profilePicture });

        setHasCustomImage(false);

        // Ocultar indicador de carga
        setLoadingModalVisible(false);
      }
    } catch (error) {
      setLoadingModalVisible(false);
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

      // Ocultar indicador de carga
      setLoadingModalVisible(false);
    } catch (error) {
      setLoadingModalVisible(false);
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
          showsVerticalScrollIndicator={true}
          indicatorStyle="white"
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
            hasCustomImage={hasCustomImage}
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
          <View className="bg-[#1e2a47] rounded-xl p-6 border border-[#323d4f]/30">
            <View className="flex-row gap-3 items-center mb-6">
              <View className="bg-[#6366ff]/10 p-2 rounded-full">
                <Feather name="user" size={20} color="#6366ff" />
              </View>
              <Text className="text-xl font-bold text-white">
                Información Personal
              </Text>
            </View>

            {/* Email Section */}
            <View className="mb-6">
              <View className="flex-row gap-3 items-center mb-3">
                <View className="bg-[#15db44]/10 p-2 rounded-lg">
                  <Feather name="mail" size={18} color="#15db44" />
                </View>
                <Text className="text-sm font-medium text-[#15db44] uppercase tracking-wide">
                  Correo Electrónico
                </Text>
              </View>
              <View className="bg-[#1e273a] p-4 rounded-xl border-l-4 border-[#15db44]">
                <Text className="text-base font-medium text-white">
                  {userInfo?.email || "user@domain.com"}
                </Text>
              </View>
            </View>

            {/* Birth Date Section */}
            <View>
              <View className="flex-row gap-3 items-center mb-3">
                <View className="bg-[#6366ff]/10 p-2 rounded-lg">
                  <Feather name="calendar" size={18} color="#6366ff" />
                </View>
                <Text className="text-sm font-medium text-[#6366ff] uppercase tracking-wide">
                  Fecha de Nacimiento
                </Text>
              </View>
              <View className="bg-[#1e273a] p-4 rounded-xl border-l-4 border-[#6366ff]">
                <Text className="text-base font-medium text-white">
                  {userInfo?.birthDate
                    ? new Date(userInfo.birthDate).toLocaleDateString("es-ES", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })
                    : "No especificada"}
                </Text>
              </View>
            </View>
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
              onValueChange={handleNotificationToggle}
              value={notificationsEnabled}
            />
          </View>

          {/* Disable Notifications Modal */}
          <DisableNotificationsModal
            visible={showModalDisableNotifications}
            setModalVisible={setShowModalDisableNotifications}
            onConfirmDisable={handleConfirmDisableNotifications}
          />

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
            onPress={() => router.push("../Help")}
          >
            <View className="flex-row gap-2 items-center">
              <Feather name="help-circle" color="white" size={24} />
              <Text className="text-lg text-white font-psemibold">Ayuda</Text>
            </View>
          </TouchableOpacity>

          {/* Logout Button */}
          <TouchableOpacity
            className="bg-[#ff4757] py-4 rounded-xl items-center"
            //Cuando presionemos el botón enseñaremos al user un pop-up de confirmación
            onPress={() => setshowModalLogOut(true)}
          >
            <View className="flex-row gap-2 items-center">
              <Feather name="log-out" color="white" size={20} />
              <Text className="text-lg text-white font-psemibold">
                Cerrar Sesión
              </Text>
            </View>
          </TouchableOpacity>

          {/* LogOut Modal */}
          <LogOutModal
            visible={showModalLogOut}
            setModalVisible={setshowModalLogOut}
            logOut={logout}
          />

          {/* Delete Account Button */}
          <TouchableOpacity
            className="flex-row items-center bg-[#ff4757]/10 p-4 rounded-2xl border border-[#ff4757]/20 shadow-lg"
            style={{
              shadowColor: "#ff4757",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 8,
              elevation: 3,
            }}
            //Cuando presionemos el botón enseñaremos al user un pop-up de confirmación
            onPress={() => setshowModalDeleteAccount(true)}
          >
            <View className="bg-[#ff4757]/10 p-3 rounded-xl mr-4">
              <Feather name="trash-2" size={24} color="#ff4757" />
            </View>
            <View className="flex-1">
              <Text className="text-lg font-bold text-white">
                Eliminar Cuenta
              </Text>
              <Text className="text-sm text-white/70">
                Esta acción es irreversible
              </Text>
            </View>
            <Feather name="chevron-right" size={20} color="#ff4757" />
          </TouchableOpacity>

          {/* Delete Account Modal */}
          <DeleteAccountModal
            visible={showModalDeleteAccount}
            setModalVisible={setshowModalDeleteAccount}
            deleteAccount={deleteAccount}
          />
        </ScrollView>
      </View>

      {/* Modal de carga para foto de perfil - Movido fuera para máxima prioridad */}
      <LoadingModal
        visible={loadingModalVisible}
        operationType={loadingType}
        contentType="photo"
        message={loadingMessage}
        onRequestClose={() => {}} // Evitamos que se cierre accidentalmente
      />
    </SafeAreaView>
  );
};

export default Profile;
