/**
 * index.js — Punto de entrada del módulo de Dashboard
 *
 * Arranca la página principal cuando el DOM está listo.
 * No re-exporta funciones: el dashboard no expone APIs hacia otros módulos.
 */

import { initDashboardPage } from './dashboard-page.js';

/** Ejecuta el arranque cuando el DOM está disponible. */
function boot() {
  initDashboardPage();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
