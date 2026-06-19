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
    .map((s) => `${s.peso}×${s.reps != null ? s.reps : "-"}`)
    .join(", ");
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

// ---------- Pantalla de inicio ----------
function renderInicio() {
  let html = `
    <header class="cabecera">
      <div>
        <h1>Mi Gym</h1>
        <p class="sub">Elige el entrenamiento de hoy</p>
      </div>
    </header>
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
    const previa = getUltimaSesionPrevia(ej.id);
    const hoyS = getSesionHoy(ej.id);
    const refUltima = previa
      ? `<div class="ref-ultima">Última vez: ${resumenSeries(previa)} · ${fechaCorta(previa.fecha)}</div>`
      : `<div class="ref-ultima">Primer registro de este ejercicio</div>`;
    const nota = ej.nota ? `<div class="nota">${ej.nota}</div>` : "";

    let filas = "";
    for (let i = 0; i < ej.series; i++) {
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
        <div class="prescripcion">${ej.series} series × ${ej.reps} reps · descanso ${ej.descanso}</div>
        ${nota}
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