// ===================================================================
// MI GYM - Lógica de la app
// ===================================================================

const app = document.getElementById("app");

// --- Guardado de pesos (se almacenan en tu móvil con localStorage) ---
const PREFIJO = "mig-pesos-";

function getRegistros(ejercicioId) {
  const datos = localStorage.getItem(PREFIJO + ejercicioId);
  return datos ? JSON.parse(datos) : [];
}

function hoyISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function guardarRegistro(ejercicioId, peso, reps) {
  const registros = getRegistros(ejercicioId);
  registros.push({ fecha: hoyISO(), peso, reps });
  localStorage.setItem(PREFIJO + ejercicioId, JSON.stringify(registros));
}

function ultimoRegistro(ejercicioId) {
  const registros = getRegistros(ejercicioId);
  return registros.length ? registros[registros.length - 1] : null;
}

// --- Formato ---
function fechaCorta(iso) {
  const [, mes, dia] = iso.split("-");
  return `${dia}/${mes}`;
}

function formatRegistro(r) {
  const repsTxt = (r.reps != null) ? ` × ${r.reps} reps` : "";
  return `${r.peso} kg${repsTxt}`;
}

function textoUltimo(ejercicioId) {
  const ultimo = ultimoRegistro(ejercicioId);
  return ultimo
    ? `Último: <strong>${formatRegistro(ultimo)}</strong> · ${fechaCorta(ultimo.fecha)}`
    : "Sin registros todavía";
}

// --- Pantalla de inicio ---
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

// --- Pantalla de un día ---
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
    const nota = ej.nota ? `<div class="nota">${ej.nota}</div>` : "";
    html += `
      <div class="ejercicio">
        <div class="titulo">${ej.nombre}</div>
        <div class="prescripcion">${ej.series} series × ${ej.reps} reps · descanso ${ej.descanso}</div>
        ${nota}
        <div class="ultimo" data-ultimo="${ej.id}">${textoUltimo(ej.id)}</div>
        <div class="registro">
          <input type="number" inputmode="decimal" placeholder="kg" data-peso="${ej.id}">
          <input type="number" inputmode="numeric" placeholder="reps" data-reps="${ej.id}">
          <button class="guardar" data-guardar="${ej.id}">Guardar</button>
        </div>
      </div>
    `;
  });

  app.innerHTML = html;

  document.getElementById("btn-volver").addEventListener("click", renderInicio);

  document.querySelectorAll("[data-guardar]").forEach((boton) => {
    boton.addEventListener("click", () => {
      const id = boton.dataset.guardar;
      const inputPeso = document.querySelector(`[data-peso="${id}"]`);
      const inputReps = document.querySelector(`[data-reps="${id}"]`);
      const peso = parseFloat(inputPeso.value);
      const reps = parseInt(inputReps.value, 10);

      if (isNaN(peso)) {
        inputPeso.focus();
        return;
      }

      guardarRegistro(id, peso, isNaN(reps) ? null : reps);
      document.querySelector(`[data-ultimo="${id}"]`).innerHTML = textoUltimo(id);

      inputPeso.value = "";
      inputReps.value = "";
      const original = boton.textContent;
      boton.textContent = "Guardado";
      setTimeout(() => { boton.textContent = original; }, 1200);
    });
  });
}

// --- Arranque ---
renderInicio();
// --- Service worker (sin conexión + instalable) ---
if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("service-worker.js").catch(console.error);
    });
  }