// Exportación / Importación de datos (backup).

import { STORAGE, storageGet, storageSet } from "./storage.js";
import { hoyISO } from "./date.js";

export function exportarDatos() {
  const claves = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && (k.startsWith(STORAGE.LOG) || k === STORAGE.PESO_CORP || k.startsWith(STORAGE.HABITOS) || k === STORAGE.MIGRADO)) {
      claves.push(k);
    }
  }
  const datos = { _meta: { version: 2, exportado: hoyISO() } };
  claves.forEach((k) => { datos[k] = storageGet(k); });

  const blob = new Blob([JSON.stringify(datos, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `mi-gym-${hoyISO()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function importarDatos(file, onDone) {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const datos = JSON.parse(e.target.result);
      if (!datos._meta || !datos._meta.version) {
        alert("El archivo no parece un backup válido de Mi Gym.");
        return;
      }
      if (!confirm("Se sobrescribirán los datos actuales. ¿Continuar?")) return;

      Object.keys(datos).forEach((k) => {
        if (k.startsWith("_")) return;
        storageSet(k, datos[k]);
      });
      if (onDone) onDone();
    } catch {
      alert("Error al leer el archivo. Comprueba que es un backup válido.");
    }
  };
  reader.readAsText(file);
}

export function clickImportar(onDone) {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".json";
  input.style.display = "none";
  input.addEventListener("change", () => {
    if (input.files[0]) importarDatos(input.files[0], onDone);
    input.remove();
  });
  document.body.appendChild(input);
  input.click();
}
