import './projects-page.js';
import { initProjectsPage } from './projects-page.js';

export { openNew } from './projects-form.js';

/**
 * Ejecuta el arranque del módulo cuando la página ya está disponible.
 */
function boot() {
  initProjectsPage();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
