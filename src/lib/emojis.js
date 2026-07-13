// Emojis de ejercicios y días. Se centralizan aquí para reutilizarlos.

export function ejercicioEmoji(nombre) {
  const n = nombre.toLowerCase();
  if (n.includes('curl') || n.includes('extensión') || n.includes('elevación') || n.includes('face pull') || n.includes('laterales') || n.includes('martillo')) return '🔥';
  if (n.includes('plancha') || n.includes('piernas') || n.includes('rueda')) return '⚡';
  if (n.includes('sentadilla') || n.includes('press') || n.includes('peso muerto') || n.includes('remo') || n.includes('dominadas') || n.includes('hip thrust') || n.includes('jalón') || n.includes('prensa') || n.includes('fondos') || n.includes('banca')) return '🏋️';
  if (n.includes('cardio') || n.includes('pasos')) return '🚶';
  return '💪';
}

export function diaEmoji(id) {
  return id.startsWith('inf') ? '🦵' : '💪';
}
