// Vista de inicio: cabecera, stats, fase, constancia (hábitos) y tarjetas de días.

import { RUTINAS } from "../data/rutinas.js";
import { HABITOS } from "../data/habitos.js";
import { hoyISO } from "../lib/date.js";
import { getDiasEntrenados, getDiasEstaSemana, getRachaSemanas, faseActual, siguienteFaseNombre } from "../lib/fechas.js";
import { ocultarDescanso } from "../lib/temporizador.js";
import { toggleHabito, rachaHabitos, textoRachaHab, getHabitoValor, setHabitoValor } from "../lib/habitos.js";
import { diaEmoji } from "../lib/emojis.js";
import { exportarDatos, clickImportar } from "../lib/export-import.js";

import { renderDia } from "./dia.js";
import { renderProgreso } from "./progreso.js";
import { crearTabbar } from "../components/tabbar.js";
import { renderHistorial } from "./historial.js";
import { renderAjustes } from "./ajustes.js";

function panelConstanciaHTML() {
  const hoy = hoyISO();
  const marcados = JSON.parse(localStorage.getItem("mig-habitos-" + hoy) || "[]");

  const sinObjetivo = HABITOS.filter((h) => h.objetivo == null);
  const conObjetivo = HABITOS.filter((h) => h.objetivo != null);

  const chips = sinObjetivo.map((h) =>
    `<button class="habito ${marcados.includes(h.id) ? "on" : ""}" data-hab="${h.id}">${h.nombre}</button>`
  ).join("");

  const iconos = { pasos: "🚶", lectura: "📖", estudio: "📚" };
  const metricas = conObjetivo.map((h) => {
    const v = getHabitoValor(hoy, h.id) ?? 0;
    const pct = Math.min(100, Math.round((v / h.objetivo) * 100));
    const icono = iconos[h.id] || "📊";
    return `
      <div class="habito-metrica" data-hab="${h.id}">
        <div class="habito-metrica-top">
          <span class="habito-metrica-nombre">${icono} ${h.nombre}</span>
          <span class="habito-metrica-fraccion">
            <input type="number" inputmode="numeric" min="0" step="1" value="${v || ""}" data-hab-val="${h.id}" placeholder="0" aria-label="${h.nombre}">
            <span class="habito-metrica-de">/ ${h.objetivo.toLocaleString("es-ES")}</span>
          </span>
        </div>
        <div class="habito-metrica-barra">
          <div class="habito-metrica-fill" style="width:${pct}%"></div>
          <span class="habito-metrica-pct">${pct}%</span>
        </div>
      </div>
    `;
  }).join("");

  return `
    <div class="constancia-top">
      <span>Constancia de hoy</span>
      <span class="racha-hab" id="racha-hab">${textoRachaHab(rachaHabitos())}</span>
    </div>
    ${sinObjetivo.length ? `<div class="habitos">${chips}</div>` : ""}
    ${conObjetivo.length ? `<div class="habitos-metricas">${metricas}</div>` : ""}
  `;
}

function bindConstancia(panel) {
  panel.querySelectorAll(".habito").forEach((btn) => {
    btn.addEventListener("click", () => {
      toggleHabito(hoyISO(), btn.dataset.hab);
      btn.classList.toggle("on");
      const r = document.getElementById("racha-hab");
      if (r) r.textContent = textoRachaHab(rachaHabitos());
    });
  });
  panel.querySelectorAll("[data-hab-val]").forEach((inp) => {
    inp.addEventListener("change", () => {
      const v = inp.value === "" ? null : Number(inp.value);
      setHabitoValor(hoyISO(), inp.dataset.habVal, v);
      panel.innerHTML = panelConstanciaHTML();
      bindConstancia(panel);
    });
  });
}

export function renderInicio(app) {
  ocultarDescanso();

  const total = getDiasEntrenados().length;
  const racha = getRachaSemanas();
  const semana = getDiasEstaSemana();
  const fase = faseActual(total);

  let faseHTML;
  if (isFinite(fase.total) && fase.total > 0) {
    const pct = Math.min(100, Math.round((fase.diasEnFase / fase.total) * 100));
    const faltan = fase.total - fase.diasEnFase;
    const sig = siguienteFaseNombre(fase.id);
    faseHTML = `
      <div class="fase">
        <div class="fase-top"><span>Fase: ${fase.nombre}</span><span>${fase.diasEnFase}/${fase.total}</span></div>
        <div class="barra"><div class="barra-fill" style="width:${pct}%"></div></div>
        <div class="fase-sub">${faltan} días para ${sig || "fase final"}</div>
      </div>`;
  } else {
    faseHTML = `
      <div class="fase">
        <div class="fase-top"><span>Fase: ${fase.nombre}</span><span>fase final</span></div>
        <div class="barra"><div class="barra-fill" style="width:100%"></div></div>
      </div>`;
  }

  let html = `
    <header class="cabecera">
      <div class="cabecera-logo">
        <svg viewBox="0 0 64 64" width="28" height="28" aria-hidden="true">
          <defs>
            <linearGradient id="lg" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stop-color="#f97316"/>
              <stop offset="100%" stop-color="#ef4444"/>
            </linearGradient>
          </defs>
          <rect x="-20" y="-2" width="40" height="4" rx="2" fill="url(#lg)"/>
          <rect x="-24" y="-10" width="5" height="20" rx="1.5" fill="url(#lg)"/>
          <rect x="-18" y="-7" width="3" height="14" rx="1" fill="url(#lg)" opacity="0.85"/>
          <rect x="19" y="-10" width="5" height="20" rx="1.5" fill="url(#lg)"/>
          <rect x="15" y="-7" width="3" height="14" rx="1" fill="url(#lg)" opacity="0.85"/>
        </svg>
      </div>
      <div>
        <h1>Mi Gym</h1>
        <p class="sub">Elige el entrenamiento de hoy</p>
      </div>
      <button class="btn-icon" id="btn-importar" title="Importar datos" aria-label="Importar datos">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
      </button>
      <button class="btn-icon" id="btn-exportar" title="Exportar datos" aria-label="Exportar datos">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
      </button>
      <button class="btn-progreso" id="btn-progreso">Progreso</button>
    </header>
    <div class="panel fade-in">
      <div class="stats">
        <div class="stat"><div class="stat-num">${total}</div><div class="stat-lbl">días entrenados</div></div>
        <div class="stat"><div class="stat-num">${racha}</div><div class="stat-lbl">sem. seguidas</div></div>
        <div class="stat"><div class="stat-num">${semana}</div><div class="stat-lbl">esta semana</div></div>
      </div>
      ${faseHTML}
    </div>
    <div class="panel" id="panel-constancia">
      ${panelConstanciaHTML()}
    </div>
  `;

  RUTINAS.forEach((dia, i) => {
    html += `
      <button class="dia-card fade-in-d${(i % 4) + 1}" data-dia="${dia.id}">
        <div class="nombre">${diaEmoji(dia.id)} ${dia.nombre}</div>
        <div class="enfoque">${dia.enfoque}</div>
        <div class="cuenta">${dia.ejercicios.length} ejercicios</div>
      </button>
    `;
  });

  html += `<div class="tabbar-spacer"></div>`;

  app.innerHTML = html;

  crearTabbar(app, "inicio", (destino) => {
    if (destino === "historial") renderHistorial(app);
    else if (destino === "ajustes") renderAjustes(app);
  });

  document.getElementById("btn-progreso").addEventListener("click", () => renderProgreso(app));
  document.getElementById("btn-exportar").addEventListener("click", exportarDatos);
  document.getElementById("btn-importar").addEventListener("click", () => clickImportar(() => renderInicio(app)));
  document.querySelectorAll(".dia-card").forEach((card) => {
    card.addEventListener("click", () => renderDia(app, card.dataset.dia));
  });
  bindConstancia(document.getElementById("panel-constancia"));
}
