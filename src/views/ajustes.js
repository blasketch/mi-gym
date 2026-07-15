// Vista de Ajustes: tema, datos, info.

import { STORAGE, storageGet, storageSet, storageDel } from "../lib/storage.js";
import { HABITOS } from "../data/habitos.js";
import { FASES, MODIFICADORES } from "../data/rutinas.js";
import { exportarDatos, clickImportar } from "../lib/export-import.js";
import { ocultarDescanso } from "../lib/temporizador.js";
import { refrescarGraficas } from "../lib/grafica.js";
import { icono } from "../components/icons.js";
import { haptic } from "../lib/haptics.js";

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
          <button class="tema-btn ${tema === "auto" ? "on" : ""}" data-tema="auto">${icono("circuloMedio", 22)}<span>Auto</span></button>
          <button class="tema-btn ${tema === "oscuro" ? "on" : ""}" data-tema="oscuro">${icono("luna", 22)}<span>Oscuro</span></button>
          <button class="tema-btn ${tema === "claro" ? "on" : ""}" data-tema="claro">${icono("sol", 22)}<span>Claro</span></button>
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
        <button class="ajuste-btn primario" id="btn-exportar">${icono("descargar", 18)}<span>Exportar backup</span></button>
        <button class="ajuste-btn" id="btn-importar">${icono("subir", 18)}<span>Importar backup</span></button>
        <button class="ajuste-btn peligro" id="btn-borrar-todo">${icono("papelera", 18)}<span>Borrar todos los datos</span></button>
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
      haptic("selection");
      refrescarGraficas();
    });
  });

  // Datos
  document.getElementById("btn-exportar").addEventListener("click", () => { haptic("light"); exportarDatos(); });
  document.getElementById("btn-importar").addEventListener("click", () => { haptic("light"); clickImportar(() => renderInicio(app)); });
  document.getElementById("btn-borrar-todo").addEventListener("click", () => {
    if (!confirm("¿Borrar TODOS los datos de Mi Gym? Esta acción no se puede deshacer.\n\nRecomendamos hacer un backup antes.")) return;
    if (!confirm("¿Seguro? Se perderán entrenamientos, hábitos, peso corporal y PRs.")) return;
    haptic("warning");
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
