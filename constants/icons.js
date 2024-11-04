
/*
require() en JavaScript es una función que se utiliza para importar módulos o archivos en un proyecto. 
En React Native, cuando usamos require() para importar imágenes estáticas, el empaquetador (Metro Bundler) analiza estas rutas de archivos durante la compilación, 
lo que le permite incluir y optimizar los archivos de imagen en la aplicación.

En este contexto, require() asegura que las imágenes estén correctamente empaquetadas en la aplicación, ya que en el momento de la compilación, 
Metro sabe qué imágenes debe incluir en el bundle final. Este proceso es crucial para que las imágenes se gestionen adecuadamente, 
sobre todo cuando se necesitan rutas estáticas.
*/

const icons = {
  play: require("../assets/icons/play.png"),
  bookmark: require("../assets/icons/bookmark.png"),
  home: require("../assets/icons/home.png"),
  plus: require("../assets/icons/plus.png"),
  profile: require("../assets/icons/profile.png"),
  leftArrow: require("../assets/icons/left-arrow.png"),
  menu: require("../assets/icons/menu.png"),
  search: require("../assets/icons/search.png"),
  upload: require("../assets/icons/upload.png"),
  rightArrow: require("../assets/icons/right-arrow.png"),
  logout: require("../assets/icons/logout.png"),
  eyeHide: require("../assets/icons/eye-hide.png"),
  eye: require("../assets/icons/eye.png"),
  barChart: require("../assets/icons/bar-chart-icon.png"),
  alarm: require("../assets/icons/alarm.png"),
  chat: require("../assets/icons/chat.png"),
  tips: require("../assets/icons/tips.png"),
};

export default icons;



/*import bookmark from "../assets/icons/bookmark.png";
import home from "../assets/icons/home.png";
import plus from "../assets/icons/plus.png";
import profile from "../assets/icons/profile.png";
import leftArrow from "../assets/icons/left-arrow.png";
import menu from "../assets/icons/menu.png";
import search from "../assets/icons/search.png";
import upload from "../assets/icons/upload.png";
import rightArrow from "../assets/icons/right-arrow.png";
import logout from "../assets/icons/logout.png";
import eyeHide from "../assets/icons/eye-hide.png";
import eye from "../assets/icons/eye.png";
import play from "../assets/icons/play.png";

export default {
  play,
  bookmark,
  home,
  plus,
  profile,
  leftArrow,
  menu,
  search,
  upload,
  rightArrow,
  logout,
  eyeHide,
  eye,
};*/