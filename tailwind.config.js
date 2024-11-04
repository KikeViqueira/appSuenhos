/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        //Definimos los colores que vamos a utilizar en nuestra aplicación, y asi a la hora de llamarlos en el código, solo tenemos que hacer referencia a su nombre
        primary: "#0e172a",

      },
    },
  },
  plugins: [],
}