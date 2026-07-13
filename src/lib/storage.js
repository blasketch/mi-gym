// Capa de abstracción sobre localStorage.
// Mantiene el mismo formato de claves (mig-*) para preservar datos.

import { hoyISO } from "./date.js";

export const STORAGE = {
  LOG: "mig-log-",
  PESO_CORP: "mig-peso-corporal",
  HABITOS: "mig-habitos-",
  MIGRADO: "mig-migrado-v2",
};

export function storageGet(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function storageSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

// ---------- Sesiones por ejercicio ----------
export function getSesiones(ejId) {
  return storageGet(STORAGE.LOG + ejId) || [];
}

export function setSesiones(ejId, sesiones) {
  storageSet(STORAGE.LOG + ejId, sesiones);
}

export function getSesionHoy(ejId) {
  return getSesiones(ejId).find((s) => s.fecha === hoyISO()) || null;
}

export function getUltimaSesionPrevia(ejId) {
  const previas = getSesiones(ejId).filter((s) => s.fecha !== hoyISO());
  return previas.length ? previas[previas.length - 1] : null;
}

export function guardarSet(ejId, indice, peso, reps) {
  const sesiones = getSesiones(ejId);
  let hoyS = sesiones.find((s) => s.fecha === hoyISO());
  if (!hoyS) {
    hoyS = { fecha: hoyISO(), series: [] };
    sesiones.push(hoyS);
  }
  hoyS.series[indice] = { peso, reps };
  setSesiones(ejId, sesiones);
}

export function borrarSet(ejId, indice) {
  const sesiones = getSesiones(ejId);
  const idx = sesiones.findIndex((s) => s.fecha === hoyISO());
  if (idx === -1) return;
  sesiones[idx].series.splice(indice, 1);
  if (sesiones[idx].series.length === 0) sesiones.splice(idx, 1);
  setSesiones(ejId, sesiones);
}

// ---------- Migración del formato antiguo (no perder datos) ----------
export function migrar() {
  if (storageGet(STORAGE.MIGRADO)) return;
  const viejas = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith("mig-pesos-")) viejas.push(k);
  }
  viejas.forEach((k) => {
    const id = k.slice("mig-pesos-".length);
    if (storageGet(STORAGE.LOG + id)) return;
    const arr = storageGet(k) || [];
    const sesiones = arr.map((r) => ({ fecha: r.fecha, series: [{ peso: r.peso, reps: r.reps }] }));
    if (sesiones.length) setSesiones(id, sesiones);
  });
  storageSet(STORAGE.MIGRADO, "1");
}
