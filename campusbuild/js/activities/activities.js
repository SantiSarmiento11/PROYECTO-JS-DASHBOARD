import Storage from '../core/storage.js';
import {
  escapeHtml,
  formatDate,
  resolveMilestoneDate,
  milestoneIsCompleted,
  syncProjectStatus
} from '../core/utils.js';
import { icon, showToast, openModal, closeModal, initAppShell } from '../core/ui.js';

function estadoBadge(state) {
  const styles = {
    pendiente: 'badge-pending',
    'en-proceso': 'badge-progress',
    terminada: 'badge-done'
  };
  const labels = {
    pendiente: 'Pendiente',
    'en-proceso': 'En Proceso',
    terminada: 'Terminada'
  };
  return `<span class="badge ${styles[state] || 'badge-pending'}">${labels[state] || state}</span>`;
}

function refreshViews(projectId = '') {
  if (projectId) syncProjectStatus(projectId);
  document.querySelector('activity-list')?.render();
  document.querySelector('milestone-list')?.render();
  document.querySelector('project-list')?.render?.();
  document.querySelector('dashboard-stats')?.render?.();
  document.querySelector('activity-calendar')?.render?.();
}

function renderMilestoneActivities(projectId, selectedIds = []) {
  const activities = projectId ? Storage.getAll('activities').filter(activity => activity.projectId === projectId) : [];
  if (!projectId) return '<em style="color:var(--color-muted);font-size:13px;">Selecciona primero un proyecto.</em>';
  if (!activities.length) return '<em style="color:var(--color-muted);font-size:13px;">Este proyecto no tiene actividades creadas.</em>';

  return activities.map(activity => `
    <label style="display:flex;align-items:center;gap:8px;padding:4px 0;font-size:13px;cursor:pointer;">
      <input type="checkbox" value="${activity.id}" ${selectedIds.includes(activity.id) ? 'checked' : ''} class="ms-act-check">
      ${escapeHtml(activity.nombre)}
    </label>`).join('');
}

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
              const assocActs = activities.filter(activity => (milestone.activityIds || []).includes(activity.id));
              const allDone = milestoneIsCompleted(milestone, activities);
              const details = [escapeHtml(milestone.descripcion || '')].filter(Boolean).join(' · ');

              return `
                <tr class="${allDone ? 'milestone-row completed' : 'milestone-row'}">
                  <td><strong>${escapeHtml(milestone.nombre)}</strong><br><small style="color:var(--color-muted)">${formatDate(resolveMilestoneDate(milestone, activities))}${details ? ` · ${details}` : ''}</small></td>
                  <td>${project ? escapeHtml(project.nombre) : '—'}</td>
                  <td style="max-width:220px;font-size:12px;">
                    ${assocActs.length ? assocActs.map(activity => `<span style="display:inline-block;background:var(--color-bg);border-radius:4px;padding:1px 7px;margin:2px;">${escapeHtml(activity.nombre)}</span>`).join('') : '<em style="color:var(--color-muted)">Sin actividades</em>'}
                  </td>
                  <td>${allDone ? `<span class="badge badge-milestone-ok">${icon('check')} Cumplido</span>` : `<span class="badge badge-milestone-no">${icon('pending')} Pendiente</span>`}</td>
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

if (!customElements.get('activity-list')) customElements.define('activity-list', ActivityList);
if (!customElements.get('milestone-list')) customElements.define('milestone-list', MilestoneList);

function buildActivityForm(activity = {}) {
  const projects = Storage.getAll('projects');
  const resources = Storage.getAll('resources');

  return `
    <div class="form-group">
      <label class="form-label">Nombre de la Actividad *</label>
      <input id="act-nombre" class="form-control" placeholder="Ej. Excavación de cimientos" value="${escapeHtml(activity.nombre || '')}">
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Proyecto *</label>
        <select id="act-project" class="form-control">
          <option value="">Seleccionar...</option>
          ${projects.map(project => `<option value="${project.id}" ${activity.projectId === project.id ? 'selected' : ''}>${escapeHtml(project.nombre)}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Responsable</label>
        <select id="act-responsable" class="form-control">
          <option value="">Sin asignar</option>
          ${resources.map(resource => `<option value="${resource.id}" ${activity.responsableId === resource.id ? 'selected' : ''}>${escapeHtml(resource.nombre)}</option>`).join('')}
        </select>
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Fecha de Inicio *</label>
        <input id="act-inicio" type="date" class="form-control" value="${activity.fechaInicio || ''}">
      </div>
      <div class="form-group">
        <label class="form-label">Duración estimada (días) *</label>
        <input id="act-duracion" type="number" min="1" class="form-control" placeholder="1" value="${activity.duracion || ''}">
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">Estado *</label>
      <select id="act-estado" class="form-control">
        <option value="pendiente" ${(activity.estado || 'pendiente') === 'pendiente' ? 'selected' : ''}>Pendiente</option>
        <option value="en-proceso" ${activity.estado === 'en-proceso' ? 'selected' : ''}>En Proceso</option>
        <option value="terminada" ${activity.estado === 'terminada' ? 'selected' : ''}>Terminada</option>
      </select>
    </div>`;
}

export function openNewActivity() {
  openModal({ title: 'Nueva Actividad', body: buildActivityForm(), onSave: () => saveActivity(null) });
}

function openEditActivity(id) {
  const activity = Storage.getById('activities', id);
  if (!activity) return;
  openModal({ title: 'Editar Actividad', body: buildActivityForm(activity), onSave: () => saveActivity(id) });
}

function saveActivity(id) {
  const nombre = document.getElementById('act-nombre').value.trim();
  const projectId = document.getElementById('act-project').value;
  const responsableId = document.getElementById('act-responsable').value;
  const fechaInicio = document.getElementById('act-inicio').value;
  const duracion = parseInt(document.getElementById('act-duracion').value, 10);
  const estado = document.getElementById('act-estado').value;

  if (!nombre || !projectId || !fechaInicio || !duracion) {
    showToast('Completa todos los campos requeridos.', 'danger');
    return;
  }

  const data = { nombre, projectId, responsableId: responsableId || null, fechaInicio, duracion, estado };
  if (id) {
    Storage.update('activities', id, data);
    showToast('Actividad actualizada.', 'success');
  } else {
    Storage.insert('activities', data);
    showToast('Actividad creada.', 'success');
  }

  closeModal();
  refreshViews(projectId);
}

function confirmDeleteActivity(id) {
  const activity = Storage.getById('activities', id);
  if (!activity) return;

  openModal({
    title: 'Eliminar Actividad',
    body: `<p>¿Eliminar la actividad <strong>${escapeHtml(activity.nombre)}</strong>?</p>`,
    saveLabel: 'Eliminar',
    saveCls: 'btn-danger',
    onSave: () => {
      Storage.getAll('milestones')
        .filter(milestone => (milestone.activityIds || []).includes(id))
        .forEach(milestone => {
          Storage.update('milestones', milestone.id, {
            activityIds: (milestone.activityIds || []).filter(activityId => activityId !== id)
          });
        });

      Storage.remove('activities', id);
      closeModal();
      refreshViews(activity.projectId);
      showToast('Actividad eliminada.', 'success');
    }
  });
}

function buildMilestoneForm(milestone = {}) {
  const projects = Storage.getAll('projects');
  const activities = Storage.getAll('activities');

  return `
    <div class="form-group">
      <label class="form-label">Nombre del Hito *</label>
      <input id="ms-nombre" class="form-control" placeholder="Ej. Finalización de cimientos" value="${escapeHtml(milestone.nombre || '')}">
    </div>
    <div class="form-group">
      <label class="form-label">Descripción</label>
      <input id="ms-desc" class="form-control" placeholder="Descripción breve..." value="${escapeHtml(milestone.descripcion || '')}">
    </div>
    <div class="form-group">
      <label class="form-label">Fecha del Hito *</label>
      <input id="ms-fecha" type="date" class="form-control" value="${resolveMilestoneDate(milestone, activities)}">
    </div>
    <div class="form-group">
      <label class="form-label">Proyecto *</label>
      <select id="ms-project" class="form-control">
        <option value="">Seleccionar...</option>
        ${projects.map(project => `<option value="${project.id}" ${milestone.projectId === project.id ? 'selected' : ''}>${escapeHtml(project.nombre)}</option>`).join('')}
      </select>
    </div>
    <div class="form-group">
      <label class="form-label">Actividades asociadas</label>
      <div id="ms-activities-box" style="max-height:150px;overflow-y:auto;border:1.5px solid var(--color-border);border-radius:var(--radius-sm);padding:8px;">
        ${renderMilestoneActivities(milestone.projectId || '', milestone.activityIds || [])}
      </div>
    </div>`;
}

function bindMilestoneFormEvents() {
  document.getElementById('ms-project')?.addEventListener('change', event => {
    const selected = [...document.querySelectorAll('.ms-act-check:checked')].map(check => check.value);
    const box = document.getElementById('ms-activities-box');
    if (box) box.innerHTML = renderMilestoneActivities(event.target.value, selected);
  });
}

export function openNewMilestone() {
  openModal({
    title: 'Nuevo Hito',
    body: buildMilestoneForm(),
    onSave: () => saveMilestone(null),
    onOpen: bindMilestoneFormEvents
  });
}

function openEditMilestone(id) {
  const milestone = Storage.getById('milestones', id);
  if (!milestone) return;
  openModal({
    title: 'Editar Hito',
    body: buildMilestoneForm(milestone),
    onSave: () => saveMilestone(id),
    onOpen: bindMilestoneFormEvents
  });
}

function saveMilestone(id) {
  const nombre = document.getElementById('ms-nombre').value.trim();
  const descripcion = document.getElementById('ms-desc').value.trim();
  const fecha = document.getElementById('ms-fecha').value;
  const projectId = document.getElementById('ms-project').value;
  const activityIds = [...document.querySelectorAll('.ms-act-check:checked')].map(check => check.value);

  if (!nombre || !projectId || !fecha) {
    showToast('Completa los campos requeridos.', 'danger');
    return;
  }

  const validIds = Storage.getAll('activities')
    .filter(activity => activity.projectId === projectId)
    .map(activity => activity.id);

  const data = { nombre, descripcion, fecha, projectId, activityIds: activityIds.filter(idValue => validIds.includes(idValue)) };
  if (id) {
    Storage.update('milestones', id, data);
    showToast('Hito actualizado.', 'success');
  } else {
    Storage.insert('milestones', data);
    showToast('Hito creado.', 'success');
  }

  closeModal();
  refreshViews(projectId);
}

function confirmDeleteMilestone(id) {
  const milestone = Storage.getById('milestones', id);
  if (!milestone) return;

  openModal({
    title: 'Eliminar Hito',
    body: `<p>¿Eliminar el hito <strong>${escapeHtml(milestone.nombre)}</strong>?</p>`,
    saveLabel: 'Eliminar',
    saveCls: 'btn-danger',
    onSave: () => {
      Storage.remove('milestones', id);
      closeModal();
      refreshViews(milestone.projectId);
      showToast('Hito eliminado.', 'success');
    }
  });
}

function initActivitiesPage() {
  if (!document.querySelector('activity-list')) return;
  initAppShell();
  document.getElementById('btn-new-activity')?.addEventListener('click', openNewActivity);
  document.getElementById('btn-new-milestone')?.addEventListener('click', openNewMilestone);
  document.querySelector('activity-list')?.render();
  document.querySelector('milestone-list')?.render();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initActivitiesPage);
} else {
  initActivitiesPage();
}
