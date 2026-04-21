/**
 * activity-form.js — Formulario CRUD de actividades
 *
 * Maneja la apertura del modal, validación y persistencia de actividades.
 * Importa: storage.js, utils.js, ui.js, activities-shared.js
 * Exporta: openNewActivity, openEditActivity, confirmDeleteActivity
 * Usado por: activities-page.js, activity-list.js, index.js (re-export al dashboard)
 */

import Storage from '../core/storage.js';
import { escapeHtml } from '../core/utils.js';
import { showToast, openModal, closeModal } from '../core/ui.js';
import { refreshActivityViews } from './activities-shared.js';

// ─── HTML del formulario ─────────────────────────────────────────────────────

/**
 * Genera el HTML del formulario para crear o editar una actividad.
 * Carga los proyectos y recursos desde Storage para llenar los selectores.
 * @param {object} [activity={}] - Datos de la actividad a editar (vacío para crear)
 * @returns {string} HTML del formulario
 */
function buildActivityForm(activity = {}) {
  const projects  = Storage.getAll('projects');
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
          ${projects.map(p => `<option value="${p.id}" ${activity.projectId === p.id ? 'selected' : ''}>${escapeHtml(p.nombre)}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Responsable</label>
        <select id="act-responsable" class="form-control">
          <option value="">Sin asignar</option>
          ${resources.map(r => `<option value="${r.id}" ${activity.responsableId === r.id ? 'selected' : ''}>${escapeHtml(r.nombre)}</option>`).join('')}
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
        <option value="pendiente"  ${(activity.estado || 'pendiente') === 'pendiente'  ? 'selected' : ''}>Pendiente</option>
        <option value="en-proceso" ${activity.estado === 'en-proceso' ? 'selected' : ''}>En Proceso</option>
        <option value="terminada"  ${activity.estado === 'terminada'  ? 'selected' : ''}>Terminada</option>
      </select>
    </div>`;
}

// ─── Apertura de modales ─────────────────────────────────────────────────────

/**
 * Abre el modal para crear una nueva actividad.
 * → Llamado desde activities-page.js y dashboard-page.js (vía index.js).
 */
export function openNewActivity() {
  openModal({
    title : 'Nueva Actividad',
    body  : buildActivityForm(),
    onSave: () => saveActivity(null)
  });
}

/**
 * Abre el modal de edición con los datos de la actividad indicada.
 * → Llamado desde activity-list.js al hacer clic en el botón Editar.
 * @param {string} id - ID de la actividad a editar
 */
export function openEditActivity(id) {
  const activity = Storage.getById('activities', id);
  if (!activity) return;
  openModal({
    title : 'Editar Actividad',
    body  : buildActivityForm(activity),
    onSave: () => saveActivity(id)
  });
}

// ─── Guardar y eliminar ──────────────────────────────────────────────────────

/**
 * Lee el formulario, valida y guarda (inserta o actualiza) la actividad.
 * Cierra el modal y refresca las vistas dependientes al terminar.
 * → Llamado internamente desde openNewActivity y openEditActivity.
 * @param {string|null} id - ID existente para actualizar, null para insertar
 */
function saveActivity(id) {
  const nombre       = document.getElementById('act-nombre').value.trim();
  const projectId    = document.getElementById('act-project').value;
  const responsableId= document.getElementById('act-responsable').value;
  const fechaInicio  = document.getElementById('act-inicio').value;
  const duracion     = parseInt(document.getElementById('act-duracion').value, 10);
  const estado       = document.getElementById('act-estado').value;

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
 * Muestra un modal de confirmación y elimina la actividad si el usuario acepta.
 * También limpia las referencias de la actividad en hitos asociados.
 * → Llamado desde activity-list.js al hacer clic en el botón Eliminar.
 * @param {string} id - ID de la actividad a eliminar
 */
export function confirmDeleteActivity(id) {
  const activity = Storage.getById('activities', id);
  if (!activity) return;

  openModal({
    title    : 'Eliminar Actividad',
    body     : `<p>¿Eliminar la actividad <strong>${escapeHtml(activity.nombre)}</strong>?</p>`,
    saveLabel: 'Eliminar',
    saveCls  : 'btn-danger',
    onSave   : () => {
      // Quita el ID de la actividad de todos los hitos que la referenciaban
      Storage.getAll('milestones')
        .filter(m => (m.activityIds || []).includes(id))
        .forEach(m => Storage.update('milestones', m.id, {
          activityIds: (m.activityIds || []).filter(aId => aId !== id)
        }));

      Storage.remove('activities', id);
      closeModal();
      refreshActivityViews(activity.projectId);
      showToast('Actividad eliminada.', 'success');
    }
  });
}
