/**
 * activities-page.js — Inicializador de la página de Actividades
 *
 * Registra los Web Components, configura el shell (modal) y conecta
 * los botones de creación a sus respectivos formularios.
 * Importa: ui.js, activity-list.js, milestone-list.js, activity-form.js, milestone-form.js
 * Exporta: initActivitiesPage
 * Llamado desde: index.js (boot)
 */

import { initAppShell } from '../core/ui.js';
import './activity-list.js';
import './milestone-list.js';
import { openNewActivity } from './activity-form.js';
import { openNewMilestone } from './milestone-form.js';

/**
 * Inicializa la página de actividades e hitos.
 * Verifica que exista el componente <activity-list> antes de continuar.
 * → Llamado automáticamente por index.js cuando el DOM está listo.
 */
export function initActivitiesPage() {
  if (!document.querySelector('activity-list')) return;

  initAppShell();
  document.getElementById('btn-new-activity')?.addEventListener('click', openNewActivity);
  document.getElementById('btn-new-milestone')?.addEventListener('click', openNewMilestone);
  document.querySelector('activity-list')?.render();
  document.querySelector('milestone-list')?.render();
}
