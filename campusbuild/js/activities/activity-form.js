import Storage from '../core/storage.js';
import { escapeHtml } from '../core/utils.js';
import { showToast, openModal, closeModal } from '../core/ui.js';
import { refreshActivityViews } from './activities-shared.js';

/**
 * Construye el formulario para crear o editar una actividad.
 */
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

/**
 * Abre el modal para crear una actividad.
 */
export function openNewActivity() {
  openModal({
    title: 'Nueva Actividad',
    body: buildActivityForm(),
    onSave: () => saveActivity(null)
  });
}

/**
 * Abre el modal de edición de actividad.
 */
export function openEditActivity(id) {
  const activity = Storage.getById('activities', id);
  if (!activity) return;

  openModal({
    title: 'Editar Actividad',
    body: buildActivityForm(activity),
    onSave: () => saveActivity(id)
  });
}

/**
 * Valida y guarda una actividad, luego actualiza las vistas asociadas.
 */
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
  refreshActivityViews(projectId);
}

/**
 * Elimina una actividad y limpia sus referencias desde hitos.
 */
export function confirmDeleteActivity(id) {
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
      refreshActivityViews(activity.projectId);
      showToast('Actividad eliminada.', 'success');
    }
  });
}
