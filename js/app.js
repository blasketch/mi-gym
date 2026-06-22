// ===================================================================
// MI GYM - Lógica de la app
// ===================================================================

const app = document.getElementById("app");
const LOG = "mig-log-";

// ---------- Fechas y formato ----------
function hoyISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}
const hoy = hoyISO();

function fechaCorta(iso) {
  const [, mes, dia] = iso.split("-");
  return `${dia}/${mes}`;
}

// "90 s" -> 90 | "2 min" -> 120 | "2-3 min" -> 120
function parseDescanso(texto) {
  const num = parseInt(texto, 10);
  if (isNaN(num)) return 60;
  return String(texto).includes("min") ? num * 60 : num;
}

// ---------- Almacenamiento (sesiones con series) ----------
function getSesiones(ejId) {
  const d = localStorage.getItem(LOG + ejId);
  return d ? JSON.parse(d) : [];
}
function setSesiones(ejId, sesiones) {
  localStorage.setItem(LOG + ejId, JSON.stringify(sesiones));
}
function getSesionHoy(ejId) {
  return getSesiones(ejId).find((s) => s.fecha === hoy) || null;
}
function getUltimaSesionPrevia(ejId) {
  const previas = getSesiones(ejId).filter((s) => s.fecha !== hoy);
  return previas.length ? previas[previas.length - 1] : null;
}
function guardarSet(ejId, indice, peso, reps) {
  const sesiones = getSesiones(ejId);
  let hoyS = sesiones.find((s) => s.fecha === hoy);
  if (!hoyS) {
    hoyS = { fecha: hoy, series: [] };
    sesiones.push(hoyS);
  }
  hoyS.series[indice] = { peso, reps };
  setSesiones(ejId, sesiones);
}
function borrarSet(ejId, indice) {
  const sesiones = getSesiones(ejId);
  const idx = sesiones.findIndex((s) => s.fecha === hoy);
  if (idx === -1) return;
  delete sesiones[idx].series[indice];
  if (sesiones[idx].series.filter(Boolean).length === 0) sesiones.splice(idx, 1);
  setSesiones(ejId, sesiones);
}

// ---------- Migración del formato antiguo (no perder datos) ----------
function migrar() {
  if (localStorage.getItem("mig-migrado-v2")) return;
  const viejas = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith("mig-pesos-")) viejas.push(k);
  }
  viejas.forEach((k) => {
    const id = k.slice("mig-pesos-".length);
    if (localStorage.getItem(LOG + id)) return;
    const arr = JSON.parse(localStorage.getItem(k)) || [];
    const sesiones = arr.map((r) => ({ fecha: r.fecha, series: [{ peso: r.peso, reps: r.reps }] }));
    if (sesiones.length) setSesiones(id, sesiones);
  });
  localStorage.setItem("mig-migrado-v2", "1");
}

// ---------- Utilidades ----------
function resumenSeries(sesion) {
  return sesion.series
    .filter(Boolean)
    .map((s) => {
      const r = s.reps != null ? s.reps : "-";
      return s.peso != null ? `${s.peso}×${r}` : `${r} reps`;
    })
    .join(", ");
}

// Ajusta un rango de reps según la fase ("6-8" + 2 -> "8-10")
function ajustarReps(repsStr, delta) {
  const rango = String(repsStr).match(/^(\d+)\s*-\s*(\d+)(.*)$/);
  if (rango) {
    const lo = Math.max(1, parseInt(rango[1], 10) + delta);
    const hi = Math.max(lo, parseInt(rango[2], 10) + delta);
    return `${lo}-${hi}${rango[3]}`;
  }
  const simple = String(repsStr).match(/^(\d+)(.*)$/);
  if (simple) {
    const n = Math.max(1, parseInt(simple[1], 10) + delta);
    return `${n}${simple[2]}`;
  }
  return repsStr;
}

// Tope de reps de un rango (para saber cuándo subir peso)
function topReps(repsStr) {
  const rango = String(repsStr).match(/^(\d+)\s*-\s*(\d+)/);
  if (rango) return parseInt(rango[2], 10);
  const simple = String(repsStr).match(/^(\d+)/);
  if (simple) return parseInt(simple[1], 10);
  return null;
}

// Sugerencia de subir peso si la última vez completaste el tope en todas las series
function sugerencia(ej, series, top) {
  if (top == null) return null;
  const previa = getUltimaSesionPrevia(ej.id);
  if (!previa) return null;
  const sets = previa.series.filter(Boolean);
  if (sets.length < series) return null;
  const todasAlTope = sets.every((s) => s.reps != null && s.reps >= top);
  if (!todasAlTope) return null;
  const pesos = sets.map((s) => s.peso).filter((p) => p != null);
  if (pesos.length) return `Subir peso: prueba ${Math.max(...pesos) + 2.5} kg`;
  return `Subir intensidad: añade repeticiones o lastre`;
}

// ---------- Temporizador de descanso ----------
let tempInterval = null;
function crearBanner() {
  const b = document.createElement("div");
  b.id = "descanso-banner";
  b.innerHTML = `<span id="descanso-texto"></span><button id="descanso-cerrar">Saltar</button>`;
  document.body.appendChild(b);
  document.getElementById("descanso-cerrar").addEventListener("click", cerrarDescanso);
}
function iniciarDescanso(segundos) {
  clearInterval(tempInterval);
  let restante = segundos;
  const banner = document.getElementById("descanso-banner");
  const texto = document.getElementById("descanso-texto");
  banner.classList.add("visible");
  banner.classList.remove("fin");

  const pinta = () => {
    const m = Math.floor(restante / 60);
    const s = restante % 60;
    texto.textContent = `Descanso · ${m}:${String(s).padStart(2, "0")}`;
  };
  pinta();

  tempInterval = setInterval(() => {
    restante--;
    if (restante <= 0) {
      clearInterval(tempInterval);
      texto.textContent = "¡A por la siguiente serie!";
      banner.classList.add("fin");
      if (navigator.vibrate) navigator.vibrate(300);
      setTimeout(() => banner.classList.remove("visible"), 2500);
    } else {
      pinta();
    }
  }, 1000);
}
function cerrarDescanso() {
  clearInterval(tempInterval);
  document.getElementById("descanso-banner").classList.remove("visible");
}

// ---------- Días entrenados, racha y fase ----------
function isoDe(d) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}
function lunesISO(fechaISO) {
  const d = new Date(fechaISO + "T00:00:00");
  const dia = (d.getDay() + 6) % 7; // 0 = lunes
  d.setDate(d.getDate() - dia);
  return isoDe(d);
}
function getDiasEntrenados() {
  const fechas = new Set();
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith(LOG)) {
      const sesiones = JSON.parse(localStorage.getItem(k)) || [];
      sesiones.forEach((s) => { if (s.fecha) fechas.add(s.fecha); });
    }
  }
  return [...fechas].sort();
}
function getDiasEstaSemana() {
  const lunes = lunesISO(hoy);
  return getDiasEntrenados().filter((f) => lunesISO(f) === lunes).length;
}
function getRachaSemanas() {
  const dias = getDiasEntrenados();
  if (!dias.length) return 0;
  const semanas = new Set(dias.map(lunesISO));
  let cursor = new Date(lunesISO(hoy) + "T00:00:00");
  if (!semanas.has(isoDe(cursor))) cursor.setDate(cursor.getDate() - 7);
  let racha = 0;
  while (semanas.has(isoDe(cursor))) { racha++; cursor.setDate(cursor.getDate() - 7); }
  return racha;
}
function faseActual(totalDias) {
  let inicio = 0;
  for (const fase of FASES) {
    if (totalDias <= fase.hasta) {
      return { id: fase.id, nombre: fase.nombre, diasEnFase: totalDias - inicio, total: fase.hasta - inicio };
    }
    inicio = fase.hasta;
  }
  const u = FASES[FASES.length - 1];
  return { id: u.id, nombre: u.nombre, diasEnFase: totalDias - inicio, total: Infinity };
}
function siguienteFaseNombre(faseId) {
  const idx = FASES.findIndex((f) => f.id === faseId);
  return idx >= 0 && idx < FASES.length - 1 ? FASES[idx + 1].nombre : null;
}

// ---------- Pantalla de inicio ----------
function renderInicio() {
  const total = getDiasEntrenados().length;
  const racha = getRachaSemanas();
  const semana = getDiasEstaSemana();
  const fase = faseActual(total);

  let faseHTML;
  if (isFinite(fase.total) && fase.total > 0) {
    const pct = Math.min(100, Math.round((fase.diasEnFase / fase.total) * 100));
    const faltan = fase.total - fase.diasEnFase;
    faseHTML = `
      <div class="fase">
        <div class="fase-top"><span>Fase: ${fase.nombre}</span><span>${fase.diasEnFase}/${fase.total}</span></div>
        <div class="barra"><div class="barra-fill" style="width:${pct}%"></div></div>
        <div class="fase-sub">${faltan} días para ${siguienteFaseNombre(fase.id)}</div>
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
      <div>
        <h1>Mi Gym</h1>
        <p class="sub">Elige el entrenamiento de hoy</p>
      </div>
    </header>
    <div class="panel">
      <div class="stats">
        <div class="stat"><div class="stat-num">${total}</div><div class="stat-lbl">días entrenados</div></div>
        <div class="stat"><div class="stat-num">${racha}</div><div class="stat-lbl">sem. seguidas</div></div>
        <div class="stat"><div class="stat-num">${semana}</div><div class="stat-lbl">esta semana</div></div>
      </div>
      ${faseHTML}
    </div>
  `;

  RUTINAS.forEach((dia) => {
    html += `
      <button class="dia-card" data-dia="${dia.id}">
        <div class="nombre">${dia.nombre}</div>
        <div class="enfoque">${dia.enfoque}</div>
        <div class="cuenta">${dia.ejercicios.length} ejercicios</div>
      </button>
    `;
  });

  app.innerHTML = html;
  document.querySelectorAll(".dia-card").forEach((card) => {
    card.addEventListener("click", () => renderDia(card.dataset.dia));
  });
}

// ---------- Pantalla de un día ----------
function renderDia(diaId) {
  const dia = RUTINAS.find((d) => d.id === diaId);
  if (!dia) return renderInicio();

  const faseId = faseActual(getDiasEntrenados().length).id;
  const mod = MODIFICADORES[faseId] || { dSeries: 0, dReps: 0 };

  let html = `
    <header class="cabecera">
      <button class="volver" id="btn-volver">← Volver</button>
      <div>
        <h1>${dia.nombre}</h1>
        <p class="sub">${dia.enfoque}</p>
      </div>
    </header>
  `;

  dia.ejercicios.forEach((ej) => {
    const series = Math.max(2, ej.series + mod.dSeries);
    const reps = ajustarReps(ej.reps, mod.dReps);
    const top = topReps(reps);

    const previa = getUltimaSesionPrevia(ej.id);
    const hoyS = getSesionHoy(ej.id);
    const refUltima = previa
      ? `<div class="ref-ultima">Última vez: ${resumenSeries(previa)} · ${fechaCorta(previa.fecha)}</div>`
      : `<div class="ref-ultima">Primer registro de este ejercicio</div>`;
    const nota = ej.nota ? `<div class="nota">${ej.nota}</div>` : "";

    const sug = sugerencia(ej, series, top);
    const sugHTML = sug ? `<div class="sugerencia">${sug}</div>` : "";

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
          <button class="check" data-ej="${ej.id}" data-serie="${i}" data-descanso="${parseDescanso(ej.descanso)}">✓</button>
        </div>
      `;
    }

    html += `
      <div class="ejercicio">
        <div class="titulo">${ej.nombre}</div>
        <div class="prescripcion">${series} series × ${reps} reps · descanso ${ej.descanso}</div>
        ${nota}
        ${sugHTML}
        ${refUltima}
        <div class="series-lista">${filas}</div>
      </div>
    `;
  });

  app.innerHTML = html;

  document.getElementById("btn-volver").addEventListener("click", renderInicio);

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
        return;
      }

      const peso = parseFloat(inPeso.value);
      const reps = parseInt(inReps.value, 10);
      if (isNaN(peso) && isNaN(reps)) { inPeso.focus(); return; }

      guardarSet(ejId, indice, isNaN(peso) ? null : peso, isNaN(reps) ? null : reps);
      fila.classList.add("hecha");
      iniciarDescanso(descanso);
    });
  });
}

// ---------- Service worker ----------
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("service-worker.js").catch(console.error);
  });
}

// ---------- Arranque ----------
migrar();
crearBanner();
renderInicio();