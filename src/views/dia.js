// Vista de un día de entrenamiento: lista de ejercicios con series.

import { RUTINAS, MODIFICADORES } from "../data/rutinas.js";
import { fechaCorta, getDiasEntrenados, faseActual } from "../lib/fechas.js";
import { getSesionHoy, getUltimaSesionPrevia, getSesiones, guardarSet, borrarSet } from "../lib/storage.js";
import { hoyISO } from "../lib/date.js";
import { parseDescanso, resumenSeries, ajustarReps, topReps, sugerencia } from "../lib/series.js";
import { iniciarDescanso, cerrarDescanso } from "../lib/temporizador.js";
import { icono } from "../components/icons.js";
import { haptic } from "../lib/haptics.js";
import { lanzarConfetti } from "../components/confetti.js";

import { renderInicio } from "./inicio.js";
import { ocultarTabbar, mostrarTabbar } from "../components/tabbar.js";

export function resumenSesion(dia) {
  let seriesHechas = 0, volumen = 0;
  const prs = [];
  dia.ejercicios.forEach((ej) => {
    const hoyS = getSesionHoy(ej.id);
    if (!hoyS) return;
    const sets = hoyS.series.filter(Boolean);
    seriesHechas += sets.length;
    sets.forEach((s) => { if (s.peso != null && s.reps != null) volumen += s.peso * s.reps; });
    const pesosHoy = sets.map((s) => s.peso).filter((p) => p != null);
    if (pesosHoy.length) {
      const maxHoy = Math.max(...pesosHoy);
      let maxHisto = 0;
      getSesiones(ej.id).filter((s) => s.fecha !== hoyISO()).forEach((s) =>
        s.series.filter(Boolean).forEach((x) => { if (x.peso != null && x.peso > maxHisto) maxHisto = x.peso; }));
      if (maxHisto > 0 && maxHoy > maxHisto) prs.push({ nombre: ej.nombre, peso: maxHoy });
    }
  });
  return { seriesHechas, volumen, prs };
}

function ejercicioIcono(nombre) {
  const n = nombre.toLowerCase();
  if (n.includes('curl') || n.includes('extensión') || n.includes('elevación') || n.includes('face pull') || n.includes('laterales') || n.includes('martillo')) return 'llama';
  if (n.includes('plancha') || n.includes('piernas') || n.includes('rueda')) return 'foco';
  if (n.includes('sentadilla') || n.includes('press') || n.includes('peso muerto') || n.includes('remo') || n.includes('dominadas') || n.includes('hip thrust') || n.includes('jalón') || n.includes('prensa') || n.includes('fondos') || n.includes('banca')) return 'pesa';
  if (n.includes('cardio') || n.includes('pasos')) return 'pasos';
  return 'brazo';
}

function mostrarResumen(app, dia) {
  const { seriesHechas, volumen, prs } = resumenSesion(dia);

  // 🎉 Celebración si hubo PRs
  if (prs.length) {
    haptic("heavy");
    setTimeout(() => lanzarConfetti({ particulas: 140 }), 60);
  } else {
    haptic("medium");
  }

  let cuerpo;
  if (seriesHechas === 0) {
    cuerpo = `<p class="sub" style="text-align:center">Aún no has registrado ninguna serie hoy.</p>`;
  } else {
    const prsHTML = prs.length
      ? `<div class="resumen-prs">
           <div class="resumen-prs-titulo">${icono("trofeo", 18)} ¡Récords nuevos!</div>
           ${prs.map((p) => `<div class="pr-item">${p.nombre} · ${p.peso} kg</div>`).join("")}
         </div>`
      : `<p class="sub" style="text-align:center; margin-top:12px">Sin récords hoy, pero sumando. ¡Sigue así!</p>`;
    cuerpo = `
      <div class="resumen-stats">
        <div class="stat"><div class="stat-num">${seriesHechas}</div><div class="stat-lbl">series</div></div>
        <div class="stat"><div class="stat-num">${Math.round(volumen)}</div><div class="stat-lbl">kg movidos</div></div>
      </div>
      ${prsHTML}
    `;
  }

  const modal = document.createElement("div");
  modal.className = "modal";
  modal.innerHTML = `
    <div class="modal-card">
      <div class="modal-titulo">Sesión completada</div>
      ${cuerpo}
      <button class="guardar" id="resumen-inicio">Ir al inicio</button>
      <button class="modal-cerrar" id="resumen-cerrar">Seguir aquí</button>
    </div>
  `;
  document.body.appendChild(modal);
  document.getElementById("resumen-cerrar").addEventListener("click", () => { haptic("light"); modal.remove(); });
  document.getElementById("resumen-inicio").addEventListener("click", () => { haptic("light"); modal.remove(); renderInicio(app); });
}

export function renderDia(app, diaId) {
  cerrarDescanso();
  ocultarTabbar();

  const dia = RUTINAS.find((d) => d.id === diaId);
  if (!dia) return renderInicio(app);

  const faseId = faseActual(getDiasEntrenados().length).id;
  const mod = MODIFICADORES[faseId] || { dSeries: 0, dReps: 0 };

  let html = `
    <header class="cabecera">
      <button class="volver" id="btn-volver">${icono("flechaIzquierda", 18)} Volver</button>
      <div>
        <h1>${dia.nombre}</h1>
        <p class="sub">${dia.enfoque}</p>
      </div>
    </header>
  `;

  dia.ejercicios.forEach((ej, ejIdx) => {
    const series = Math.max(2, ej.series + mod.dSeries);
    const reps = ajustarReps(ej.reps, mod.dReps);
    const top = topReps(reps);

    const previa = getUltimaSesionPrevia(ej.id);
    const hoyS = getSesionHoy(ej.id);
    const refUltima = previa
      ? `<div class="ref-ultima">Última vez: ${resumenSeries(previa)} · ${fechaCorta(previa.fecha)}</div>`
      : `<div class="ref-ultima">Primer registro de este ejercicio</div>`;
    const nota = ej.nota ? `<div class="nota">${icono("bombilla", 14)} <span>${ej.nota}</span></div>` : "";

    const sug = sugerencia(ej, series, top);
    const sugHTML = sug ? `<div class="sugerencia">${icono("flechaArriba", 14)} <span>${sug}</span></div>` : "";

    let filas = "";
    for (let i = 0; i < series; i++) {
      const hechaHoy = hoyS && hoyS.series[i];
      const ref = hechaHoy || (previa && previa.series[i]) || null;
      const vp = ref ? ref.peso : "";
      const vr = ref && ref.reps != null ? ref.reps : "";
      filas += `
        <div class="serie-row ${hechaHoy ? "hecha" : ""}">
          <span class="serie-num">${i + 1}</span>
          <input class="in-peso" type="number" inputmode="decimal" placeholder="kg" value="${vp}">
          <input class="in-reps" type="number" inputmode="numeric" placeholder="reps" value="${vr}">
          <button class="check" data-ej="${ej.id}" data-serie="${i}" data-descanso="${parseDescanso(ej.descanso)}" aria-label="Marcar serie">${icono("check", 18)}</button>
        </div>
      `;
    }

    html += `
      <div class="ejercicio" style="animation-delay:${ejIdx * 0.06}s">
        <div class="titulo">${icono(ejercicioIcono(ej.nombre), 18)} <span>${ej.nombre}</span></div>
        <div class="prescripcion">${series} series × ${reps} reps · descanso ${ej.descanso}</div>
        ${nota}
        ${sugHTML}
        ${refUltima}
        <div class="series-lista">${filas}</div>
      </div>
    `;
  });

  html += `<button class="terminar" id="btn-terminar">Terminar sesión</button>`;

  app.innerHTML = html;

  document.getElementById("btn-volver").addEventListener("click", () => { haptic("light"); mostrarTabbar(); renderInicio(app); });
  document.getElementById("btn-terminar").addEventListener("click", () => mostrarResumen(app, dia));

  document.querySelectorAll(".check").forEach((btn) => {
    btn.addEventListener("click", () => {
      const fila = btn.closest(".serie-row");
      const ejId = btn.dataset.ej;
      const indice = parseInt(btn.dataset.serie, 10);
      const descanso = parseInt(btn.dataset.descanso, 10);
      const inPeso = fila.querySelector(".in-peso");
      const inReps = fila.querySelector(".in-reps");

      if (fila.classList.contains("hecha")) {
        fila.classList.remove("hecha");
        borrarSet(ejId, indice);
        haptic("light");
        return;
      }

      const peso = parseFloat(inPeso.value);
      const reps = parseInt(inReps.value, 10);
      if (isNaN(peso) && isNaN(reps)) { inPeso.focus(); return; }

      guardarSet(ejId, indice, isNaN(peso) ? null : peso, isNaN(reps) ? null : reps);
      fila.classList.add("hecha");
      haptic("medium");
      iniciarDescanso(descanso);
    });
  });
}
