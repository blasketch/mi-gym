// Banner flotante del temporizador de descanso.
// - iniciarDescanso(): arranca el temporizador y muestra el banner.
// - ocultarDescanso():  oculta el banner SIN parar el contador (útil al navegar).
// - detenerDescanso():  para el contador Y oculta el banner (botón "Saltar").
// De este modo el banner sobrevive a cambios de vista.

let tempInterval = null;
let restantes = 0;

function svgInline(path) {
  return `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}</svg>`;
}

const ICONO_TIMER = svgInline(`<circle cx="12" cy="14" r="8"/><path d="M12 10v4l2 2"/><path d="M9 2h6"/><path d="M12 2v3"/><path d="M19 5l-2 2"/>`);
const ICONO_DONE  = svgInline(`<circle cx="12" cy="12" r="10"/><path d="M8 12l3 3 5-6"/>`);

export function crearBanner() {
  if (document.getElementById("descanso-banner")) return;
  const b = document.createElement("div");
  b.id = "descanso-banner";
  b.innerHTML = `<span id="descanso-icono">${ICONO_TIMER}</span><span id="descanso-texto"></span><button id="descanso-cerrar">Saltar</button>`;
  document.body.appendChild(b);
  document.getElementById("descanso-cerrar").addEventListener("click", detenerDescanso);
}

export function iniciarDescanso(segundos) {
  if (!document.getElementById("descanso-banner")) crearBanner();
  clearInterval(tempInterval);
  restantes = segundos;
  const banner = document.getElementById("descanso-banner");
  const texto = document.getElementById("descanso-texto");
  const icono = document.getElementById("descanso-icono");
  banner.classList.add("visible");
  banner.classList.remove("fin");
  if (icono) icono.innerHTML = ICONO_TIMER;

  const pinta = () => {
    const m = Math.floor(restantes / 60);
    const s = restantes % 60;
    texto.textContent = `Descanso · ${m}:${String(s).padStart(2, "0")}`;
  };
  pinta();

  tempInterval = setInterval(() => {
    restantes--;
    if (restantes <= 0) {
      clearInterval(tempInterval);
      tempInterval = null;
      texto.textContent = "¡A por la siguiente serie!";
      banner.classList.add("fin");
      if (icono) icono.innerHTML = ICONO_DONE;
      if (navigator.vibrate) navigator.vibrate(300);
      try {
        const Ctx = window.AudioContext || window.webkitAudioContext;
        if (Ctx) {
          const ctx = new Ctx();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.frequency.value = 880;
          osc.type = "sine";
          gain.gain.value = 0.08;
          osc.connect(gain).connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.18);
        }
      } catch { /* sin audio */ }
      setTimeout(() => banner.classList.remove("visible"), 2500);
    } else {
      pinta();
    }
  }, 1000);
}

export function cerrarDescanso() { detenerDescanso(); }

export function ocultarDescanso() {
  const banner = document.getElementById("descanso-banner");
  if (banner) banner.classList.remove("visible");
}

export function detenerDescanso() {
  clearInterval(tempInterval);
  tempInterval = null;
  const banner = document.getElementById("descanso-banner");
  if (banner) banner.classList.remove("visible");
}

export function temporizadorActivo() {
  return tempInterval !== null;
}
