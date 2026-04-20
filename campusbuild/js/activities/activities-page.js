import { initAppShell } from '../core/ui.js';
import './activity-list.js';
import './milestone-list.js';
import { openNewActivity } from './activity-form.js';
import { openNewMilestone } from './milestone-form.js';

/**
 * Inicializa la página de actividades e hitos.
 */
export function initActivitiesPage() {
  if (!document.querySelector('activity-list')) return;

  initAppShell();
  document.getElementById('btn-new-activity')?.addEventListener('click', openNewActivity);
  document.getElementById('btn-new-milestone')?.addEventListener('click', openNewMilestone);
  document.querySelector('activity-list')?.render();
  document.querySelector('milestone-list')?.render();
}
