// Anillo de progreso circular (SVG).
// Uso: anilloProgreso({ pct: 0..100, size: 36, stroke: 4, label: "75%" })
// Devuelve un string SVG. El porcentaje se muestra dentro como texto.

export function anilloProgreso({ pct = 0, size = 40, stroke = 4, label = null, color = "url(#anillo-grad)" } = {}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - Math.max(0, Math.min(100, pct)) / 100);
  const gradId = "anillo-grad-" + Math.random().toString(36).slice(2, 7);
  return `
    <svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" class="anillo" aria-label="${label || pct + '%'}">
      <defs>
        <linearGradient id="${gradId}" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#f97316"/>
          <stop offset="100%" stop-color="#ef4444"/>
        </linearGradient>
      </defs>
      <circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="currentColor" stroke-opacity="0.12" stroke-width="${stroke}"/>
      <circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="url(#${gradId})" stroke-width="${stroke}"
        stroke-dasharray="${c.toFixed(2)}" stroke-dashoffset="${offset.toFixed(2)}"
        stroke-linecap="round" transform="rotate(-90 ${size/2} ${size/2})"
        style="transition:stroke-dashoffset .7s cubic-bezier(.16,1,.3,1)"/>
      ${label != null ? `<text x="${size/2}" y="${size/2 + 1}" text-anchor="middle" dominant-baseline="central"
        font-size="${Math.max(8, size/4.5)}" font-weight="700" fill="currentColor" font-family="Inter, system-ui, sans-serif">${label}</text>` : ""}
    </svg>
  `;
}
