/**
 * index.js — Punto de entrada del módulo de Actividades
 *
 * Arranca la página de actividades cuando el DOM está listo.
 * Re-exporta las funciones que otros módulos (dashboard-page.js) necesitan
 * para abrir formularios desde fuera del módulo de actividades.
 *
 * Exporta: openNewActivity (→ activity-form.js), openNewMilestone (→ milestone-form.js)
 */

import { initActivitiesPage } from './activities-page.js';

export { openNewActivity }  from './activity-form.js';
export { openNewMilestone } from './milestone-form.js';

/** Ejecuta el arranque cuando el DOM está disponible. */
function boot() {
  initActivitiesPage();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
