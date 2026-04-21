/**
 * index.js — Punto de entrada del módulo de Recursos Humanos
 *
 * Arranca la página de recursos cuando el DOM está listo.
 * Re-exporta `openNew` para que dashboard-page.js abra el formulario desde fuera.
 *
 * Exporta: openNew (→ resources-form.js)
 */

import { initResourcesPage } from './resources-page.js';

export { openNew } from './resources-form.js';

/** Ejecuta el arranque cuando el DOM está disponible. */
function boot() {
  initResourcesPage();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
