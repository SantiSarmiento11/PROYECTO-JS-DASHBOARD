/**
 * utils.js — Funciones de utilidad y lógica de negocio compartida
 *
 * Exporta helpers de texto, fechas y cálculos de estado del proyecto.
 * Importa: storage.js
 * Usado por: projects-form.js, projects-view.js, activity-form.js,
 *            milestone-form.js, milestone-list.js, dashboard-stats.js,
 *            calendar-view.js, activities-shared.js
 */

import Storage from './storage.js';

// ─── Texto y fechas ─────────────────────────────────────────────────────────

/**
 * Sanitiza una cadena para insertarla de forma segura en HTML.
 * Escapa los caracteres: & < > "
 * @param {string} str
 * @returns {string}
 */
export function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Convierte una fecha ISO 'YYYY-MM-DD' al formato legible 'DD/MM/YYYY'.
 * @param {string} str - Fecha en formato YYYY-MM-DD
 * @returns {string} Fecha formateada o '—' si no se recibe valor
 */
export function formatDate(str) {
  if (!str) return '—';
  const [year, month, day] = str.split('-');
  return `${day}/${month}/${year}`;
}

/**
 * Suma `days` días a una fecha expresada como string 'YYYY-MM-DD'.
 * Función interna, no exportada.
 * @param {string} dateStr
 * @param {number} days
 * @returns {string} Nueva fecha en formato 'YYYY-MM-DD' o '' si no hay fecha
 */
function addDays(dateStr, days) {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  const base = new Date(year, month - 1, day);
  base.setDate(base.getDate() + days);
  return [
    base.getFullYear(),
    String(base.getMonth() + 1).padStart(2, '0'),
    String(base.getDate()).padStart(2, '0')
  ].join('-');
}

/**
 * Calcula la fecha de fin de una actividad sumando su duración a la fecha de inicio.
 * → Usado en calendar-view.js y resolveMilestoneDate.
 * @param {object} activity - Registro de actividad con `fechaInicio` y `duracion`
 * @returns {string} Fecha fin en formato 'YYYY-MM-DD'
 */
export function activityEndDate(activity) {
  const duration = Math.max(1, Number(activity?.duracion || 1));
  return addDays(activity?.fechaInicio, duration - 1);
}

// ─── Lógica de hitos ────────────────────────────────────────────────────────

/**
 * Determina si un hito está cumplido: todas sus actividades asociadas
 * deben tener estado 'terminada'.
 * → Usado en milestone-list.js, dashboard-stats.js y calendar-view.js.
 * @param {object} milestone - Registro de hito con `activityIds`
 * @param {object[]} [activities] - Lista de actividades (se carga desde Storage si se omite)
 * @returns {boolean}
 */
export function milestoneIsCompleted(milestone, activities = Storage.getAll('activities')) {
  const linked = activities.filter(a => (milestone?.activityIds || []).includes(a.id));
  return linked.length > 0 && linked.every(a => a.estado === 'terminada');
}

/**
 * Resuelve la fecha de un hito: usa `milestone.fecha` si existe,
 * o calcula la mayor fecha de fin entre sus actividades asociadas.
 * → Usado en milestone-list.js y calendar-view.js.
 * @param {object} milestone
 * @param {object[]} [activities]
 * @returns {string} Fecha en formato 'YYYY-MM-DD' o ''
 */
export function resolveMilestoneDate(milestone, activities = Storage.getAll('activities')) {
  if (milestone?.fecha) return milestone.fecha;
  const linked = activities.filter(a => (milestone?.activityIds || []).includes(a.id));
  if (!linked.length) return '';
  return linked.map(activityEndDate).filter(Boolean).sort().at(-1) || '';
}

// ─── Progreso de proyectos ────────────────────────────────────────────────────

/**
 * Calcula el resumen de avance de un proyecto: cuántas actividades e hitos
 * están terminados y si el proyecto puede marcarse como finalizado.
 * → Usado en projects-form.js (finishProject) y projects-view.js.
 * @param {string} projectId
 * @returns {{ activitiesTotal, activitiesDone, milestonesTotal, milestonesDone, canFinish }}
 */
export function getProjectCompletion(projectId) {
  const activities = Storage.getAll('activities').filter(a => a.projectId === projectId);
  const milestones = Storage.getAll('milestones').filter(m => m.projectId === projectId);
  const activitiesDone = activities.filter(a => a.estado === 'terminada').length;
  const milestonesDone = milestones.filter(m => milestoneIsCompleted(m, activities)).length;

  return {
    activitiesTotal : activities.length,
    activitiesDone,
    milestonesTotal : milestones.length,
    milestonesDone,
    canFinish : activities.length > 0 && activitiesDone === activities.length
             && (milestones.length === 0 || milestonesDone === milestones.length)
  };
}

/**
 * Revisa si un proyecto marcado como 'terminado' sigue cumpliendo los requisitos;
 * si no, lo revierte a 'activo'. No cambia proyectos que nunca tuvieron estado.
 * → Llamado desde projects-view.js al renderizar cada tarjeta de proyecto.
 * @param {string} projectId
 * @returns {object|null} Proyecto actualizado o `null` si no existe
 */
export function syncProjectStatus(projectId) {
  const project = Storage.getById('projects', projectId);
  if (!project) return null;

  // Si nunca se asignó un estado, inicializa como 'activo'
  if (!project.estado) {
    return Storage.update('projects', projectId, { estado: 'activo', fechaTerminado: null });
  }

  // Si está marcado como terminado pero ya no cumple los requisitos, lo revierte
  const { canFinish } = getProjectCompletion(projectId);
  if (project.estado === 'terminado' && !canFinish) {
    return Storage.update('projects', projectId, { estado: 'activo', fechaTerminado: null });
  }

  return project;
}
