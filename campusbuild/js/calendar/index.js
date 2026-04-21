/**
 * index.js — Punto de entrada del módulo de Calendario
 *
 * Arranca la página del cronograma cuando el DOM está listo.
 * No re-exporta funciones: el calendario no expone APIs hacia otros módulos.
 */

import { initCalendarPage } from './calendar-page.js';

/** Ejecuta el arranque cuando el DOM está disponible. */
function boot() {
  initCalendarPage();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
