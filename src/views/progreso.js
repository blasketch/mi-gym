// Vista de progreso: peso corporal + PRs y gráficas por ejercicio.

import { RUTINAS } from "../data/rutinas.js";
import { fechaCorta } from "../lib/fechas.js";
import { cerrarDescanso } from "../lib/temporizador.js";
import { graficaSVG } from "../lib/grafica.js";
import { puntosEjercicio, prEjercicio, getPesoCorporal, guardarPesoCorporal } from "../lib/progreso.js";

import { renderInicio } from "./inicio.js";
import { ocultarTabbar, mostrarTabbar } from "../components/tabbar.js";

export function renderProgreso(app) {
  cerrarDescanso();
  ocultarTabbar();

  const pesos = getPesoCorporal();
  const ultimo = pesos.length ? pesos[pesos.length - 1] : null;

  let html = `
    <header class="cabecera">
      <button class="volver" id="btn-volver">← Volver</button>
      <div><h1>Progreso</h1></div>
    </header>
    <div class="ejercicio">
      <div class="titulo">Peso corporal</div>
      <div class="ref-ultima">${ultimo ? `Último: ${ultimo.peso} kg · ${fechaCorta(ultimo.fecha)}` : "Sin registros todavía"}</div>
      <div class="registro">
        <input type="number" inputmode="decimal" placeholder="kg" id="in-peso-corp">
        <button class="guardar" id="btn-peso-corp">Guardar</button>
      </div>
      ${graficaSVG(pesos.map((p) => ({ fecha: p.fecha, valor: p.peso })), "kg")}
    </div>
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
          <div class="pr">${prTxt}</div>
          ${graficaSVG(puntos, unidad)}
        </div>
      `;
    });
  });

  html += lista || `<p class="sub" style="text-align:center; margin-top:24px">Aún no has registrado ejercicios. Entrena y tu progreso aparecerá aquí.</p>`;

  app.innerHTML = html;

  document.getElementById("btn-volver").addEventListener("click", () => { mostrarTabbar(); renderInicio(app); });
  document.getElementById("btn-peso-corp").addEventListener("click", () => {
    const input = document.getElementById("in-peso-corp");
    const peso = parseFloat(input.value);
    if (isNaN(peso)) { input.focus(); return; }
    guardarPesoCorporal(peso);
    renderProgreso(app);
  });
}
