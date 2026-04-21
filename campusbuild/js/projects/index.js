/**
 * index.js — Punto de entrada del módulo de Proyectos
 *
 * Arranca la página de proyectos cuando el DOM está listo.
 * Re-exporta `openNew` para que dashboard-page.js pueda abrir el formulario.
 *
 * Exporta: openNew (→ projects-form.js)
 */

import { initProjectsPage } from './projects-page.js';

export { openNew } from './projects-form.js';

/** Ejecuta el arranque cuando el DOM está disponible. */
function boot() {
  initProjectsPage();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
