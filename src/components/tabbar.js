// Tabbar inferior de navegación. Se renderiza en <body>, no en #app,
// para que sobreviva a los cambios de vista. Marca la pestaña activa.

const PESTAÑAS = [
  { id: "inicio",    label: "Inicio",    ruta: "inicio"    },
  { id: "historial", label: "Historial", ruta: "historial" },
  { id: "ajustes",   label: "Ajustes",   ruta: "ajustes"   },
];

function icono(p) {
  if (p === "inicio") {
    return `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12 12 3l9 9"/><path d="M5 10v10h14V10"/></svg>`;
  }
  if (p === "historial") {
    return `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>`;
  }
  if (p === "ajustes") {
    return `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`;
  }
  return "";
}

export function crearTabbar(app, activa, onNavigate) {
  let bar = document.getElementById("tabbar");
  if (!bar) {
    bar = document.createElement("nav");
    bar.id = "tabbar";
    bar.setAttribute("aria-label", "Navegación principal");
    document.body.appendChild(bar);
  }
  bar.classList.remove("oculta");
  bar.innerHTML = PESTAÑAS.map((p) => `
    <button class="tab ${p.id === activa ? "activa" : ""}" data-tab="${p.id}">
      ${icono(p.id)}
      <span>${p.label}</span>
    </button>
  `).join("");
  bar.querySelectorAll(".tab").forEach((btn) => {
    btn.addEventListener("click", () => onNavigate(btn.dataset.tab));
  });
}

export function ocultarTabbar() {
  const bar = document.getElementById("tabbar");
  if (bar) bar.classList.add("oculta");
}

export function mostrarTabbar() {
  const bar = document.getElementById("tabbar");
  if (bar) bar.classList.remove("oculta");
}
