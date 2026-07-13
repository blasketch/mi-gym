// Gráfica SVG inline. Ligera, sin dependencias, offline-friendly.

export function graficaSVG(puntos, unidad) {
  if (puntos.length < 2) return `<div class="grafica-vacia">Necesitas al menos 2 registros para ver la gráfica</div>`;
  const W = 300, H = 120, pad = 24;
  const vals = puntos.map((p) => p.valor);
  let min = Math.min(...vals), max = Math.max(...vals);
  if (min === max) { min -= 1; max += 1; }
  const x = (i) => pad + (i / (puntos.length - 1)) * (W - pad * 2);
  const y = (v) => H - pad - ((v - min) / (max - min)) * (H - pad * 2);
  const pts = puntos.map((p, i) => `${x(i).toFixed(1)},${y(p.valor).toFixed(1)}`);
  const linea = pts.join(" ");
  const area = pts.join(" ") + ` ${x(puntos.length - 1).toFixed(1)},${H - pad} ${x(0).toFixed(1)},${H - pad}`;
  const dots = puntos.map((p, i) =>
    `<circle cx="${x(i).toFixed(1)}" cy="${y(p.valor).toFixed(1)}" r="4" fill="#f97316" stroke="#0a0a0f" stroke-width="2"/>
     <circle cx="${x(i).toFixed(1)}" cy="${y(p.valor).toFixed(1)}" r="7" fill="none" stroke="#f97316" stroke-opacity="0.2"/>`
  ).join("");
  return `
    <svg viewBox="0 0 ${W} ${H}" class="grafica">
      <defs>
        <linearGradient id="area-grad-${puntos.length}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#f97316" stop-opacity="0.25"/>
          <stop offset="100%" stop-color="#f97316" stop-opacity="0.02"/>
        </linearGradient>
      </defs>
      <line x1="${pad}" y1="${pad}" x2="${W - pad}" y2="${pad}" stroke="#1e1e2e" stroke-width="1"/>
      <line x1="${pad}" y1="${pad + (H - pad * 2) / 2}" x2="${W - pad}" y2="${pad + (H - pad * 2) / 2}" stroke="#1e1e2e" stroke-width="1"/>
      <polygon points="${area}" fill="url(#area-grad-${puntos.length})"/>
      <polyline points="${linea}" fill="none" stroke="#f97316" stroke-width="2.5" stroke-linejoin="round"/>
      ${dots}
      <text x="${pad}" y="12" fill="#94a3b8" font-size="10" font-weight="600">${max}</text>
      <text x="${pad}" y="${H - 4}" fill="#94a3b8" font-size="10" font-weight="600">${min}</text>
    </svg>`;
}
