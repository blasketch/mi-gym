// Gráficas con Chart.js. Se montan en <canvas data-puntos> que aparecen
// en el HTML. Tras el render, llamar a montarGraficas(root).
// Las instancias se registran para poder destruirlas y recrearlas
// al cambiar de tema (limpio/oscuro/auto).

import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Filler,
  Tooltip,
} from "chart.js";

Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Filler, Tooltip);

const charts = new WeakMap();

function cssVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function temaColors() {
  const dark = (() => {
    if (document.documentElement.dataset.tema === "claro") return false;
    if (document.documentElement.dataset.tema === "oscuro") return true;
    return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? true;
  })();
  return {
    text: dark ? "#f1f5f9" : "#1a1a1f",
    muted: dark ? "#94a3b8" : "#6b7280",
    grid: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
    accent: "#f97316",
    accent2: "#ef4444",
  };
}

function buildConfig(puntos, unidad) {
  const c = temaColors();
  const labels = puntos.map((p) => p.fecha.slice(5));
  const data = puntos.map((p) => p.valor);

  // Gradiente vertical bajo la línea
  const gradient = (ctx) => {
    const { chart } = ctx;
    const { ctx: c2d, chartArea } = chart;
    if (!chartArea) return "rgba(249,115,22,0.12)";
    const g = c2d.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
    g.addColorStop(0, "rgba(249,115,22,0.35)");
    g.addColorStop(1, "rgba(249,115,22,0.0)");
    return g;
  };

  return {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: unidad,
        data,
        borderColor: c.accent,
        borderWidth: 2.5,
        backgroundColor: gradient,
        fill: true,
        tension: 0.35,
        pointBackgroundColor: c.accent,
        pointBorderColor: "transparent",
        pointRadius: 3,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: c.accent,
        pointHoverBorderWidth: 2,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 600, easing: "easeOutCubic" },
      interaction: { mode: "index", intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "rgba(10,10,15,0.95)",
          titleColor: c.text,
          bodyColor: c.text,
          borderColor: c.accent,
          borderWidth: 1,
          padding: 10,
          cornerRadius: 8,
          displayColors: false,
          callbacks: {
            title: (items) => puntos[items[0].dataIndex].fecha,
            label: (item) => ` ${item.parsed.y} ${unidad}`,
          },
        },
      },
      scales: {
        x: {
          grid: { color: c.grid, drawTicks: false },
          border: { display: false },
          ticks: { color: c.muted, font: { size: 10, weight: "600" }, maxRotation: 0, autoSkip: true, maxTicksLimit: 6 },
        },
        y: {
          grid: { color: c.grid, drawTicks: false },
          border: { display: false },
          ticks: { color: c.muted, font: { size: 10, weight: "600" }, padding: 6 },
          beginAtZero: false,
        },
      },
    },
  };
}

export function graficaHTML(puntos, unidad) {
  if (puntos.length < 2) {
    return `<div class="grafica-vacia">Necesitas al menos 2 registros para ver la gráfica</div>`;
  }
  return `<div class="grafica-wrap"><canvas data-puntos='${JSON.stringify(puntos)}' data-unidad="${unidad}"></canvas></div>`;
}

export function montarGraficas(root) {
  if (!root) return;
  const canvases = root.querySelectorAll("canvas[data-puntos]");
  canvases.forEach((canvas) => {
    destruir(canvas);
    const puntos = JSON.parse(canvas.dataset.puntos);
    const unidad = canvas.dataset.unidad;
    const chart = new Chart(canvas, buildConfig(puntos, unidad));
    charts.set(canvas, chart);
  });
}

export function destruirGraficas(root) {
  if (!root) return;
  root.querySelectorAll("canvas[data-puntos]").forEach(destruir);
}

export function refrescarGraficas() {
  // Re-monta todas las gráficas visibles (al cambiar tema, por ejemplo).
  document.querySelectorAll("canvas[data-puntos]").forEach((canvas) => {
    destruir(canvas);
    const puntos = JSON.parse(canvas.dataset.puntos);
    const unidad = canvas.dataset.unidad;
    const chart = new Chart(canvas, buildConfig(puntos, unidad));
    charts.set(canvas, chart);
  });
}

function destruir(canvas) {
  const c = charts.get(canvas);
  if (c) { c.destroy(); charts.delete(canvas); }
}
