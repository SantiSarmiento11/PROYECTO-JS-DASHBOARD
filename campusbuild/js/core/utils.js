import Storage from './storage.js';

export function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function formatDate(str) {
  if (!str) return '—';
  const [year, month, day] = str.split('-');
  return `${day}/${month}/${year}`;
}

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

export function activityEndDate(activity) {
  const duration = Math.max(1, Number(activity?.duracion || 1));
  return addDays(activity?.fechaInicio, duration - 1);
}

export function milestoneIsCompleted(milestone, activities = Storage.getAll('activities')) {
  const assocIds = milestone?.activityIds || [];
  const assocActs = activities.filter(activity => assocIds.includes(activity.id));
  return assocActs.length > 0 && assocActs.every(activity => activity.estado === 'terminada');
}

export function resolveMilestoneDate(milestone, activities = Storage.getAll('activities')) {
  if (milestone?.fecha) return milestone.fecha;
  const assocIds = milestone?.activityIds || [];
  const assocActs = activities.filter(activity => assocIds.includes(activity.id));
  if (!assocActs.length) return '';
  return assocActs.map(activityEndDate).filter(Boolean).sort().at(-1) || '';
}

export function getProjectCompletion(projectId) {
  const activities = Storage.getAll('activities').filter(activity => activity.projectId === projectId);
  const milestones = Storage.getAll('milestones').filter(milestone => milestone.projectId === projectId);
  const activitiesDone = activities.filter(activity => activity.estado === 'terminada').length;
  const milestonesDone = milestones.filter(milestone => milestoneIsCompleted(milestone, activities)).length;
  const allActivitiesDone = activities.length > 0 && activitiesDone === activities.length;
  const allMilestonesDone = milestones.length === 0 || milestonesDone === milestones.length;

  return {
    activitiesTotal: activities.length,
    activitiesDone,
    milestonesTotal: milestones.length,
    milestonesDone,
    canFinish: allActivitiesDone && allMilestonesDone
  };
}

export function syncProjectStatus(projectId) {
  const project = Storage.getById('projects', projectId);
  if (!project) return null;

  const summary = getProjectCompletion(projectId);
  if (!project.estado) {
    return Storage.update('projects', projectId, { estado: 'activo', fechaTerminado: null });
  }
  if (project.estado === 'terminado' && !summary.canFinish) {
    return Storage.update('projects', projectId, { estado: 'activo', fechaTerminado: null });
  }
  return project;
}
