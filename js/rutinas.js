// ===================================================================
// MIS RUTINAS - Plan Torso/Pierna 4 días
// -------------------------------------------------------------------
// Aquí viven tus entrenamientos. Si quieres cambiar un ejercicio, las
// series o las repeticiones, lo editas SOLO aquí.
//
// IMPORTANTE: no cambies los "id". La app los usa para guardar los
// pesos que vas registrando; si cambias un id, perderías el historial
// de ese ejercicio. Lo demás (nombre, series, reps...) tócalo libremente.
// ===================================================================

const RUTINAS = [
    {
      id: "inf-a",
      nombre: "Tren Inferior A",
      enfoque: "Cuádriceps + glúteo",
      ejercicios: [
        { id: "inf-a-sentadilla",   nombre: "Sentadilla con barra",            series: 4, reps: "6-8",      descanso: "2-3 min" },
        { id: "inf-a-rdl",          nombre: "Peso muerto rumano (barra)",      series: 3, reps: "8-10",     descanso: "2 min" },
        { id: "inf-a-prensa",       nombre: "Prensa de piernas",               series: 3, reps: "10-12",    descanso: "90 s" },
        { id: "inf-a-curl-fem",     nombre: "Curl femoral tumbado",            series: 3, reps: "10-12",    descanso: "75 s" },
        { id: "inf-a-gemelos",      nombre: "Elevación de gemelos de pie",     series: 4, reps: "12-15",    descanso: "60 s" },
        { id: "inf-a-plancha",      nombre: "Plancha (o rueda abdominal)",     series: 3, reps: "Máximo",   descanso: "60 s" },
      ],
    },
    {
      id: "sup-a",
      nombre: "Tren Superior A",
      enfoque: "Empuje + tirón",
      ejercicios: [
        { id: "sup-a-press-banca",  nombre: "Press de banca (barra o mancuernas)", series: 4, reps: "6-8",   descanso: "2-3 min" },
        { id: "sup-a-remo-barra",   nombre: "Remo con barra",                  series: 4, reps: "8-10",     descanso: "2 min" },
        { id: "sup-a-press-militar",nombre: "Press militar (de pie o sentado)",series: 3, reps: "8-10",     descanso: "90 s" },
        { id: "sup-a-jalon",        nombre: "Jalón al pecho",                  series: 3, reps: "10-12",    descanso: "90 s" },
        { id: "sup-a-laterales",    nombre: "Elevaciones laterales",           series: 3, reps: "12-15",    descanso: "60 s" },
        { id: "sup-a-curl",         nombre: "Curl con barra",                  series: 3, reps: "10-12",    descanso: "60 s", nota: "Superserie con el siguiente" },
        { id: "sup-a-extension",    nombre: "Extensión de tríceps en polea",   series: 3, reps: "10-12",    descanso: "60 s", nota: "Superserie con el anterior" },
      ],
    },
    {
      id: "inf-b",
      nombre: "Tren Inferior B",
      enfoque: "Cadena posterior + glúteo",
      ejercicios: [
        { id: "inf-b-hip-thrust",      nombre: "Hip thrust con barra",            series: 4, reps: "8-10",   descanso: "2 min" },
        { id: "inf-b-bulgara",         nombre: "Sentadilla búlgara (mancuernas)", series: 3, reps: "10 /pierna", descanso: "90 s" },
        { id: "inf-b-curl-sent",       nombre: "Curl femoral sentado",            series: 3, reps: "10-12",  descanso: "75 s" },
        { id: "inf-b-extension-cuad",  nombre: "Extensión de cuádriceps",         series: 3, reps: "12-15",  descanso: "75 s" },
        { id: "inf-b-gemelos-sent",    nombre: "Elevación de gemelos sentado",    series: 4, reps: "15-20",  descanso: "45 s" },
        { id: "inf-b-piernas-colgado", nombre: "Elevación de piernas colgado",    series: 3, reps: "12-15",  descanso: "60 s" },
      ],
    },
    {
      id: "sup-b",
      nombre: "Tren Superior B",
      enfoque: "Variación de ángulos",
      ejercicios: [
        { id: "sup-b-press-inclinado", nombre: "Press inclinado con mancuernas",        series: 4, reps: "8-10",  descanso: "2 min" },
        { id: "sup-b-dominadas",       nombre: "Dominadas (asistidas) o jalón neutro",  series: 4, reps: "6-10",  descanso: "2 min" },
        { id: "sup-b-press-hombro",    nombre: "Press de hombro con mancuernas",        series: 3, reps: "10-12", descanso: "90 s" },
        { id: "sup-b-remo-polea",      nombre: "Remo en polea sentado",                 series: 3, reps: "10-12", descanso: "90 s" },
        { id: "sup-b-face-pull",       nombre: "Face pull",                             series: 3, reps: "15",    descanso: "60 s" },
        { id: "sup-b-curl-martillo",   nombre: "Curl martillo",                         series: 3, reps: "10-12", descanso: "60 s", nota: "Superserie con el siguiente" },
        { id: "sup-b-fondos",          nombre: "Fondos en banco",                       series: 3, reps: "10-12", descanso: "60 s", nota: "Superserie con el anterior" },
      ],
    },
  ];

  // Fases del plan. "hasta" = número de día entrenado en que termina cada fase.
const FASES = [
  { id: "reincorporacion", nombre: "Reincorporación", hasta: 12 },
  { id: "principal",       nombre: "Bloque principal", hasta: 32 },
  { id: "intensificacion", nombre: "Intensificación",  hasta: Infinity },
];

// Cómo ajusta cada fase el plan base (que equivale a "Bloque principal").
// dSeries: series a sumar/restar.  dReps: desplazamiento del rango de reps.
const MODIFICADORES = {
  reincorporacion: { dSeries: -1, dReps: 2 },   // menos volumen y reps algo más altas (más suave)
  principal:       { dSeries: 0,  dReps: 0 },   // el plan tal cual
  intensificacion: { dSeries: 0,  dReps: -2 },  // reps más bajas = más peso
};