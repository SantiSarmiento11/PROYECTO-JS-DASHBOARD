import { syncProjectStatus } from '../core/utils.js';

/**
 * Genera el badge visual a partir del estado de una actividad.
 */
export function estadoBadge(state) {
  const styles = {
    pendiente: 'badge-pending',
    'en-proceso': 'badge-progress',
    terminada: 'badge-done'
  };
  const labels = {
    pendiente: 'Pendiente',
    'en-proceso': 'En Proceso',
    terminada: 'Terminada'
  };

  return `<span class="badge ${styles[state] || 'badge-pending'}">${labels[state] || state}</span>`;
}

/**
 * Sincroniza y repinta todas las vistas dependientes de actividades e hitos.
 */
export function refreshActivityViews(projectId = '') {
  if (projectId) syncProjectStatus(projectId);
  document.querySelector('activity-list')?.render();
  document.querySelector('milestone-list')?.render();
  document.querySelector('project-list')?.render?.();
  document.querySelector('dashboard-stats')?.render?.();
  document.querySelector('activity-calendar')?.render?.();
}
