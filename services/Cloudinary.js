import axios from "axios";

export const uploadImage = async (imageUri) => {
  // Crea un FormData para enviar la imagen
  const formData = new FormData();
  formData.append("file", {
    uri: imageUri,
    type: "image/jpeg", // Ajusta el tipo según corresponda (png, etc.)
    name: "upload.jpg", // Puedes generar un nombre dinámico si lo prefieres
  });
  // Agrega el preset que configuraste en Cloudinary
  formData.append("upload_preset", "cloudinary-TFG");

  const url = `https://api.cloudinary.com/v1_1/dtg2mkilx/image/upload`;

  try {
    const response = await axios.post(url, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    console.log("Imagen subida con éxito:", response.data);
    // La respuesta incluye la URL pública de la imagen
    return response.data.secure_url;
  } catch (error) {
    console.error("Error al subir la imagen:", error);
    return null;
  }
};
