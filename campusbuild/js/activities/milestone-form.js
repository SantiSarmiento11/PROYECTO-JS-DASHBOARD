/**
 * milestone-form.js — Formulario CRUD de hitos
 *
 * Maneja la apertura del modal, validación y persistencia de hitos.
 * Los hitos pueden asociarse a actividades de un proyecto.
 * Importa: storage.js, utils.js, ui.js, activities-shared.js
 * Exporta: openNewMilestone, openEditMilestone, confirmDeleteMilestone
 * Usado por: activities-page.js, milestone-list.js, index.js (re-export al dashboard)
 */

import Storage from '../core/storage.js';
import { escapeHtml, resolveMilestoneDate } from '../core/utils.js';
import { showToast, openModal, closeModal } from '../core/ui.js';
import { refreshActivityViews } from './activities-shared.js';

// ─── Helpers del formulario ──────────────────────────────────────────────────

/**
 * Genera los checkboxes de actividades disponibles para un proyecto dado.
 * → Llamado desde buildMilestoneForm y desde el listener de cambio de proyecto.
 * @param {string} projectId    - ID del proyecto seleccionado
 * @param {string[]} selectedIds - IDs de actividades ya marcadas
 * @returns {string} HTML de los checkboxes o mensaje de estado vacío
 */
function renderMilestoneActivities(projectId, selectedIds = []) {
  if (!projectId) {
    return '<em style="color:var(--color-muted);font-size:13px;">Selecciona primero un proyecto.</em>';
  }

  const activities = Storage.getAll('activities').filter(a => a.projectId === projectId);

  if (!activities.length) {
    return '<em style="color:var(--color-muted);font-size:13px;">Este proyecto no tiene actividades creadas.</em>';
  }

  return activities.map(a => `
    <label style="display:flex;align-items:center;gap:8px;padding:4px 0;font-size:13px;cursor:pointer;">
      <input type="checkbox" value="${a.id}" ${selectedIds.includes(a.id) ? 'checked' : ''} class="ms-act-check">
      ${escapeHtml(a.nombre)}
    </label>`).join('');
}

/**
 * Genera el HTML completo del formulario de hito.
 * @param {object} [milestone={}] - Datos del hito a editar (vacío para nuevo)
 * @returns {string} HTML del formulario
 */
function buildMilestoneForm(milestone = {}) {
  const projects   = Storage.getAll('projects');
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
        ${projects.map(p => `<option value="${p.id}" ${milestone.projectId === p.id ? 'selected' : ''}>${escapeHtml(p.nombre)}</option>`).join('')}
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
 * Escucha el cambio de proyecto en el formulario y actualiza los checkboxes
 * de actividades disponibles conservando los que ya estaban seleccionados.
 * → Se ejecuta cada vez que se abre el modal (a través de `onOpen`).
 */
function bindMilestoneFormEvents() {
  document.getElementById('ms-project')?.addEventListener('change', event => {
    const selected = [...document.querySelectorAll('.ms-act-check:checked')].map(el => el.value);
    const box = document.getElementById('ms-activities-box');
    if (box) box.innerHTML = renderMilestoneActivities(event.target.value, selected);
  });
}

// ─── Apertura de modales ─────────────────────────────────────────────────────

/**
 * Abre el modal para crear un nuevo hito.
 * → Llamado desde activities-page.js y dashboard-page.js (vía index.js).
 */
export function openNewMilestone() {
  openModal({
    title : 'Nuevo Hito',
    body  : buildMilestoneForm(),
    onSave: () => saveMilestone(null),
    onOpen: bindMilestoneFormEvents
  });
}

/**
 * Abre el modal de edición con los datos del hito indicado.
 * → Llamado desde milestone-list.js al hacer clic en Editar.
 * @param {string} id - ID del hito a editar
 */
export function openEditMilestone(id) {
  const milestone = Storage.getById('milestones', id);
  if (!milestone) return;
  openModal({
    title : 'Editar Hito',
    body  : buildMilestoneForm(milestone),
    onSave: () => saveMilestone(id),
    onOpen: bindMilestoneFormEvents
  });
}

// ─── Guardar y eliminar ──────────────────────────────────────────────────────

/**
 * Lee el formulario, valida y guarda el hito.
 * Solo conserva IDs de actividades que pertenezcan al proyecto seleccionado.
 * → Llamado internamente desde openNewMilestone y openEditMilestone.
 * @param {string|null} id - ID para actualizar, null para insertar
 */
function saveMilestone(id) {
  const nombre      = document.getElementById('ms-nombre').value.trim();
  const descripcion = document.getElementById('ms-desc').value.trim();
  const fecha       = document.getElementById('ms-fecha').value;
  const projectId   = document.getElementById('ms-project').value;
  const activityIds = [...document.querySelectorAll('.ms-act-check:checked')].map(el => el.value);

  if (!nombre || !projectId || !fecha) {
    showToast('Completa los campos requeridos.', 'danger');
    return;
  }

  // Solo se aceptan actividades que efectivamente pertenezcan al proyecto
  const validIds = Storage.getAll('activities')
    .filter(a => a.projectId === projectId)
    .map(a => a.id);

  const data = {
    nombre,
    descripcion,
    fecha,
    projectId,
    activityIds: activityIds.filter(aId => validIds.includes(aId))
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
 * Muestra un modal de confirmación y elimina el hito si el usuario acepta.
 * → Llamado desde milestone-list.js al hacer clic en Eliminar.
 * @param {string} id - ID del hito a eliminar
 */
export function confirmDeleteMilestone(id) {
  const milestone = Storage.getById('milestones', id);
  if (!milestone) return;

  openModal({
    title    : 'Eliminar Hito',
    body     : `<p>¿Eliminar el hito <strong>${escapeHtml(milestone.nombre)}</strong>?</p>`,
    saveLabel: 'Eliminar',
    saveCls  : 'btn-danger',
    onSave   : () => {
      Storage.remove('milestones', id);
      closeModal();
      refreshActivityViews(milestone.projectId);
      showToast('Hito eliminado.', 'success');
    }
  });
}
