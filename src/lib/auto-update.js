// Live updates vía @capgo/capacitor-updater.
// Solo se activa en build nativo (Capacitor). En web/dev no hace nada.

import { Capacitor } from "@capacitor/core";
import { CapacitorUpdater } from "@capgo/capacitor-updater";

export function initAutoUpdate() {
  if (!Capacitor.isNativePlatform()) return;

  // 1. Avisar a Capgo que la app arrancó OK (habilita la descarga del siguiente
  //    bundle en background). Si falla, la app sigue funcionando con la versión
  //    actual sin interrumpir al usuario.
  CapacitorUpdater.notifyAppReady().catch(() => {});

  // 2. Escuchar eventos del updater.
  CapacitorUpdater.addListener("updateAvailable", () => {
    // Se detectó un bundle nuevo. Se descarga en segundo plano automáticamente.
  });

  CapacitorUpdater.addListener("downloadComplete", async () => {
    // Bundle nuevo descargado. Se aplicará al SIGUIENTE arranque (no forzamos
    // un reload inmediato para no interrumpir al usuario a mitad de una serie).
  });

  // 3. Si hay un update pendiente, se aplica al volver del background
  //    (configurado en capacitor.config.json: resetWhenUpdate + autoUpdate).
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      // No forzamos nada; el plugin gestiona la transición internamente.
    }
  });
}
