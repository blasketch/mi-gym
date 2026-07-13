// Vista de Ajustes: tema, datos, info.

import { STORAGE, storageGet, storageSet, storageDel } from "../lib/storage.js";
import { HABITOS } from "../data/habitos.js";
import { FASES, MODIFICADORES } from "../data/rutinas.js";
import { exportarDatos, clickImportar } from "../lib/export-import.js";
import { ocultarDescanso } from "../lib/temporizador.js";

import { crearTabbar } from "../components/tabbar.js";
import { renderInicio } from "./inicio.js";
import { renderHistorial } from "./historial.js";

const VERSION = "0.3.0";

function getTema() {
  return storageGet(STORAGE.TEMA) || "auto";
}

function aplicarTema(tema) {
  const root = document.documentElement;
  if (tema === "claro") {
    root.dataset.tema = "claro";
  } else if (tema === "oscuro") {
    root.dataset.tema = "oscuro";
  } else {
    delete root.dataset.tema; // auto → usar @media
  }
}

export function renderAjustes(app) {
  ocultarDescanso();

  const tema = getTema();
  const totalDias = (() => {
    const set = new Set();
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(STORAGE.LOG)) {
        (storageGet(k) || []).forEach((s) => s.fecha && set.add(s.fecha));
      }
    }
    return set.size;
  })();

  const html = `
    <header class="cabecera">
      <div>
        <h1>Ajustes</h1>
        <p class="sub">Personaliza la app y tus datos</p>
      </div>
    </header>

    <section class="ajuste-grupo">
      <div class="ajuste-titulo">Apariencia</div>
      <div class="ajuste-card">
        <div class="tema-opciones">
          <button class="tema-btn ${tema === "auto" ? "on" : ""}" data-tema="auto">
            <span class="tema-ico">🌓</span>
            <span>Auto</span>
          </button>
          <button class="tema-btn ${tema === "oscuro" ? "on" : ""}" data-tema="oscuro">
            <span class="tema-ico">🌙</span>
            <span>Oscuro</span>
          </button>
          <button class="tema-btn ${tema === "claro" ? "on" : ""}" data-tema="claro">
            <span class="tema-ico">☀️</span>
            <span>Claro</span>
          </button>
        </div>
      </div>
    </section>

    <section class="ajuste-grupo">
      <div class="ajuste-titulo">Datos</div>
      <div class="ajuste-card ajuste-fila">
        <span class="ajuste-label">Días entrenados</span>
        <span class="ajuste-valor">${totalDias}</span>
      </div>
      <div class="ajuste-card ajuste-fila-stack">
        <button class="ajuste-btn primario" id="btn-exportar">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Exportar backup
        </button>
        <button class="ajuste-btn" id="btn-importar">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          Importar backup
        </button>
        <button class="ajuste-btn peligro" id="btn-borrar-todo">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          Borrar todos los datos
        </button>
      </div>
    </section>

    <section class="ajuste-grupo">
      <div class="ajuste-titulo">Hábitos</div>
      <div class="ajuste-card">
        ${HABITOS.map((h) => `
          <div class="ajuste-fila">
            <span class="ajuste-label">${h.nombre}</span>
            <span class="ajuste-valor">${h.objetivo ? "objetivo: " + h.objetivo.toLocaleString("es-ES") : "check"}</span>
          </div>
        `).join("")}
      </div>
    </section>

    <section class="ajuste-grupo">
      <div class="ajuste-titulo">Fases del plan</div>
      <div class="ajuste-card">
        ${FASES.map((f, i) => `
          <div class="ajuste-fila">
            <span class="ajuste-label">${f.nombre}</span>
            <span class="ajuste-valor">${isFinite(f.hasta) ? `hasta día ${f.hasta}` : "indefinida"}</span>
          </div>
        `).join("")}
      </div>
    </section>

    <section class="ajuste-grupo">
      <div class="ajuste-titulo">Acerca de</div>
      <div class="ajuste-card ajuste-fila-stack">
        <div class="ajuste-fila">
          <span class="ajuste-label">Mi Gym</span>
          <span class="ajuste-valor">v${VERSION}</span>
        </div>
        <div class="ajuste-fila">
          <span class="ajuste-label">Tecnología</span>
          <span class="ajuste-valor">PWA · Vite</span>
        </div>
      </div>
    </section>

    <div class="tabbar-spacer"></div>
  `;

  app.innerHTML = html;

  crearTabbar(app, "ajustes", (destino) => {
    if (destino === "inicio") renderInicio(app);
    else if (destino === "historial") renderHistorial(app);
  });

  // Tema
  document.querySelectorAll(".tema-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const t = btn.dataset.tema;
      storageSet(STORAGE.TEMA, t);
      aplicarTema(t);
      document.querySelectorAll(".tema-btn").forEach((b) => b.classList.toggle("on", b.dataset.tema === t));
    });
  });

  // Datos
  document.getElementById("btn-exportar").addEventListener("click", exportarDatos);
  document.getElementById("btn-importar").addEventListener("click", () => clickImportar(() => renderInicio(app)));
  document.getElementById("btn-borrar-todo").addEventListener("click", () => {
    if (!confirm("¿Borrar TODOS los datos de Mi Gym? Esta acción no se puede deshacer.\n\nRecomendamos hacer un backup antes.")) return;
    if (!confirm("¿Seguro? Se perderán entrenamientos, hábitos, peso corporal y PRs.")) return;
    const claves = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith("mig-")) claves.push(k);
    }
    claves.forEach((k) => storageDel(k));
    renderInicio(app);
  });

  // Aplicar tema persistido
  aplicarTema(tema);
}
