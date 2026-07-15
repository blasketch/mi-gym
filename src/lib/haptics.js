// Wrapper sobre @capacitor/haptics con fallback a navigator.vibrate.
// Se puede llamar con seguridad desde web o nativo.
// Uso: haptic("light" | "medium" | "heavy" | "success" | "warning" | "selection")

import { Capacitor } from "@capacitor/core";

let Haptics = null;
let ImpactStyle = null;
let NotificationType = null;
let importado = false;

async function ensure() {
  if (importado) return;
  importado = true;
  if (!Capacitor.isNativePlatform()) return;
  try {
    const mod = await import("@capacitor/haptics");
    Haptics = mod.Haptics;
    ImpactStyle = mod.ImpactStyle;
    NotificationType = mod.NotificationType;
  } catch {
    /* sin plugin: no pasa nada */
  }
}

export async function haptic(tipo = "light") {
  await ensure();
  try {
    if (Haptics) {
      if (tipo === "selection") return Haptics.selectionStart();
      if (["success", "warning", "error"].includes(tipo)) {
        return Haptics.notification({ type: NotificationType[tipo[0].toUpperCase() + tipo.slice(1)] });
      }
      const style = ["light", "medium", "heavy"].includes(tipo)
        ? ImpactStyle[tipo[0].toUpperCase() + tipo.slice(1)]
        : ImpactStyle.Light;
      return Haptics.impact({ style });
    }
  } catch { /* cae al fallback */ }
  // Fallback web (Android Chrome soporta navigator.vibrate)
  if (navigator.vibrate) {
    const map = { light: 10, medium: 20, heavy: 30, success: [10, 30, 20], warning: [20, 40, 20], error: [30, 50, 30] };
    navigator.vibrate(map[tipo] ?? 10);
  }
}
