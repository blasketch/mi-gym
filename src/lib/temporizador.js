// Banner flotante del temporizador de descanso.
// - iniciarDescanso(): arranca el temporizador y muestra el banner.
// - ocultarDescanso():  oculta el banner SIN parar el contador (útil al navegar).
// - detenerDescanso():  para el contador Y oculta el banner (botón "Saltar").
// De este modo el banner sobrevive a cambios de vista.

let tempInterval = null;
let restantes = 0;

export function crearBanner() {
  if (document.getElementById("descanso-banner")) return;
  const b = document.createElement("div");
  b.id = "descanso-banner";
  b.innerHTML = `<span id="descanso-texto"></span><button id="descanso-cerrar">Saltar</button>`;
  document.body.appendChild(b);
  document.getElementById("descanso-cerrar").addEventListener("click", detenerDescanso);
}

export function iniciarDescanso(segundos) {
  if (!document.getElementById("descanso-banner")) crearBanner();
  clearInterval(tempInterval);
  restantes = segundos;
  const banner = document.getElementById("descanso-banner");
  const texto = document.getElementById("descanso-texto");
  banner.classList.add("visible");
  banner.classList.remove("fin");

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
      if (navigator.vibrate) navigator.vibrate(300);
      // pitido corto opcional
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
      } catch { /* sin audio, no pasa nada */ }
      setTimeout(() => banner.classList.remove("visible"), 2500);
    } else {
      pinta();
    }
  }, 1000);
}

// Compatibilidad: alias del comportamiento original (parar + ocultar).
export function cerrarDescanso() { detenerDescanso(); }

// Solo oculta visualmente, el contador sigue corriendo.
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
