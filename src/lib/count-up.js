// Anima números de 0 al valor real con easing suave.
// Uso: countUpNodes(nodeList) anima todos los <... data-count="N">0</...>.
// También exporta countUpElement(el, target, duracion) para casos sueltos.

const DEFAULTS = { duracion: 700, easing: easeOutCubic };

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

function animate(el, to, opts = {}) {
  const { duracion, easing } = { ...DEFAULTS, ...opts };
  const from = 0;
  const start = performance.now();
  const isInt = Number.isInteger(to);

  function frame(now) {
    const elapsed = now - start;
    const t = Math.min(1, elapsed / duracion);
    const v = from + (to - from) * easing(t);
    el.textContent = isInt ? Math.round(v).toString() : v.toFixed(1);
    if (t < 1) requestAnimationFrame(frame);
    else el.textContent = isInt ? Math.round(to).toString() : to.toFixed(1);
  }
  requestAnimationFrame(frame);
}

export function countUpElement(el, target, opts) {
  if (!el) return;
  animate(el, Number(target) || 0, opts);
}

export function countUpNodes(nodes, opts) {
  if (!nodes) return;
  // Pequeño escalonado para que no arranquen todos a la vez (look más vivo).
  let i = 0;
  nodes.forEach((el) => {
    const target = el.dataset.count;
    if (target == null) return;
    setTimeout(() => animate(el, Number(target) || 0, opts), i * 80);
    i++;
  });
}
