// Banner flotante del temporizador de descanso.

let tempInterval = null;

export function crearBanner() {
  const b = document.createElement("div");
  b.id = "descanso-banner";
  b.innerHTML = `<span id="descanso-texto"></span><button id="descanso-cerrar">Saltar</button>`;
  document.body.appendChild(b);
  document.getElementById("descanso-cerrar").addEventListener("click", cerrarDescanso);
}

export function iniciarDescanso(segundos) {
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

export function cerrarDescanso() {
  clearInterval(tempInterval);
  const banner = document.getElementById("descanso-banner");
  if (banner) banner.classList.remove("visible");
}
