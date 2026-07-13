// Lógica de series, descansos, ajustes por fase y sugerencias.

import { guardarSet as _guardarSet, borrarSet as _borrarSet, getUltimaSesionPrevia } from "./storage.js";

// "90 s" -> 90 | "2 min" -> 120 | "2-3 min" -> 120
export function parseDescanso(texto) {
  const num = parseInt(texto, 10);
  if (isNaN(num)) return 60;
  return String(texto).includes("min") ? num * 60 : num;
}

export function resumenSeries(sesion) {
  return sesion.series
    .filter(Boolean)
    .map((s) => {
      const r = s.reps != null ? s.reps : "-";
      return s.peso != null ? `${s.peso}×${r}` : `${r} reps`;
    })
    .join(", ");
}

// Ajusta un rango de reps según la fase ("6-8" + 2 -> "8-10")
export function ajustarReps(repsStr, delta) {
  const rango = String(repsStr).match(/^(\d+)\s*-\s*(\d+)(.*)$/);
  if (rango) {
    const lo = Math.max(1, parseInt(rango[1], 10) + delta);
    const hi = Math.max(lo, parseInt(rango[2], 10) + delta);
    return `${lo}-${hi}${rango[3]}`;
  }
  const simple = String(repsStr).match(/^(\d+)(.*)$/);
  if (simple) {
    const n = Math.max(1, parseInt(simple[1], 10) + delta);
    return `${n}${simple[2]}`;
  }
  return repsStr;
}

// Tope de reps de un rango (para saber cuándo subir peso)
export function topReps(repsStr) {
  const rango = String(repsStr).match(/^(\d+)\s*-\s*(\d+)/);
  if (rango) return parseInt(rango[2], 10);
  const simple = String(repsStr).match(/^(\d+)/);
  if (simple) return parseInt(simple[1], 10);
  return null;
}

// Sugerencia de subir peso si la última vez completaste el tope en todas las series
export function sugerencia(ej, series, top) {
  if (top == null) return null;
  const previa = getUltimaSesionPrevia(ej.id);
  if (!previa) return null;
  const sets = previa.series.filter(Boolean);
  if (sets.length < series) return null;
  const todasAlTope = sets.every((s) => s.reps != null && s.reps >= top);
  if (!todasAlTope) return null;
  const pesos = sets.map((s) => s.peso).filter((p) => p != null);
  if (pesos.length) return `Subir peso: prueba ${Math.max(...pesos) + 2.5} kg`;
  return `Subir intensidad: añade repeticiones o lastre`;
}

// Re-exports por conveniencia
export const guardarSet = _guardarSet;
export const borrarSet = _borrarSet;
