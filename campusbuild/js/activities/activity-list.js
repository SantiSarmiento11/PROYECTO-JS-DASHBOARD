import Storage from '../core/storage.js';
import { escapeHtml, formatDate } from '../core/utils.js';
import { icon } from '../core/ui.js';
import { estadoBadge } from './activities-shared.js';
import { confirmDeleteActivity, openEditActivity } from './activity-form.js';

/**
 * Lista tabular de actividades con acciones de edición y borrado.
 */
class ActivityList extends HTMLElement {
  connectedCallback() {
    if (!this.dataset.bound) {
      this.dataset.bound = 'true';
      this.addEventListener('click', event => {
        const actionButton = event.target.closest('[data-action]');
        if (!actionButton) return;

        const { action, activityId } = actionButton.dataset;
        if (action === 'edit') openEditActivity(activityId);
        if (action === 'delete') confirmDeleteActivity(activityId);
      });
    }

    this.render();
  }

  /**
   * Dibuja la tabla principal de actividades.
   */
  render() {
    const activities = Storage.getAll('activities');
    const projects = Storage.getAll('projects');
    const resources = Storage.getAll('resources');

    if (!activities.length) {
      this.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">${icon('activities')}</div>
          <p>No hay actividades registradas. Crea una usando el botón <strong>Nueva Actividad</strong>.</p>
        </div>`;
      return;
    }

    this.innerHTML = `
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Actividad</th>
              <th>Proyecto</th>
              <th>Responsable</th>
              <th>Inicio</th>
              <th>Duración</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${activities.map(activity => {
              const project = projects.find(item => item.id === activity.projectId);
              const resource = resources.find(item => item.id === activity.responsableId);

              return `
                <tr>
                  <td><strong>${escapeHtml(activity.nombre)}</strong></td>
                  <td>${project ? escapeHtml(project.nombre) : '<em style="color:var(--color-muted)">Sin proyecto</em>'}</td>
                  <td>${resource ? escapeHtml(resource.nombre) : '<em style="color:var(--color-muted)">—</em>'}</td>
                  <td>${formatDate(activity.fechaInicio)}</td>
                  <td>${activity.duracion} día(s)</td>
                  <td>${estadoBadge(activity.estado)}</td>
                  <td style="display:flex;gap:4px;align-items:center;">
                    <button class="btn-icon" title="Editar" aria-label="Editar" data-action="edit" data-activity-id="${activity.id}">${icon('edit')}</button>
                    <button class="btn-icon" title="Eliminar" aria-label="Eliminar" data-action="delete" data-activity-id="${activity.id}">${icon('trash')}</button>
                  </td>
                </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>`;
  }
}

if (!customElements.get('activity-list')) {
  customElements.define('activity-list', ActivityList);
}
