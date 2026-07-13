// Utilidades de fecha sin dependencias. Aquí vive hoyISO() para que
// pueda importarse desde storage.js y fechas.js sin ciclos.

export function hoyISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function fechaCorta(iso) {
  const [, mes, dia] = iso.split("-");
  return `${dia}/${mes}`;
}

export function isoDe(d) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}
