// Datos de progreso por ejercicio y peso corporal.

import { STORAGE, storageGet, storageSet } from "./storage.js";
import { hoyISO } from "./date.js";

export function puntosEjercicio(ejId) {
  const sesiones = storageGet(STORAGE.LOG + ejId) || [];
  let hayPeso = false;
  sesiones.forEach((s) => s.series.filter(Boolean).forEach((x) => { if (x.peso != null) hayPeso = true; }));
  const puntos = [];
  sesiones.forEach((s) => {
    const sets = s.series.filter(Boolean);
    if (hayPeso) {
      const pesos = sets.map((x) => x.peso).filter((p) => p != null);
      if (pesos.length) puntos.push({ fecha: s.fecha, valor: Math.max(...pesos) });
    } else {
      const reps = sets.map((x) => x.reps).filter((r) => r != null);
      if (reps.length) puntos.push({ fecha: s.fecha, valor: Math.max(...reps) });
    }
  });
  return { puntos, unidad: hayPeso ? "kg" : "reps" };
}

export function prEjercicio(ejId) {
  const sets = [];
  (storageGet(STORAGE.LOG + ejId) || []).forEach((s) => s.series.filter(Boolean).forEach((x) => sets.push(x)));
  const conPeso = sets.filter((x) => x.peso != null);
  if (conPeso.length) {
    const maxPeso = Math.max(...conPeso.map((x) => x.peso));
    const reps = Math.max(...conPeso.filter((x) => x.peso === maxPeso).map((x) => x.reps ?? 0));
    return { peso: maxPeso, reps: reps || null };
  }
  const conReps = sets.filter((x) => x.reps != null);
  if (conReps.length) return { reps: Math.max(...conReps.map((x) => x.reps)) };
  return null;
}

// ---------- Peso corporal ----------
export function getPesoCorporal() {
  return storageGet(STORAGE.PESO_CORP) || [];
}

export function guardarPesoCorporal(peso) {
  const arr = getPesoCorporal();
  const idx = arr.findIndex((r) => r.fecha === hoyISO());
  if (idx >= 0) arr[idx].peso = peso;
  else arr.push({ fecha: hoyISO(), peso });
  arr.sort((a, b) => a.fecha.localeCompare(b.fecha));
  storageSet(STORAGE.PESO_CORP, arr);
}
