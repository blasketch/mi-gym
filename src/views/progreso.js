// Vista de progreso: peso corporal + PRs y gráficas por ejercicio.

import { RUTINAS } from "../data/rutinas.js";
import { fechaCorta } from "../lib/fechas.js";
import { cerrarDescanso } from "../lib/temporizador.js";
import { graficaHTML, montarGraficas } from "../lib/grafica.js";
import { puntosEjercicio, prEjercicio, getPesoCorporal, guardarPesoCorporal } from "../lib/progreso.js";
import { icono } from "../components/icons.js";
import { countUpNodes } from "../lib/count-up.js";

import { renderInicio } from "./inicio.js";
import { ocultarTabbar, mostrarTabbar } from "../components/tabbar.js";

export function renderProgreso(app) {
  cerrarDescanso();
  ocultarTabbar();

  const pesos = getPesoCorporal();
  const ultimo = pesos.length ? pesos[pesos.length - 1] : null;

  let html = `
    <header class="cabecera">
      <button class="volver" id="btn-volver">${icono("flechaIzquierda", 18)} Volver</button>
      <div><h1>Progreso</h1></div>
    </header>
    <div class="ejercicio">
      <div class="titulo">Peso corporal</div>
      <div class="ref-ultima">${ultimo ? `Último: ${ultimo.peso} kg · ${fechaCorta(ultimo.fecha)}` : "Sin registros todavía"}</div>
      <div class="registro">
        <input type="number" inputmode="decimal" placeholder="kg" id="in-peso-corp">
        <button class="guardar" id="btn-peso-corp">Guardar</button>
      </div>
      ${graficaHTML(pesos.map((p) => ({ fecha: p.fecha, valor: p.peso })), "kg")}
    </div>
    ${ultimo ? "" : `
      <div class="vacio">
        <div class="vacio-illo">${icono("calendario", 48)}</div>
        <p>Registra tu peso arriba para ver la evolución.</p>
      </div>
    `}
  `;

  let lista = "";
  RUTINAS.forEach((dia) => {
    dia.ejercicios.forEach((ej) => {
      const { puntos, unidad } = puntosEjercicio(ej.id);
      if (!puntos.length) return;
      const pr = prEjercicio(ej.id);
      const prTxt = pr
        ? (pr.peso != null ? `PR: ${pr.peso} kg${pr.reps != null ? ` × ${pr.reps}` : ""}` : `PR: ${pr.reps} reps`)
        : "";
      lista += `
        <div class="ejercicio">
          <div class="titulo">${ej.nombre}</div>
          <div class="pr">${icono("trofeo", 14)} <span>${prTxt}</span></div>
          ${graficaHTML(puntos, unidad)}
        </div>
      `;
    });
  });

  html += lista || `
    <div class="vacio">
      <div class="vacio-illo">${icono("pesaVacia", 64)}</div>
      <h3>Tu progreso empezará pronto</h3>
      <p>Completa tu primer entrenamiento y aquí verás tu evolución con gráficas, PRs y peso corporal.</p>
    </div>
  `;

  app.innerHTML = html;
  montarGraficas(app);
  countUpNodes(app.querySelectorAll("[data-count]"));

  document.getElementById("btn-volver").addEventListener("click", () => { mostrarTabbar(); renderInicio(app); });
  document.getElementById("btn-peso-corp").addEventListener("click", () => {
    const input = document.getElementById("in-peso-corp");
    const peso = parseFloat(input.value);
    if (isNaN(peso)) { input.focus(); return; }
    guardarPesoCorporal(peso);
    renderProgreso(app);
  });
}
