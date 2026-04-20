import './resources-page.js';
import { initResourcesPage } from './resources-page.js';

export { openNew } from './resources-form.js';

/**
 * Lanza el arranque del módulo de recursos.
 */
function boot() {
  initResourcesPage();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
