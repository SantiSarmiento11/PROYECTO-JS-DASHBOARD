import './calendar-page.js';
import { initCalendarPage } from './calendar-page.js';

/**
 * Ejecuta el arranque del módulo de calendario.
 */
function boot() {
  initCalendarPage();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
