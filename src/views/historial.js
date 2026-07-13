// Vista de Historial: lista de días con sesiones registradas.

import { RUTINAS } from "../data/rutinas.js";
import { fechaCorta, getDiasEntrenados } from "../lib/fechas.js";
import { getSesiones, borrarSesionFecha } from "../lib/storage.js";
import { ocultarDescanso } from "../lib/temporizador.js";
import { ejercicioEmoji } from "../lib/emojis.js";

import { crearTabbar } from "../components/tabbar.js";
import { renderInicio } from "./inicio.js";
import { renderAjustes } from "./ajustes.js";

function resumenEjercicio(sesion) {
  const sets = sesion.series.filter(Boolean);
  return sets.map((s) => s.peso != null ? `${s.peso}×${s.reps ?? "-"}` : `${s.reps ?? "-"} reps`).join(", ");
}

function totalSeries(sesion) {
  return sesion.series.filter(Boolean).length;
}

export function renderHistorial(app) {
  ocultarDescanso();

  const dias = getDiasEntrenados().slice().reverse(); // más reciente primero

  // Para cada día, sabemos qué ejercicios se entrenaron porque tienen sesión.
  // El nombre del ejercicio lo obtenemos de RUTINAS.
  const mapaEj = {};
  RUTINAS.forEach((d) => d.ejercicios.forEach((e) => { mapaEj[e.id] = { nombre: e.nombre, diaNombre: d.nombre }; }));

  const html = `
    <header class="cabecera">
      <div>
        <h1>Historial</h1>
        <p class="sub">Tus entrenamientos registrados</p>
      </div>
    </header>

    ${dias.length === 0
      ? `<div class="panel"><p class="sub" style="text-align:center; margin:8px 0">Aún no has registrado entrenamientos.</p></div>`
      : dias.map((fecha) => {
          const ejerciciosDelDia = [];
          RUTINAS.forEach((dia) => {
            dia.ejercicios.forEach((ej) => {
              const sesiones = getSesiones(ej.id);
              const s = sesiones.find((x) => x.fecha === fecha);
              if (s) ejerciciosDelDia.push({ ej, sesion: s });
            });
          });
          if (!ejerciciosDelDia.length) return "";
          const totalSets = ejerciciosDelDia.reduce((acc, x) => acc + totalSeries(x.sesion), 0);
          return `
            <details class="historial-dia" open>
              <summary>
                <div>
                  <div class="historial-fecha">${fechaCorta(fecha)}</div>
                  <div class="historial-meta">${ejerciciosDelDia.length} ejercicios · ${totalSets} series</div>
                </div>
                <button class="btn-icon btn-borrar-dia" data-fecha="${fecha}" title="Borrar este día" aria-label="Borrar día">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg>
                </button>
              </summary>
              <div class="historial-ejercicios">
                ${ejerciciosDelDia.map(({ ej, sesion }) => `
                  <div class="historial-ej">
                    <div class="historial-ej-titulo">${ejercicioEmoji(ej.nombre)} ${ej.nombre}</div>
                    <div class="historial-ej-series">${resumenEjercicio(sesion) || "<span class='muted'>sin series</span>"}</div>
                  </div>
                `).join("")}
              </div>
            </details>
          `;
        }).join("")
    }
    <div class="tabbar-spacer"></div>
  `;

  app.innerHTML = html;

  crearTabbar(app, "historial", (destino) => {
    if (destino === "inicio") renderInicio(app);
    else if (destino === "ajustes") renderAjustes(app);
  });

  document.querySelectorAll(".btn-borrar-dia").forEach((btn) => {
    btn.addEventListener("click", (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      const fecha = btn.dataset.fecha;
      if (!confirm(`¿Borrar el entrenamiento del ${fechaCorta(fecha)}?`)) return;
      RUTINAS.forEach((d) => d.ejercicios.forEach((ej) => borrarSesionFecha(ej.id, fecha)));
      renderHistorial(app);
    });
  });
}
