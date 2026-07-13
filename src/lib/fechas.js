// Fechas y formato. Mantiene el mismo formato ISO "YYYY-MM-DD" que ya usabas.

import { hoyISO, isoDe } from "./date.js";
import { STORAGE, storageGet } from "./storage.js";
import { FASES } from "../data/rutinas.js";

export function lunesISO(fechaISO) {
  const d = new Date(fechaISO + "T00:00:00");
  const dia = (d.getDay() + 6) % 7; // 0 = lunes
  d.setDate(d.getDate() - dia);
  return isoDe(d);
}

export function getDiasEntrenados() {
  const fechas = new Set();
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith(STORAGE.LOG)) {
      const sesiones = storageGet(k) || [];
      sesiones.forEach((s) => { if (s.fecha) fechas.add(s.fecha); });
    }
  }
  return [...fechas].sort();
}

export function getDiasEstaSemana() {
  const lunes = lunesISO(hoyISO());
  return getDiasEntrenados().filter((f) => lunesISO(f) === lunes).length;
}

export function getRachaSemanas() {
  const dias = getDiasEntrenados();
  if (!dias.length) return 0;
  const semanas = new Set(dias.map(lunesISO));
  let cursor = new Date(lunesISO(hoyISO()) + "T00:00:00");
  if (!semanas.has(isoDe(cursor))) cursor.setDate(cursor.getDate() - 7);
  let racha = 0;
  while (semanas.has(isoDe(cursor))) { racha++; cursor.setDate(cursor.getDate() - 7); }
  return racha;
}

export function faseActual(totalDias) {
  let inicio = 0;
  for (const fase of FASES) {
    if (totalDias <= fase.hasta) {
      return { id: fase.id, nombre: fase.nombre, diasEnFase: totalDias - inicio, total: fase.hasta - inicio };
    }
    inicio = fase.hasta;
  }
  const u = FASES[FASES.length - 1];
  return { id: u.id, nombre: u.nombre, diasEnFase: totalDias - inicio, total: Infinity };
}

export function siguienteFaseNombre(faseId) {
  const idx = FASES.findIndex((f) => f.id === faseId);
  return idx >= 0 && idx < FASES.length - 1 ? FASES[idx + 1].nombre : null;
}

export { hoyISO, isoDe, fechaCorta } from "./date.js";
