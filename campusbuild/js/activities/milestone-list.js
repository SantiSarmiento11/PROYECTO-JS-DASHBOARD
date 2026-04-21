/**
 * milestone-list.js — Web Component <milestone-list>
 *
 * Muestra la tabla de hitos y su estado de cumplimiento.
 * Importa: storage.js, utils.js, ui.js, milestone-form.js
 */

import Storage from '../core/storage.js';
import { escapeHtml, formatDate, resolveMilestoneDate, milestoneIsCompleted } from '../core/utils.js';
import { icon } from '../core/ui.js';
import { confirmDeleteMilestone, openEditMilestone } from './milestone-form.js';

/**
 * Web Component que muestra la lista de hitos en una tabla.
 * Expone `render()` para que activities-shared.refreshActivityViews lo refresque.
 */
class MilestoneList extends HTMLElement {
  /**
   * Se ejecuta al insertar el componente en el DOM.
   * Registra el listener de clics una sola vez y pinta la lista inicial.
   */
  connectedCallback() {
    if (!this.dataset.bound) {
      this.dataset.bound = 'true';
      // Delegación de eventos: un listener en el componente maneja todos los botones
      this.addEventListener('click', event => {
        const btn = event.target.closest('[data-action]');
        if (!btn) return;
        const { action, milestoneId } = btn.dataset;
        if (action === 'edit')   openEditMilestone(milestoneId);
        if (action === 'delete') confirmDeleteMilestone(milestoneId);
      });
    }
    this.render();
  }

  /**
   * Construye y pinta la tabla de hitos con su estado y actividades vinculadas.
   * Cruza los datos de Storage en una sola pasada por el array de hitos.
   * → Llamado en connectedCallback y desde activities-shared.refreshActivityViews.
   */
  render() {
    const milestones = Storage.getAll('milestones');
    const activities = Storage.getAll('activities');
    const projects   = Storage.getAll('projects');

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
              const project         = projects.find(p => p.id === milestone.projectId);
              const linkedActivities= activities.filter(a => (milestone.activityIds || []).includes(a.id));
              const isCompleted     = milestoneIsCompleted(milestone, activities);
              const details         = escapeHtml(milestone.descripcion || '');
              const dateStr         = formatDate(resolveMilestoneDate(milestone, activities));

              return `
                <tr class="milestone-row${isCompleted ? ' completed' : ''}">
                  <td>
                    <strong>${escapeHtml(milestone.nombre)}</strong><br>
                    <small style="color:var(--color-muted)">${dateStr}${details ? ` · ${details}` : ''}</small>
                  </td>
                  <td>${project ? escapeHtml(project.nombre) : '—'}</td>
                  <td style="max-width:220px;font-size:12px;">
                    ${linkedActivities.length
                      ? linkedActivities.map(a => `<span style="display:inline-block;background:var(--color-bg);border-radius:4px;padding:1px 7px;margin:2px;">${escapeHtml(a.nombre)}</span>`).join('')
                      : '<em style="color:var(--color-muted)">Sin actividades</em>'}
                  </td>
                  <td>${isCompleted
                    ? `<span class="badge badge-milestone-ok">${icon('check')} Cumplido</span>`
                    : `<span class="badge badge-milestone-no">${icon('pending')} Pendiente</span>`}
                  </td>
                  <td style="display:flex;gap:4px;align-items:center;">
                    <button class="btn-icon" title="Editar"   aria-label="Editar"   data-action="edit"   data-milestone-id="${milestone.id}">${icon('edit')}</button>
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
