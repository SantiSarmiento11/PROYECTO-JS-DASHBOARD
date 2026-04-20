import './activities-page.js';
import { initActivitiesPage } from './activities-page.js';

export { openNewActivity } from './activity-form.js';
export { openNewMilestone } from './milestone-form.js';

/**
 * Ejecuta el arranque del módulo de actividades.
 */
function boot() {
  initActivitiesPage();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
