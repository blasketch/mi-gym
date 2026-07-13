// Hábitos diarios.
// Formato de almacenamiento: `mig-habitos-{fecha}` guarda un array de IDs marcados.
// Para hábitos con `objetivo`, el valor numérico se guarda aparte en
// `mig-habito-valor-{fecha}-{id}`. Esto evita romper la racha de hábitos
// cuando un valor está a 0.

import { STORAGE, storageGet, storageSet, storageDel } from "./storage.js";
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

// ----- Valores numéricos (para hábitos con objetivo) -----
export function getHabitoValor(fecha, habitoId) {
  return storageGet(STORAGE.HABITO_VALOR + fecha + "-" + habitoId) ?? null;
}

export function setHabitoValor(fecha, habitoId, valor) {
  const k = STORAGE.HABITO_VALOR + fecha + "-" + habitoId;
  if (valor == null || valor === "" || isNaN(valor)) {
    storageDel(k);
    return;
  }
  storageSet(k, Number(valor));
  // Si hay un valor, marcamos el hábito automáticamente para que la racha lo cuente.
  const marcados = getHabitosDia(fecha);
  if (!marcados.includes(habitoId)) {
    marcados.push(habitoId);
    storageSet(STORAGE.HABITOS + fecha, marcados);
  }
}

// Devuelve el array de IDs que cuentan como "cumplidos" hoy.
// Es la unión de: marcados explícitamente + los que tienen valor numérico.
export function getHabitosCumplidos(fecha) {
  const marcados = new Set(getHabitosDia(fecha));
  HABITOS.forEach((h) => {
    if (marcados.has(h.id)) return;
    if (h.objetivo != null) {
      const v = getHabitoValor(fecha, h.id);
      if (v != null && v > 0) marcados.add(h.id);
    }
  });
  return [...marcados];
}

export function rachaHabitos() {
  if (!HABITOS.length) return 0;
  const completo = (f) => getHabitosCumplidos(f).length >= HABITOS.length;
  let cursor = new Date(hoyISO() + "T00:00:00");
  if (!completo(isoDe(cursor))) cursor.setDate(cursor.getDate() - 1);
  let racha = 0;
  while (completo(isoDe(cursor))) { racha++; cursor.setDate(cursor.getDate() - 1); }
  return racha;
}

export function textoRachaHab(n) {
  return n > 0 ? `Racha: ${n} ${n === 1 ? "día" : "días"}` : "Empieza tu racha";
}
