// ============================================================
//  activities.js  –  Web Components <activity-list> y <milestone-list>
//  Gestiona el CRUD de actividades e hitos. Depende de Storage
//  y de las utilidades de app.js. Los hitos se consideran
//  cumplidos cuando todas sus actividades asociadas terminan.
// ============================================================
import Storage from './storage.js';
import {
  showToast,
  formatDate,
  openModal,
  closeModal,
  icon,
  resolveMilestoneDate,
  milestoneIsCompleted,
  syncProjectStatus,
} from './app.js';

// ── Helper ────────────────────────────────────────────────────
function _esc(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  
  /**Genera el HTML de un badge con la clase y etiqueta del estado. Estados válidos: 'pendiente' | 'en-proceso' | 'terminada'.
   */
function estadoBadge(e) {
    const map = { pendiente: 'badge-pending', 'en-proceso': 'badge-progress', terminada: 'badge-done' };
    const label = { pendiente: 'Pendiente', 'en-proceso': 'En Proceso', terminada: 'Terminada' };
    return `<span class="badge ${map[e] || 'badge-pending'}">${label[e] || e}</span>`;
}
  
function refreshProjectDependencies(projectId = '') {
    if (projectId) syncProjectStatus(projectId);
    document.querySelector('activity-list')?.render();
    document.querySelector('milestone-list')?.render();
    document.querySelector('project-list')?.render?.();
    document.querySelector('dashboard-stats')?.render?.();
    document.querySelector('activity-calendar')?.render?.();
}

function renderMilestoneActivities(projectId, assocIds = [], activities = Storage.getAll('activities')) {
    const scopedActivities = projectId ? activities.filter(a => a.projectId === projectId) : [];
  
    if (!projectId) {
      return '<em style="color:var(--color-muted);font-size:13px;">Selecciona primero un proyecto.</em>';
    }
    if (!scopedActivities.length) {
      return '<em style="color:var(--color-muted);font-size:13px;">Este proyecto no tiene actividades creadas.</em>';
    }
  
    return scopedActivities.map(a => `
      <label style="display:flex;align-items:center;gap:8px;padding:4px 0;font-size:13px;cursor:pointer;">
        <input type="checkbox" value="${a.id}" ${assocIds.includes(a.id) ? 'checked' : ''} class="ms-act-check">
        ${_esc(a.nombre)}
      </label>`).join('');
}
  
  // ── Web Component: <activity-list> ───────────────────────────
  /**
   * Tabla de actividades con proyecto, responsable y estado.
   * El responsable se resuelve cruzando `responsableId` con resources.
   * Botones de edición/eliminación invocan ActivitiesModule (window).
   */

class ActivityList extends HTMLElement {
    connectedCallback() { this.render(); }
  
    render() {
      const activities = Storage.getAll('activities');
      const projects = Storage.getAll('projects');
      const resources = Storage.getAll('resources');
  
      if (activities.length === 0) {
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
              ${activities.map(a => {
        const proj = projects.find(p => p.id === a.projectId);
        const res = resources.find(r => r.id === a.responsableId);
        return `
                  <tr>
                    <td><strong>${_esc(a.nombre)}</strong></td>
                    <td>${proj ? _esc(proj.nombre) : '<em style="color:var(--color-muted)">Sin proyecto</em>'}</td>
                    <td>${res ? _esc(res.nombre) : '<em style="color:var(--color-muted)">—</em>'}</td>
                    <td>${formatDate(a.fechaInicio)}</td>
                    <td>${a.duracion} día(s)</td>
                    <td>${estadoBadge(a.estado)}</td>
                    <td style="display:flex;gap:4px;align-items:center;">
                      <button class="btn-icon" title="Editar" aria-label="Editar" onclick="ActivitiesModule.openEdit('${a.id}')">${icon('edit')}</button>
                      <button class="btn-icon" title="Eliminar" aria-label="Eliminar" onclick="ActivitiesModule.confirmDelete('${a.id}')">${icon('trash')}</button>
                    </td>
                  </tr>`;
      }).join('')}
            </tbody>
          </table>
        </div>`;
    }
}
customElements.define('activity-list', ActivityList);
  
  