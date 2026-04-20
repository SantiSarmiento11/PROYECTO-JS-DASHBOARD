import './dashboard-page.js';
import { initDashboardPage } from './dashboard-page.js';

/**
 * Ejecuta el arranque del módulo de dashboard.
 */
function boot() {
  initDashboardPage();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
