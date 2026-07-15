// Vista de Historial: lista de días con sesiones registradas.

import { RUTINAS } from "../data/rutinas.js";
import { fechaCorta, getDiasEntrenados } from "../lib/fechas.js";
import { getSesiones, borrarSesionFecha } from "../lib/storage.js";
import { ocultarDescanso } from "../lib/temporizador.js";
import { icono } from "../components/icons.js";
import { haptic } from "../lib/haptics.js";

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

function ejercicioIcono(nombre) {
  const n = nombre.toLowerCase();
  if (n.includes('curl') || n.includes('extensión') || n.includes('elevación') || n.includes('face pull') || n.includes('laterales') || n.includes('martillo')) return 'llama';
  if (n.includes('plancha') || n.includes('piernas') || n.includes('rueda')) return 'foco';
  if (n.includes('sentadilla') || n.includes('press') || n.includes('peso muerto') || n.includes('remo') || n.includes('dominadas') || n.includes('hip thrust') || n.includes('jalón') || n.includes('prensa') || n.includes('fondos') || n.includes('banca')) return 'pesa';
  if (n.includes('cardio') || n.includes('pasos')) return 'pasos';
  return 'brazo';
}

export function renderHistorial(app) {
  ocultarDescanso();

  const dias = getDiasEntrenados().slice().reverse();

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
      ? `<div class="vacio">
          <div class="vacio-illo">${icono("calendario", 64)}</div>
          <h3>Tu historial está vacío</h3>
          <p>Aquí verás cada día que entrenes: ejercicios, series y pesos. Vuelve después de tu próxima sesión.</p>
        </div>`
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
                <button class="btn-icon btn-borrar-dia" data-fecha="${fecha}" title="Borrar este día" aria-label="Borrar día">${icono("papelera", 18)}</button>
              </summary>
              <div class="historial-ejercicios">
                ${ejerciciosDelDia.map(({ ej, sesion }) => `
                  <div class="historial-ej">
                    <div class="historial-ej-titulo">${icono(ejercicioIcono(ej.nombre), 16)} <span>${ej.nombre}</span></div>
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
      haptic("warning");
      RUTINAS.forEach((d) => d.ejercicios.forEach((ej) => borrarSesionFecha(ej.id, fecha)));
      renderHistorial(app);
    });
  });
}
