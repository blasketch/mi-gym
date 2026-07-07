// ===================================================================
// MI GYM - Lógica de la app
// ===================================================================

const app = document.getElementById("app");

const STORAGE = {
  LOG: "mig-log-",
  PESO_CORP: "mig-peso-corporal",
  HABITOS: "mig-habitos-",
  MIGRADO: "mig-migrado-v2",
};

function storageGet(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function storageSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

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
  return storageGet(STORAGE.LOG + ejId) || [];
}
function setSesiones(ejId, sesiones) {
  storageSet(STORAGE.LOG + ejId, sesiones);
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
  sesiones[idx].series.splice(indice, 1);
  if (sesiones[idx].series.length === 0) sesiones.splice(idx, 1);
  setSesiones(ejId, sesiones);
}

// ---------- Migración del formato antiguo (no perder datos) ----------
function migrar() {
  if (storageGet(STORAGE.MIGRADO)) return;
  const viejas = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith("mig-pesos-")) viejas.push(k);
  }
  viejas.forEach((k) => {
    const id = k.slice("mig-pesos-".length);
    if (storageGet(STORAGE.LOG + id)) return;
    const arr = storageGet(k) || [];
    const sesiones = arr.map((r) => ({ fecha: r.fecha, series: [{ peso: r.peso, reps: r.reps }] }));
    if (sesiones.length) setSesiones(id, sesiones);
  });
  storageSet(STORAGE.MIGRADO, "1");
}

// ---------- Exportación / Importación de datos ----------
function exportarDatos() {
  const claves = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && (k.startsWith(STORAGE.LOG) || k === STORAGE.PESO_CORP || k.startsWith(STORAGE.HABITOS) || k === STORAGE.MIGRADO)) {
      claves.push(k);
    }
  }
  const datos = { _meta: { version: 2, exportado: hoyISO() } };
  claves.forEach((k) => { datos[k] = storageGet(k); });

  const blob = new Blob([JSON.stringify(datos, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `mi-gym-${hoyISO()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function importarDatos(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const datos = JSON.parse(e.target.result);
      if (!datos._meta || !datos._meta.version) {
        alert("El archivo no parece un backup válido de Mi Gym.");
        return;
      }
      if (!confirm("Se sobrescribirán los datos actuales. ¿Continuar?")) return;

      Object.keys(datos).forEach((k) => {
        if (k.startsWith("_")) return;
        storageSet(k, datos[k]);
      });
      renderInicio();
    } catch {
      alert("Error al leer el archivo. Comprueba que es un backup válido.");
    }
  };
  reader.readAsText(file);
}

function clickImportar() {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".json";
  input.style.display = "none";
  input.addEventListener("change", () => {
    if (input.files[0]) importarDatos(input.files[0]);
    input.remove();
  });
  document.body.appendChild(input);
  input.click();
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
  const banner = document.getElementById("descanso-banner");
  if (banner) banner.classList.remove("visible");
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
    if (k && k.startsWith(STORAGE.LOG)) {
      const sesiones = storageGet(k) || [];
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
  cerrarDescanso();

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
      <button class="btn-icon" id="btn-importar" title="Importar datos">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
      </button>
      <button class="btn-icon" id="btn-exportar" title="Exportar datos">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
      </button>
      <button class="btn-progreso" id="btn-progreso">Progreso</button>
    </header>
    <div class="panel">
      <div class="stats">
        <div class="stat"><div class="stat-num">${total}</div><div class="stat-lbl">días entrenados</div></div>
        <div class="stat"><div class="stat-num">${racha}</div><div class="stat-lbl">sem. seguidas</div></div>
        <div class="stat"><div class="stat-num">${semana}</div><div class="stat-lbl">esta semana</div></div>
      </div>
      ${faseHTML}
    </div>
    ${htmlConstancia()}
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
  document.getElementById("btn-progreso").addEventListener("click", renderProgreso);
  document.getElementById("btn-exportar").addEventListener("click", exportarDatos);
  document.getElementById("btn-importar").addEventListener("click", clickImportar);
  document.querySelectorAll(".dia-card").forEach((card) => {
    card.addEventListener("click", () => renderDia(card.dataset.dia));
  });
  document.querySelectorAll(".habito").forEach((btn) => {
    btn.addEventListener("click", () => {
      toggleHabito(hoy, btn.dataset.hab);
      btn.classList.toggle("on");
      const r = document.getElementById("racha-hab");
      if (r) r.textContent = textoRachaHab(rachaHabitos());
    });
  });
}

// ---------- Pantalla de un día ----------
function renderDia(diaId) {
  cerrarDescanso();

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

  html += `<button class="terminar" id="btn-terminar">Terminar sesión</button>`;

  app.innerHTML = html;

  document.getElementById("btn-volver").addEventListener("click", renderInicio);
  document.getElementById("btn-terminar").addEventListener("click", () => mostrarResumen(dia));

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

// ---------- Peso corporal ----------
function getPesoCorporal() {
  return storageGet(STORAGE.PESO_CORP) || [];
}
function guardarPesoCorporal(peso) {
  const arr = getPesoCorporal();
  const idx = arr.findIndex((r) => r.fecha === hoy);
  if (idx >= 0) arr[idx].peso = peso;
  else arr.push({ fecha: hoy, peso });
  arr.sort((a, b) => a.fecha.localeCompare(b.fecha));
  storageSet(STORAGE.PESO_CORP, arr);
}

// ---------- Datos de progreso por ejercicio ----------
function puntosEjercicio(ejId) {
  const sesiones = getSesiones(ejId);
  let hayPeso = false;
  sesiones.forEach((s) => s.series.filter(Boolean).forEach((x) => { if (x.peso != null) hayPeso = true; }));
  const puntos = [];
  sesiones.forEach((s) => {
    const sets = s.series.filter(Boolean);
    if (hayPeso) {
      const pesos = sets.map((x) => x.peso).filter((p) => p != null);
      if (pesos.length) puntos.push({ fecha: s.fecha, valor: Math.max(...pesos) });
    } else {
      const reps = sets.map((x) => x.reps).filter((r) => r != null);
      if (reps.length) puntos.push({ fecha: s.fecha, valor: Math.max(...reps) });
    }
  });
  return { puntos, unidad: hayPeso ? "kg" : "reps" };
}
function prEjercicio(ejId) {
  const sets = [];
  getSesiones(ejId).forEach((s) => s.series.filter(Boolean).forEach((x) => sets.push(x)));
  const conPeso = sets.filter((x) => x.peso != null);
  if (conPeso.length) {
    const maxPeso = Math.max(...conPeso.map((x) => x.peso));
    const reps = Math.max(...conPeso.filter((x) => x.peso === maxPeso).map((x) => x.reps ?? 0));
    return { peso: maxPeso, reps: reps || null };
  }
  const conReps = sets.filter((x) => x.reps != null);
  if (conReps.length) return { reps: Math.max(...conReps.map((x) => x.reps)) };
  return null;
}

// ---------- Gráfica en SVG ----------
function graficaSVG(puntos, unidad) {
  if (puntos.length < 2) return `<div class="grafica-vacia">Necesitas al menos 2 registros para ver la gráfica</div>`;
  const W = 300, H = 120, pad = 24;
  const vals = puntos.map((p) => p.valor);
  let min = Math.min(...vals), max = Math.max(...vals);
  if (min === max) { min -= 1; max += 1; }
  const x = (i) => pad + (i / (puntos.length - 1)) * (W - pad * 2);
  const y = (v) => H - pad - ((v - min) / (max - min)) * (H - pad * 2);
  const linea = puntos.map((p, i) => `${x(i).toFixed(1)},${y(p.valor).toFixed(1)}`).join(" ");
  const dots = puntos.map((p, i) => `<circle cx="${x(i).toFixed(1)}" cy="${y(p.valor).toFixed(1)}" r="3" fill="var(--accent)"/>`).join("");
  return `
    <svg viewBox="0 0 ${W} ${H}" class="grafica">
      <polyline points="${linea}" fill="none" stroke="var(--accent)" stroke-width="2"/>
      ${dots}
      <text x="${pad}" y="12" fill="var(--muted)" font-size="11">${max} ${unidad}</text>
      <text x="${pad}" y="${H - 4}" fill="var(--muted)" font-size="11">${min} ${unidad}</text>
    </svg>`;
}

// ---------- Pantalla de progreso ----------
function renderProgreso() {
  cerrarDescanso();

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

  document.getElementById("btn-volver").addEventListener("click", renderInicio);
  document.getElementById("btn-peso-corp").addEventListener("click", () => {
    const input = document.getElementById("in-peso-corp");
    const peso = parseFloat(input.value);
    if (isNaN(peso)) { input.focus(); return; }
    guardarPesoCorporal(peso);
    renderProgreso();
  });
}

// ---------- Constancia diaria (hábitos) ----------
function getHabitosDia(fecha) {
  return storageGet(STORAGE.HABITOS + fecha) || [];
}
function toggleHabito(fecha, habitoId) {
  const marcados = getHabitosDia(fecha);
  const i = marcados.indexOf(habitoId);
  if (i >= 0) marcados.splice(i, 1);
  else marcados.push(habitoId);
  storageSet(STORAGE.HABITOS + fecha, marcados);
}
function rachaHabitos() {
  if (!HABITOS.length) return 0;
  const completo = (f) => getHabitosDia(f).length >= HABITOS.length;
  let cursor = new Date(hoy + "T00:00:00");
  if (!completo(isoDe(cursor))) cursor.setDate(cursor.getDate() - 1);
  let racha = 0;
  while (completo(isoDe(cursor))) { racha++; cursor.setDate(cursor.getDate() - 1); }
  return racha;
}
function textoRachaHab(n) {
  return n > 0 ? `Racha: ${n} ${n === 1 ? "día" : "días"}` : "Empieza tu racha";
}
function htmlConstancia() {
  const marcados = getHabitosDia(hoy);
  const chips = HABITOS.map((h) =>
    `<button class="habito ${marcados.includes(h.id) ? "on" : ""}" data-hab="${h.id}">${h.nombre}</button>`
  ).join("");
  return `
    <div class="panel">
      <div class="constancia-top">
        <span>Constancia de hoy</span>
        <span class="racha-hab" id="racha-hab">${textoRachaHab(rachaHabitos())}</span>
      </div>
      <div class="habitos">${chips}</div>
    </div>
  `;
}

// ---------- Resumen de sesión ----------
function resumenSesion(dia) {
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
      getSesiones(ej.id).filter((s) => s.fecha !== hoy).forEach((s) =>
        s.series.filter(Boolean).forEach((x) => { if (x.peso != null && x.peso > maxHisto) maxHisto = x.peso; }));
      if (maxHisto > 0 && maxHoy > maxHisto) prs.push({ nombre: ej.nombre, peso: maxHoy });
    }
  });
  return { seriesHechas, volumen, prs };
}

function mostrarResumen(dia) {
  const { seriesHechas, volumen, prs } = resumenSesion(dia);

  let cuerpo;
  if (seriesHechas === 0) {
    cuerpo = `<p class="sub" style="text-align:center">Aún no has registrado ninguna serie hoy.</p>`;
  } else {
    const prsHTML = prs.length
      ? `<div class="resumen-prs">
           <div class="resumen-prs-titulo">¡Récords nuevos!</div>
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
  document.getElementById("resumen-cerrar").addEventListener("click", () => modal.remove());
  document.getElementById("resumen-inicio").addEventListener("click", () => { modal.remove(); renderInicio(); });
}

// ---------- Arranque ----------
migrar();
crearBanner();
renderInicio();
