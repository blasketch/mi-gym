// Set de iconos SVG coherente y reutilizable.
// Estilo: stroke 2px, redondeado, mismo viewBox 24x24.
// Tamaño por defecto: 20px. Se puede sobreescribir con el parámetro size.
//
// Uso: icono("pesa", 22) → string SVG lista para meter en innerHTML.

const I = (path, fill = "none") =>
  `<svg viewBox="0 0 24 24" width="100%" height="100%" fill="${fill}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}</svg>`;

const ICONS = {
  // Logo principal: pesa de barra (coincide con el icono de la app)
  pesa: `<path d="M6 7v10"/><path d="M18 7v10"/><path d="M3 9v6"/><path d="M21 9v6"/><path d="M6 12h12"/><path d="M3 12h3"/><path d="M18 12h3"/>`,
  // Pierna (inf)
  pierna: `<path d="M9 4a3 3 0 1 1 6 0v6"/><path d="M12 10c-2 2-2 6 0 10"/><path d="M9 14h6"/><path d="M12 20l-2 2"/><path d="M12 20l2 2"/>`,
  // Brazo/fuerza (sup)
  brazo: `<path d="M14 4a3 3 0 1 0-3 5"/><path d="M11 9v6"/><path d="M11 15c-2 0-3 1-3 3v3"/><path d="M11 15l3-2 4-1 2-3-2-1-3 2-4 1z"/>`,
  // Trofeo (PR)
  trofeo: `<path d="M8 21h8"/><path d="M12 17v4"/><path d="M7 4h10v5a5 5 0 0 1-10 0V4z"/><path d="M17 6h3a2 2 0 0 1-2 3"/><path d="M7 6H4a2 2 0 0 0 2 3"/>`,
  // Llama (racha)
  llama: `<path d="M12 2c1 3 4 4 4 8a4 4 0 0 1-8 0c0-2 1-3 2-4-1 1-1 3 1 4 0-2-1-4 1-8z"/><path d="M12 22a4 4 0 0 0 4-4c0-2-2-3-2-5a3 3 0 0 1-4 3 4 4 0 0 0 2 6z"/>`,
  // Cronómetro (timer)
  cronometro: `<circle cx="12" cy="14" r="8"/><path d="M12 10v4l2 2"/><path d="M9 2h6"/><path d="M12 2v3"/><path d="M19 5l-2 2"/>`,
  // Check circular (hecho)
  check: `<circle cx="12" cy="12" r="10"/><path d="M8 12l3 3 5-6"/>`,
  // Bombilla (nota)
  bombilla: `<path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2a6 6 0 0 0-4 10c1 1 2 2 2 4h4c0-2 1-3 2-4a6 6 0 0 0-4-10z"/>`,
  // Flecha arriba (sugerencia subir peso)
  flechaArriba: `<path d="M12 19V5"/><path d="M5 12l7-7 7 7"/>`,
  // Caminante (pasos)
  pasos: `<circle cx="13" cy="4" r="2"/><path d="M9 22l2-7-2-3 3-5 4 2 1 4"/><path d="M16 13l-3 1-2 4"/>`,
  // Libro (lectura)
  libro: `<path d="M4 4h7a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H4z"/><path d="M20 4h-7a3 3 0 0 0-3 3v13a2 2 0 0 1 2-2h8z"/>`,
  // Libreta (estudio)
  libreta: `<path d="M4 5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"/><path d="M9 7h6"/><path d="M9 11h6"/><path d="M9 15h4"/>`,
  // Sol (claro)
  sol: `<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="M4 12H2"/><path d="M22 12h-2"/><path d="M5 5l1.5 1.5"/><path d="M17.5 17.5L19 19"/><path d="M5 19l1.5-1.5"/><path d="M17.5 6.5L19 5"/>`,
  // Luna (oscuro)
  luna: `<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>`,
  // Círculo medio (auto)
  circuloMedio: `<circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 0 0 18z" fill="currentColor"/>`,
  // Descarga (exportar)
  descargar: `<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/>`,
  // Subida (importar)
  subir: `<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M17 8l-5-5-5 5"/><path d="M12 3v12"/>`,
  // Papelera (borrar)
  papelera: `<path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M10 11v6"/><path d="M14 11v6"/>`,
  // Calendario
  calendario: `<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/>`,
  // Gráfica
  grafica: `<path d="M3 3v18h18"/><path d="M7 15l4-4 3 3 5-6"/>`,
  // Inicio (casa)
  casa: `<path d="M3 12L12 3l9 9"/><path d="M5 10v10h14V10"/>`,
  // Ajustes (engranaje)
  engranaje: `<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>`,
  // Reloj (historial)
  reloj: `<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>`,
  // Plus
  plus: `<path d="M12 5v14"/><path d="M5 12h14"/>`,
  // Check simple
  checkSimple: `<path d="M5 12l5 5 9-11"/>`,
  // X (cerrar)
  x: `<path d="M18 6L6 18"/><path d="M6 6l12 12"/>`,
  // Flecha izquierda
  flechaIzquierda: `<path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/>`,
  // Estrella
  estrella: `<path d="M12 2l3 7h7l-6 4 2 7-6-4-6 4 2-7-6-4h7z"/>`,
  // Foco (para empty states)
  foco: `<circle cx="12" cy="12" r="3"/><path d="M12 3v3"/><path d="M12 18v3"/><path d="M3 12h3"/><path d="M18 12h3"/>`,
  // Maza (empty state progresivo)
  pesaVacia: `<path d="M6 7v10"/><path d="M18 7v10"/><path d="M3 9v6"/><path d="M21 9v6"/><path d="M6 12h12"/><path d="M3 12h3"/><path d="M18 12h3"/>`,
};

/**
 * Devuelve un string SVG con el icono pedido.
 * @param {keyof typeof ICONS} name
 * @param {number} [size] - Tamaño en px (afecta width/height del contenedor).
 */
export function icono(name, size = 20) {
  const path = ICONS[name];
  if (!path) return "";
  return `<span class="icono" style="width:${size}px;height:${size}px;display:inline-flex">${I(path)}</span>`;
}

export const ICONOS = ICONS;
