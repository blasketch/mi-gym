// ===================================================================
// MI GYM - Entry point
// ===================================================================

import "./styles/main.css";

import { migrar } from "./lib/storage.js";
import { crearBanner } from "./lib/temporizador.js";
import { renderInicio } from "./views/inicio.js";

const app = document.getElementById("app");

migrar();
crearBanner();
renderInicio(app);

// Registro del Service Worker solo en producción (build servido por HTTP).
if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js").catch(() => {
      /* silencioso: la app sigue funcionando online */
    });
  });
}

