import { initAppShell } from '../core/ui.js';
import './dashboard-stats.js';
import { renderRecentActivities } from './dashboard-recent.js';
import { openNew as openNewProject } from '../projects/index.js';
import { openNew as openNewResource } from '../resources/index.js';
import { openNewActivity, openNewMilestone } from '../activities/index.js';

/**
 * Refresca el dashboard completo.
 */
function renderDashboard() {
  document.querySelector('dashboard-stats')?.render();
  renderRecentActivities();
}

/**
 * Inicializa los accesos rápidos y el contenido del panel principal.
 */
export function initDashboardPage() {
  if (!document.getElementById('recent-activities')) return;

  initAppShell();
  renderDashboard();
  document.getElementById('btn-dashboard-new-project')?.addEventListener('click', openNewProject);
  document.getElementById('btn-dashboard-new-activity')?.addEventListener('click', openNewActivity);
  document.getElementById('btn-dashboard-new-resource')?.addEventListener('click', openNewResource);
  document.getElementById('btn-dashboard-new-milestone')?.addEventListener('click', openNewMilestone);
}
