import React from "react";
import { View, Text, Modal, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";

const AuthModal = ({ visible, onClose, type }) => {
  // Configuraciones para diferentes tipos de modales
  const modalConfig = {
    loginError: {
      icon: "exclamation-triangle",
      iconColor: "#ff6b6b",
      title: "Error de Inicio de Sesión",
      message:
        "El email o la contraseña son incorrectos. Por favor, verifica tus credenciales e inténtalo de nuevo.",
      buttonText: "Intentar de nuevo",
      buttonColor: "#ff6b6b",
    },
    emailExists: {
      icon: "user-times",
      iconColor: "#fbbf24",
      title: "Email ya registrado",
      message:
        "Ya existe una cuenta con este email. ¿Te gustaría iniciar sesión en su lugar?",
      buttonText: "Ir a Iniciar Sesión",
      buttonColor: "#fbbf24",
      secondaryButton: true,
      secondaryButtonText: "Usar otro email",
    },
    passwordMismatch: {
      icon: "lock",
      iconColor: "#ff6b6b",
      title: "Contraseñas no coinciden",
      message:
        "Las contraseñas ingresadas no coinciden. Por favor, verifica que ambas contraseñas sean idénticas.",
      buttonText: "Entendido",
      buttonColor: "#ff6b6b",
    },
    registrationSuccess: {
      icon: "check-circle",
      iconColor: "#15db44",
      title: "¡Registro exitoso!",
      message:
        "Tu cuenta ha sido creada correctamente. Ahora puedes iniciar sesión con tus credenciales.",
      buttonText: "Ir a Iniciar Sesión",
      buttonColor: "#15db44",
    },
    invalidEmailFormat: {
      icon: "envelope-o",
      iconColor: "#fbbf24",
      title: "Formato de email incorrecto",
      message:
        "El email debe seguir estas reglas:\n\n• Debe contener un símbolo @\n• Debe tener texto antes y después del @\n• Debe terminar con un dominio válido (.com, .es, .org, etc.)\n• No puede contener espacios ni caracteres especiales\n\nEjemplo válido: usuario@ejemplo.com",
      buttonText: "Entendido",
      buttonColor: "#fbbf24",
    },
  };

  //Guardamos en config el objeto del array que corresponde al tipo de modal y si no se encuentra el tipo de modal, se muestra el objeto de loginError
  const config = modalConfig[type] || modalConfig.loginError;

  const handlePrimaryAction = () => {
    //Lógica que está relacionada con el botón principal del modal
    if (type === "emailExists" || type === "registrationSuccess") {
      /*
       * En caso de que se de uno de estos casos vamos a navegar a sign-in asi que lo tenemos que indicar ya que estamos en la pantalla de registro
       * si el email ya existe se le presentan al user dos botones, uno para ir a sign-in y otro para usar otro email
       * si el registro es exitoso se le presenta al user un botón para ir a sign-in
       */
      onClose("navigateToSignIn");
    } else {
      onClose();
    }
  };

  const handleSecondaryAction = () => {
    //Como el único modal posible que tiene dos botones es el de emailExists, si clickeamos en el botón secundario se cierra el modal y nos quedamos en la propia pantalla de resgistro
    onClose(); //No mandamos ninguna action ya que no se va a hacer nada salvo ocultar el modal
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={() => onClose()} // Permitir cerrar con botón de atrás del dispositivo
    >
      <View className="items-center justify-center flex-1 bg-black/70">
        <View className="bg-[#1e2a47] rounded-2xl p-6 w-[85%] max-w-[400px]">
          {/* Icono */}
          <View className="items-center mb-4">
            <View
              className="items-center justify-center w-16 h-16 rounded-full"
              style={{ backgroundColor: `${config.iconColor}20` }}
            >
              <Icon name={config.icon} size={28} color={config.iconColor} />
            </View>
          </View>

          {/* Título */}
          <Text
            className="mb-3 font-bold text-center text-white"
            style={{ fontSize: 20 }}
          >
            {config.title}
          </Text>

          {/* Mensaje */}
          <Text
            className="mb-6 leading-6 text-center text-gray-400"
            style={{ fontSize: 16, lineHeight: 24 }}
          >
            {config.message}
          </Text>

          {/* Botones */}
          <View className="gap-3">
            {/* Botón principal */}
            <TouchableOpacity
              onPress={handlePrimaryAction}
              className="items-center px-6 py-4 rounded-2xl"
              style={{
                backgroundColor: config.buttonColor,
                shadowColor: config.buttonColor,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 8,
              }}
            >
              <Text className="text-lg font-semibold text-white">
                {config.buttonText}
              </Text>
            </TouchableOpacity>

            {/* Botón secundario (si existe) */}
            {config.secondaryButton && (
              <TouchableOpacity
                onPress={handleSecondaryAction}
                className="items-center px-6 py-4 border-2 rounded-2xl"
                style={{
                  borderColor: "rgba(99, 102, 255, 0.3)",
                  backgroundColor: "transparent",
                }}
              >
                <Text className="text-[#6366ff] font-semibold text-lg">
                  {config.secondaryButtonText}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Línea decorativa */}
          <View
            className="self-center h-1 mt-6 rounded-full"
            style={{
              width: 60,
              backgroundColor: config.iconColor,
              opacity: 0.3,
            }}
          />
        </View>
      </View>
    </Modal>
  );
};

export default AuthModal;
