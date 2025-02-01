import { AlarmClock, Bed, Moon, Coffee, Lightbulb } from "lucide-react-native";

export const tips = [
  {
    id: 1,
    title: "Rutina Consistente",
    description:
      "Acuéstate y despiértate a la misma hora todos los días para regular tu reloj biológico.",
    icon: AlarmClock,
    color: "red",
    details: {
      fullDescription:
        "Mantener una rutina de sueño constante ayuda a sincronizar tu reloj biológico, lo que mejora la calidad del sueño y facilita conciliarlo y despertarse sin sentir fatiga. Intenta no variar tu horario de sueño en más de una hora, incluso los fines de semana.",
      benefits: [
        "Mejora la calidad del sueño",
        "Regula el ritmo circadiano",
        "Aumenta la energía durante el día",
        "Reduce el riesgo de insomnio",
      ],
      implementation: [
        "Establece una hora fija para acostarte y despertarte.",
        "Utiliza alarmas para recordarte cuándo es hora de dormir.",
        "Evita desvelarte los fines de semana para mantener la rutina.",
      ],
    },
  },
  {
    id: 2,
    title: "Ambiente Ideal",
    description:
      "Mantén tu habitación oscura, fresca y silenciosa para favorecer un sueño profundo.",
    icon: Bed,
    color: "green",
    details: {
      fullDescription:
        "El entorno en el que duermes juega un papel clave en la calidad de tu descanso. Un ambiente oscuro, silencioso y con una temperatura adecuada ayuda a conciliar el sueño más rápido y a mantenerlo sin interrupciones.",
      benefits: [
        "Favorece un sueño profundo y reparador",
        "Reduce las interrupciones nocturnas",
        "Mejora la calidad del descanso",
        "Disminuye el estrés y la ansiedad",
      ],
      implementation: [
        "Usa cortinas opacas o un antifaz para bloquear la luz.",
        "Mantén la temperatura de la habitación entre 18-20°C.",
        "Reduce los ruidos con tapones para los oídos o una máquina de ruido blanco.",
        "Evita luces brillantes antes de acostarte.",
      ],
    },
  },
  {
    id: 3,
    title: "Evita la Cafeína",
    description:
      "No consumas cafeína al menos 6 horas antes de dormir para evitar insomnio.",
    icon: Coffee,
    color: "white",
    details: {
      fullDescription:
        "La cafeína es un estimulante que puede permanecer en el organismo durante horas, afectando la capacidad de conciliar el sueño. Evitar su consumo en la tarde y noche puede mejorar significativamente tu descanso.",
      benefits: [
        "Facilita el inicio del sueño",
        "Reduce el número de despertares nocturnos",
        "Mejora la calidad del sueño profundo",
        "Evita la fatiga matutina",
      ],
      implementation: [
        "Evita el café, té, refrescos y bebidas energéticas después de las 4 p.m.",
        "Opta por infusiones relajantes como manzanilla o valeriana en la noche.",
        "Revisa etiquetas de productos, ya que algunos contienen cafeína oculta.",
      ],
    },
  },
  {
    id: 4,
    title: "Luz Azul, No Gracias",
    description:
      "Reduce el uso de pantallas antes de dormir para no alterar la producción de melatonina.",
    icon: Lightbulb,
    color: "yellow",
    details: {
      fullDescription:
        "Las pantallas de dispositivos electrónicos emiten luz azul, la cual suprime la producción de melatonina, la hormona que regula el sueño. Limitar la exposición a estas luces antes de dormir puede mejorar la calidad del descanso.",
      benefits: [
        "Facilita conciliar el sueño más rápido",
        "Evita interrupciones en la fase de sueño profundo",
        "Mejora la calidad del descanso",
        "Reduce la fatiga ocular",
      ],
      implementation: [
        "Reduce el uso de pantallas al menos 1 hora antes de dormir.",
        "Usa el modo nocturno en dispositivos electrónicos.",
        "Opta por actividades sin pantallas, como leer un libro físico.",
        "Si necesitas usar pantallas, considera gafas con filtro de luz azul.",
      ],
    },
  },
  {
    id: 5,
    title: "Relájate Antes de Dormir",
    description:
      "Crea una rutina relajante como leer o meditar para preparar tu cuerpo para el descanso.",
    icon: Moon,
    color: "purple",
    details: {
      fullDescription:
        "Establecer una rutina de relajación antes de dormir ayuda a reducir el estrés y preparar el cuerpo para el descanso. Actividades como la lectura, la meditación o una ducha caliente pueden mejorar la calidad del sueño.",
      benefits: [
        "Disminuye el estrés y la ansiedad",
        "Facilita el proceso de conciliar el sueño",
        "Mejora la calidad del descanso",
        "Aumenta la sensación de bienestar",
      ],
      implementation: [
        "Dedica al menos 30 minutos a una actividad relajante antes de acostarte.",
        "Evita estímulos fuertes como noticias o contenido estresante en la noche.",
        "Prueba técnicas de respiración profunda o meditación guiada.",
        "Toma un baño caliente para relajar los músculos y reducir la tensión.",
      ],
    },
  },
];

export default tips;
