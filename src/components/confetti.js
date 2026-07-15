// Confeti minimalista basado en canvas. Se monta en <body>, dura ~2.5s y se destruye solo.
// Uso: lanzarConfetti({ particulas: 120, colores: [...] })

const DEFAULT_COLORS = ["#f97316", "#ef4444", "#fbbf24", "#22c55e", "#3b82f6", "#a855f7"];

let canvas = null;
let ctx = null;
let raf = null;
let particulas = [];

function ensureCanvas() {
  if (canvas) return;
  canvas = document.createElement("canvas");
  canvas.id = "confetti-canvas";
  canvas.style.cssText = "position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none;z-index:9999;";
  document.body.appendChild(canvas);
  ctx = canvas.getContext("2d");
  resize();
  window.addEventListener("resize", resize);
}

function resize() {
  if (!canvas) return;
  const dpr = window.devicePixelRatio || 1;
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function spawn(opciones) {
  const { particulas: n = 120, colores = DEFAULT_COLORS } = opciones;
  ensureCanvas();
  const W = window.innerWidth;
  for (let i = 0; i < n; i++) {
    const ang = (-90 + (Math.random() * 60 - 30)) * Math.PI / 180; // -90 ±30°
    const vel = 6 + Math.random() * 6;
    particulas.push({
      x: W * (0.2 + Math.random() * 0.6),
      y: -20,
      vx: Math.cos(ang) * vel,
      vy: Math.sin(ang) * vel,
      g: 0.18 + Math.random() * 0.08,
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.3,
      w: 6 + Math.random() * 6,
      h: 8 + Math.random() * 8,
      color: colores[Math.floor(Math.random() * colores.length)],
      ttl: 200 + Math.random() * 80,
    });
  }
  if (!raf) loop();
}

function loop() {
  raf = requestAnimationFrame(loop);
  const W = window.innerHeight;
  ctx.clearRect(0, 0, window.innerWidth, W);
  particulas = particulas.filter((p) => {
    p.x += p.vx;
    p.y += p.vy;
    p.vy += p.g;
    p.vx *= 0.995;
    p.rot += p.vr;
    p.ttl--;
    if (p.ttl <= 0 || p.y > W + 40) return false;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.fillStyle = p.color;
    ctx.globalAlpha = Math.min(1, p.ttl / 40);
    ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
    ctx.restore();
    return true;
  });
  if (!particulas.length) {
    cancelAnimationFrame(raf);
    raf = null;
    if (canvas) { canvas.remove(); canvas = null; ctx = null; }
  }
}

export function lanzarConfetti(opciones = {}) {
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
  spawn(opciones);
}
