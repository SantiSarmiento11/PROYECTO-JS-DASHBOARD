import Storage from '../core/storage.js';
import { escapeHtml, formatDate, resolveMilestoneDate, milestoneIsCompleted } from '../core/utils.js';
import { icon } from '../core/ui.js';
import { confirmDeleteMilestone, openEditMilestone } from './milestone-form.js';

/**
 * Lista los hitos del proyecto y su avance actual.
 */
class MilestoneList extends HTMLElement {
  connectedCallback() {
    if (!this.dataset.bound) {
      this.dataset.bound = 'true';
      this.addEventListener('click', event => {
        const actionButton = event.target.closest('[data-action]');
        if (!actionButton) return;

        const { action, milestoneId } = actionButton.dataset;
        if (action === 'edit') openEditMilestone(milestoneId);
        if (action === 'delete') confirmDeleteMilestone(milestoneId);
      });
    }

    this.render();
  }

  /**
   * Pinta la tabla de hitos y su relación con actividades.
   */
  render() {
    const milestones = Storage.getAll('milestones');
    const activities = Storage.getAll('activities');
    const projects = Storage.getAll('projects');

    if (!milestones.length) {
      this.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">${icon('trophy')}</div>
          <p>No hay hitos definidos. Crea uno usando el botón <strong>Nuevo Hito</strong>.</p>
        </div>`;
      return;
    }

    this.innerHTML = `
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Hito</th>
              <th>Proyecto</th>
              <th>Actividades asociadas</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${milestones.map(milestone => {
              const project = projects.find(item => item.id === milestone.projectId);
              const linkedActivities = activities.filter(activity => (milestone.activityIds || []).includes(activity.id));
              const isCompleted = milestoneIsCompleted(milestone, activities);
              const details = [escapeHtml(milestone.descripcion || '')].filter(Boolean).join(' · ');

              return `
                <tr class="${isCompleted ? 'milestone-row completed' : 'milestone-row'}">
                  <td><strong>${escapeHtml(milestone.nombre)}</strong><br><small style="color:var(--color-muted)">${formatDate(resolveMilestoneDate(milestone, activities))}${details ? ` · ${details}` : ''}</small></td>
                  <td>${project ? escapeHtml(project.nombre) : '—'}</td>
                  <td style="max-width:220px;font-size:12px;">
                    ${linkedActivities.length ? linkedActivities.map(activity => `<span style="display:inline-block;background:var(--color-bg);border-radius:4px;padding:1px 7px;margin:2px;">${escapeHtml(activity.nombre)}</span>`).join('') : '<em style="color:var(--color-muted)">Sin actividades</em>'}
                  </td>
                  <td>${isCompleted ? `<span class="badge badge-milestone-ok">${icon('check')} Cumplido</span>` : `<span class="badge badge-milestone-no">${icon('pending')} Pendiente</span>`}</td>
                  <td style="display:flex;gap:4px;align-items:center;">
                    <button class="btn-icon" title="Editar" aria-label="Editar" data-action="edit" data-milestone-id="${milestone.id}">${icon('edit')}</button>
                    <button class="btn-icon" title="Eliminar" aria-label="Eliminar" data-action="delete" data-milestone-id="${milestone.id}">${icon('trash')}</button>
                  </td>
                </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>`;
  }
}

if (!customElements.get('milestone-list')) {
  customElements.define('milestone-list', MilestoneList);
}
