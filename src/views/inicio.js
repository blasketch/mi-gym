// Vista de inicio: cabecera, stats, fase, constancia (hábitos) y tarjetas de días.

import { RUTINAS } from "../data/rutinas.js";
import { HABITOS } from "../data/habitos.js";
import { hoyISO } from "../lib/date.js";
import { getDiasEntrenados, getDiasEstaSemana, getRachaSemanas, faseActual, siguienteFaseNombre } from "../lib/fechas.js";
import { ocultarDescanso } from "../lib/temporizador.js";
import { toggleHabito, rachaHabitos, textoRachaHab, getHabitoValor, setHabitoValor } from "../lib/habitos.js";
import { exportarDatos, clickImportar } from "../lib/export-import.js";
import { icono } from "../components/icons.js";
import { countUpNodes } from "../lib/count-up.js";
import { anilloProgreso } from "../components/anillo.js";
import { haptic } from "../lib/haptics.js";
import { lanzarConfetti } from "../components/confetti.js";

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

  const iconosHabito = { pasos: "pasos", lectura: "libro", estudio: "libreta" };
  const metricas = conObjetivo.map((h) => {
    const v = getHabitoValor(hoy, h.id) ?? 0;
    const pct = Math.min(100, Math.round((v / h.objetivo) * 100));
    return `
      <div class="habito-metrica" data-hab="${h.id}">
        <div class="habito-metrica-anillo">${anilloProgreso({ pct, size: 56, stroke: 5, label: pct + "%" })}</div>
        <div class="habito-metrica-info">
          <div class="habito-metrica-top">
            <span class="habito-metrica-nombre">${icono(iconosHabito[h.id] || "foco", 18)} <span>${h.nombre}</span></span>
            <span class="habito-metrica-fraccion">
              <input type="number" inputmode="numeric" min="0" step="1" value="${v || ""}" data-hab-val="${h.id}" placeholder="0" aria-label="${h.nombre}">
              <span class="habito-metrica-de">/ ${h.objetivo.toLocaleString("es-ES")}</span>
            </span>
          </div>
        </div>
      </div>
    `;
  }).join("");

  return `
    <div class="constancia-top">
      <span>Constancia de hoy</span>
      <span class="racha-hab" id="racha-hab">${icono("llama", 14)}<span>${textoRachaHab(rachaHabitos())}</span></span>
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
      haptic(btn.classList.contains("on") ? "light" : "selection");
      const r = document.getElementById("racha-hab");
      if (r) r.lastElementChild.textContent = textoRachaHab(rachaHabitos());
      // 🎉 Si al marcarlo se completan TODOS los hábitos del día, celebramos.
      if (rachaHabitos() > 0 && allComplete()) {
        haptic("success");
        setTimeout(() => lanzarConfetti({ particulas: 90 }), 60);
      }
    });
  });
  panel.querySelectorAll("[data-hab-val]").forEach((inp) => {
    inp.addEventListener("change", () => {
      const v = inp.value === "" ? null : Number(inp.value);
      const eraCompleto = allComplete();
      setHabitoValor(hoyISO(), inp.dataset.habVal, v);
      panel.innerHTML = panelConstanciaHTML();
      bindConstancia(panel);
      haptic("light");
      if (!eraCompleto && allComplete()) {
        haptic("success");
        setTimeout(() => lanzarConfetti({ particulas: 90 }), 60);
      }
    });
  });
}

function allComplete() {
  if (!HABITOS.length) return false;
  const hoy = hoyISO();
  return HABITOS.every((h) => {
    if (h.objetivo == null) {
      return (JSON.parse(localStorage.getItem("mig-habitos-" + hoy) || "[]")).includes(h.id);
    }
    const v = getHabitoValor(hoy, h.id);
    return v != null && v > 0;
  });
}

function diaIcono(diaId) {
  return diaId.startsWith("inf") ? icono("pierna", 22) : icono("brazo", 22);
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
      <button class="btn-icon" id="btn-importar" title="Importar datos" aria-label="Importar datos">${icono("subir", 20)}</button>
      <button class="btn-icon" id="btn-exportar" title="Exportar datos" aria-label="Exportar datos">${icono("descargar", 20)}</button>
      <button class="btn-progreso" id="btn-progreso">Progreso</button>
    </header>
    <div class="panel fade-in">
      <div class="stats">
        <div class="stat"><div class="stat-num" data-count="${total}">0</div><div class="stat-lbl">días entrenados</div></div>
        <div class="stat"><div class="stat-num" data-count="${racha}">0</div><div class="stat-lbl">sem. seguidas</div></div>
        <div class="stat"><div class="stat-num" data-count="${semana}">0</div><div class="stat-lbl">esta semana</div></div>
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
        <div class="nombre">${diaIcono(dia.id)} <span>${dia.nombre}</span></div>
        <div class="enfoque">${dia.enfoque}</div>
        <div class="cuenta">${dia.ejercicios.length} ejercicios</div>
      </button>
    `;
  });

  html += `<div class="tabbar-spacer"></div>`;

  app.innerHTML = html;

  // Anima los números de las stats de 0 al valor real
  countUpNodes(app.querySelectorAll("[data-count]"));

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
