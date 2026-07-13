// Vista de inicio: cabecera, stats, fase, constancia y tarjetas de días.

import { RUTINAS } from "../data/rutinas.js";
import { HABITOS } from "../data/habitos.js";
import { hoyISO } from "../lib/date.js";
import { getDiasEntrenados, getDiasEstaSemana, getRachaSemanas, faseActual, siguienteFaseNombre } from "../lib/fechas.js";
import { cerrarDescanso } from "../lib/temporizador.js";
import { toggleHabito, rachaHabitos, textoRachaHab } from "../lib/habitos.js";
import { diaEmoji } from "../lib/emojis.js";
import { exportarDatos, clickImportar } from "../lib/export-import.js";

import { renderDia } from "./dia.js";
import { renderProgreso } from "./progreso.js";

function htmlConstancia() {
  const marcados = (() => {
    try {
      const k = "mig-habitos-" + hoyISO();
      return JSON.parse(localStorage.getItem(k)) || [];
    } catch { return []; }
  })();
  const chips = HABITOS.map((h) =>
    `<button class="habito ${marcados.includes(h.id) ? "on" : ""}" data-hab="${h.id}">${h.nombre}</button>`
  ).join("");
  return `
    <div class="panel">
      <div class="constancia-top">
        <span>Constancia de hoy</span>
        <span class="racha-hab" id="racha-hab">${textoRachaHab(rachaHabitos())}</span>
      </div>
      <div class="habitos">${chips}</div>
    </div>
  `;
}

export function renderInicio(app) {
  cerrarDescanso();

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
      <div class="cabecera-logo">🏋️</div>
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
    ${htmlConstancia()}
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

  app.innerHTML = html;
  document.getElementById("btn-progreso").addEventListener("click", () => renderProgreso(app));
  document.getElementById("btn-exportar").addEventListener("click", exportarDatos);
  document.getElementById("btn-importar").addEventListener("click", () => clickImportar(() => renderInicio(app)));
  document.querySelectorAll(".dia-card").forEach((card) => {
    card.addEventListener("click", () => renderDia(app, card.dataset.dia));
  });
  document.querySelectorAll(".habito").forEach((btn) => {
    btn.addEventListener("click", () => {
      toggleHabito(hoyISO(), btn.dataset.hab);
      btn.classList.toggle("on");
      const r = document.getElementById("racha-hab");
      if (r) r.textContent = textoRachaHab(rachaHabitos());
    });
  });
}
