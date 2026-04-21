/**
 * dashboard-page.js — Inicializador de la página principal (Dashboard)
 *
 * Orquesta las estadísticas globales, la tabla de actividades recientes
 * y los accesos rápidos para crear proyectos, actividades, recursos e hitos.
 *
 * Importa:
 *   - ui.js            → initAppShell (registra listeners del modal)
 *   - dashboard-stats.js → registra <dashboard-stats>
 *   - dashboard-recent.js → renderRecentActivities
 *   - projects/index.js  → openNew (nuevo proyecto)
 *   - resources/index.js → openNew (nuevo recurso)
 *   - activities/index.js→ openNewActivity, openNewMilestone
 *
 * Exporta: initDashboardPage
 * Llamado desde: index.js (boot)
 */

import { initAppShell } from '../core/ui.js';
import './dashboard-stats.js';
import { renderRecentActivities } from './dashboard-recent.js';
import { openNew as openNewProject }             from '../projects/index.js';
import { openNew as openNewResource }            from '../resources/index.js';
import { openNewActivity, openNewMilestone }     from '../activities/index.js';

/**
 * Refresca todas las secciones del dashboard.
 * → Llamada interna al inicializar la página.
 */
function renderDashboard() {
  document.querySelector('dashboard-stats')?.render();
  renderRecentActivities();
}

/**
 * Inicializa el dashboard: shell del modal, estadísticas y accesos rápidos.
 * Verifica que exista el contenedor `#recent-activities` antes de continuar.
 * → Llamado automáticamente por index.js cuando el DOM está listo.
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
