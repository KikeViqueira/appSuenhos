// Recomendaciones de sueño según la edad
const sleepRecommendations = {
  "sleepRecommendations": [
    {
      "ageRange": "6-13",
      "hours": {
        "minHours": 9,
        "idealHours": 10,
        "maxHours": 11
      },
      "phases": {
        "deep": { "idealMinutes": 120, "minMinutes": 90, "idealCount": 3 },
        "light": { "idealMinutes": 330, "minMinutes": 280, "idealCount": 15 },
        "rem": { "idealMinutes": 120, "minMinutes": 90, "idealCount": 5 },
        "wake": { "idealMinutes": 30, "maxMinutes": 45, "idealCount": 10 }
      }
    },
    {
      "ageRange": "14-17",
      "hours": {
        "minHours": 8,
        "idealHours": 9,
        "maxHours": 10
      },
      "phases": {
        "deep": { "idealMinutes": 100, "minMinutes": 75, "idealCount": 3 },
        "light": { "idealMinutes": 300, "minMinutes": 250, "idealCount": 15 },
        "rem": { "idealMinutes": 90, "minMinutes": 75, "idealCount": 5 },
        "wake": { "idealMinutes": 30, "maxMinutes": 40, "idealCount": 10 }
      }
    },
    {
      "ageRange": "18-25",
      "hours": {
        "minHours": 7,
        "idealHours": 8,
        "maxHours": 9
      },
      "phases": {
        "deep": { "idealMinutes": 60, "minMinutes": 45, "idealCount": 3 },
        "light": { "idealMinutes": 220, "minMinutes": 190, "idealCount": 15 },
        "rem": { "idealMinutes": 90, "minMinutes": 80, "idealCount": 5 },
        "wake": { "idealMinutes": 30, "maxMinutes": 40, "idealCount": 10 }
      }
    },
    {
      "ageRange": "26-64",
      "hours": {
        "minHours": 7,
        "idealHours": 8,
        "maxHours": 9
      },
      "phases": {
        "deep": { "idealMinutes": 60, "minMinutes": 45, "idealCount": 3 },
        "light": { "idealMinutes": 220, "minMinutes": 180, "idealCount": 15 },
        "rem": { "idealMinutes": 80, "minMinutes": 70, "idealCount": 5 },
        "wake": { "idealMinutes": 30, "maxMinutes": 40, "idealCount": 10 }
      }
    },
    {
      "ageRange": "65+",
      "hours": {
        "minHours": 7,
        "idealHours": 7.5,
        "maxHours": 8
      },
      "phases": {
        "deep": { "idealMinutes": 55, "minMinutes": 40, "idealCount": 3 },
        "light": { "idealMinutes": 210, "minMinutes": 170, "idealCount": 15 },
        "rem": { "idealMinutes": 70, "minMinutes": 60, "idealCount": 5 },
        "wake": { "idealMinutes": 35, "maxMinutes": 45, "idealCount": 10 }
      }
    }
  ]
};

export default sleepRecommendations;
