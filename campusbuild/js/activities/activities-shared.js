/**
 * activities-shared.js — Helpers compartidos del módulo de actividades
 *
 * Exporta utilidades reutilizables entre activity-form.js, activity-list.js,
 * milestone-form.js, milestone-list.js y dashboard-stats.js.
 * Importa: utils.js → syncProjectStatus
 */

import { syncProjectStatus } from '../core/utils.js';

/**
 * Genera el HTML del badge de estado de una actividad.
 * → Usado en activity-list.js y dashboard-recent.js.
 * @param {string} state - 'pendiente' | 'en-proceso' | 'terminada'
 * @returns {string} HTML del badge con clase y texto apropiados
 */
export function estadoBadge(state) {
  const CSS = {
    pendiente  : 'badge-pending',
    'en-proceso': 'badge-progress',
    terminada  : 'badge-done'
  };
  const LABELS = {
    pendiente  : 'Pendiente',
    'en-proceso': 'En Proceso',
    terminada  : 'Terminada'
  };
  return `<span class="badge ${CSS[state] || 'badge-pending'}">${LABELS[state] || state}</span>`;
}

/**
 * Sincroniza el estado del proyecto afectado y vuelve a renderizar
 * todos los Web Components que dependen de actividades e hitos.
 * → Llamado desde activity-form.js y milestone-form.js tras guardar o eliminar.
 * @param {string} [projectId] - ID del proyecto cuyo estado debe actualizarse
 */
export function refreshActivityViews(projectId = '') {
  if (projectId) syncProjectStatus(projectId);
  document.querySelector('activity-list')?.render();
  document.querySelector('milestone-list')?.render();
  document.querySelector('project-list')?.render?.();
  document.querySelector('dashboard-stats')?.render?.();
  document.querySelector('activity-calendar')?.render?.();
}
