import Storage from '../core/storage.js';
import { getProjectCompletion, syncProjectStatus, formatDate, escapeHtml } from '../core/utils.js';
import { icon } from '../core/ui.js';
import { confirmDelete, finishProject, openEdit } from './projects-form.js';

/**
 * Refresca las vistas que dependen del estado actual de los proyectos.
 */
export function refreshProjectViews() {
  document.querySelector('project-list')?.render();
  document.querySelector('dashboard-stats')?.render?.();
  document.querySelector('activity-calendar')?.render?.();
}

/**
 * Lista visual de proyectos y sus acciones principales.
 */
class ProjectList extends HTMLElement {
  connectedCallback() {
    if (!this.dataset.bound) {
      this.dataset.bound = 'true';
      this.addEventListener('click', event => {
        const actionButton = event.target.closest('[data-action]');
        if (!actionButton) return;

        const { action, projectId } = actionButton.dataset;
        if (action === 'edit') openEdit(projectId);
        if (action === 'delete') confirmDelete(projectId);
        if (action === 'finish') finishProject(projectId);
      });
    }

    this.render();
  }

  /**
   * Pinta las tarjetas de proyecto con su estado y resumen.
   */
  render() {
    const projects = Storage.getAll('projects');
    const activities = Storage.getAll('activities');

    if (!projects.length) {
      this.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">${icon('project')}</div>
          <p>No hay proyectos registrados. Haz clic en <strong>Nuevo Proyecto</strong> para comenzar.</p>
        </div>`;
      return;
    }

    this.innerHTML = `
      <div class="project-cards">
        ${projects.map(project => {
          const current = syncProjectStatus(project.id) || project;
          const projectActivities = activities.filter(activity => activity.projectId === project.id);
          const completedActivities = projectActivities.filter(activity => activity.estado === 'terminada').length;
          const summary = getProjectCompletion(project.id);
          const isFinished = current.estado === 'terminado';

          return `
            <div class="project-card">
              <div class="project-card-header">
                <div>
                  <div class="project-card-title">${icon('activities')} <span>${escapeHtml(current.nombre)}</span></div>
                  <div class="project-card-status">
                    <span class="badge ${isFinished ? 'badge-project-done' : 'badge-project-active'}">${isFinished ? 'Terminado' : 'Activo'}</span>
                  </div>
                </div>
                <div style="display:flex;gap:4px;">
                  <button class="btn-icon" title="Editar" aria-label="Editar" data-action="edit" data-project-id="${current.id}">${icon('edit')}</button>
                  <button class="btn-icon" title="Eliminar" aria-label="Eliminar" data-action="delete" data-project-id="${current.id}">${icon('trash')}</button>
                </div>
              </div>
              <div class="project-card-desc">${escapeHtml(current.descripcion || '—')}</div>
              <div class="project-card-meta">
                <span>${icon('calendar')} Inicio: ${formatDate(current.fechaInicio)}</span>
                <span>${icon('flag')} Fin: ${formatDate(current.fechaFin)}</span>
              </div>
              <div class="project-card-meta">
                <span>${icon('chart')} Actividades: ${projectActivities.length} | Terminadas: ${completedActivities}</span>
                <span>${icon('trophy')} Hitos: ${summary.milestonesDone}/${summary.milestonesTotal}</span>
              </div>
              <div class="project-card-actions">
                <button class="btn btn-ghost btn-sm" data-action="finish" data-project-id="${current.id}" ${isFinished || !summary.canFinish ? 'disabled' : ''}>
                  ${icon('check')} ${isFinished ? 'Proyecto terminado' : 'Terminar proyecto'}
                </button>
              </div>
            </div>`;
        }).join('')}
      </div>`;
  }
}

if (!customElements.get('project-list')) {
  customElements.define('project-list', ProjectList);
}
