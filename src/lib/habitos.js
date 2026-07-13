// Hábitos diarios.

import { STORAGE, storageGet, storageSet } from "./storage.js";
import { hoyISO, isoDe } from "./date.js";
import { HABITOS } from "../data/habitos.js";

export function getHabitosDia(fecha) {
  return storageGet(STORAGE.HABITOS + fecha) || [];
}

export function toggleHabito(fecha, habitoId) {
  const marcados = getHabitosDia(fecha);
  const i = marcados.indexOf(habitoId);
  if (i >= 0) marcados.splice(i, 1);
  else marcados.push(habitoId);
  storageSet(STORAGE.HABITOS + fecha, marcados);
}

export function rachaHabitos() {
  if (!HABITOS.length) return 0;
  const completo = (f) => getHabitosDia(f).length >= HABITOS.length;
  let cursor = new Date(hoyISO() + "T00:00:00");
  if (!completo(isoDe(cursor))) cursor.setDate(cursor.getDate() - 1);
  let racha = 0;
  while (completo(isoDe(cursor))) { racha++; cursor.setDate(cursor.getDate() - 1); }
  return racha;
}

export function textoRachaHab(n) {
  return n > 0 ? `Racha: ${n} ${n === 1 ? "día" : "días"}` : "Empieza tu racha";
}
