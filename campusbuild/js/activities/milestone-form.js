import Storage from '../core/storage.js';
import { escapeHtml, resolveMilestoneDate } from '../core/utils.js';
import { showToast, openModal, closeModal } from '../core/ui.js';
import { refreshActivityViews } from './activities-shared.js';

/**
 * Renderiza los checkboxes de actividades asociables a un hito.
 */
function renderMilestoneActivities(projectId, selectedIds = []) {
  const activities = projectId
    ? Storage.getAll('activities').filter(activity => activity.projectId === projectId)
    : [];

  if (!projectId) {
    return '<em style="color:var(--color-muted);font-size:13px;">Selecciona primero un proyecto.</em>';
  }
  if (!activities.length) {
    return '<em style="color:var(--color-muted);font-size:13px;">Este proyecto no tiene actividades creadas.</em>';
  }

  return activities.map(activity => `
    <label style="display:flex;align-items:center;gap:8px;padding:4px 0;font-size:13px;cursor:pointer;">
      <input type="checkbox" value="${activity.id}" ${selectedIds.includes(activity.id) ? 'checked' : ''} class="ms-act-check">
      ${escapeHtml(activity.nombre)}
    </label>`).join('');
}

/**
 * Construye el formulario de creación/edición de hitos.
 */
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

/**
 * Actualiza el listado de actividades asociables cuando cambia el proyecto.
 */
function bindMilestoneFormEvents() {
  document.getElementById('ms-project')?.addEventListener('change', event => {
    const selected = [...document.querySelectorAll('.ms-act-check:checked')].map(check => check.value);
    const box = document.getElementById('ms-activities-box');
    if (box) box.innerHTML = renderMilestoneActivities(event.target.value, selected);
  });
}

/**
 * Abre el modal para crear un nuevo hito.
 */
export function openNewMilestone() {
  openModal({
    title: 'Nuevo Hito',
    body: buildMilestoneForm(),
    onSave: () => saveMilestone(null),
    onOpen: bindMilestoneFormEvents
  });
}

/**
 * Abre el modal de edición de un hito existente.
 */
export function openEditMilestone(id) {
  const milestone = Storage.getById('milestones', id);
  if (!milestone) return;

  openModal({
    title: 'Editar Hito',
    body: buildMilestoneForm(milestone),
    onSave: () => saveMilestone(id),
    onOpen: bindMilestoneFormEvents
  });
}

/**
 * Guarda el hito asegurando que solo se asocien actividades válidas del proyecto.
 */
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

  const data = {
    nombre,
    descripcion,
    fecha,
    projectId,
    activityIds: activityIds.filter(idValue => validIds.includes(idValue))
  };

  if (id) {
    Storage.update('milestones', id, data);
    showToast('Hito actualizado.', 'success');
  } else {
    Storage.insert('milestones', data);
    showToast('Hito creado.', 'success');
  }

  closeModal();
  refreshActivityViews(projectId);
}

/**
 * Elimina un hito y refresca las vistas dependientes.
 */
export function confirmDeleteMilestone(id) {
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
      refreshActivityViews(milestone.projectId);
      showToast('Hito eliminado.', 'success');
    }
  });
}
