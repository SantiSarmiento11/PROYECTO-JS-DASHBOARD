/**
 * projects-form.js — Formulario CRUD de proyectos
 *
 * Gestiona la creación, edición, eliminación y finalización de proyectos.
 * Al eliminar un proyecto, también elimina sus actividades e hitos asociados.
 * Importa: storage.js, utils.js, ui.js, projects-view.js
 * Exporta: openNew, openEdit, confirmDelete, finishProject
 * Usado por: projects-page.js, projects-view.js, index.js (re-export al dashboard)
 */

import Storage from '../core/storage.js';
import { getProjectCompletion, escapeHtml } from '../core/utils.js';
import { showToast, openModal, closeModal } from '../core/ui.js';
import { refreshProjectViews } from './projects-view.js';

// ─── HTML del formulario ─────────────────────────────────────────────────────

/**
 * Genera el formulario para crear o editar un proyecto.
 * @param {object} [project={}] - Datos actuales del proyecto (vacío para nuevo)
 * @returns {string} HTML del formulario
 */
function buildProjectForm(project = {}) {
  return `
    <div class="form-group">
      <label class="form-label">Nombre del Proyecto *</label>
      <input id="proj-nombre" class="form-control" placeholder="Ej. Edificio Torre Norte" value="${escapeHtml(project.nombre || '')}">
    </div>
    <div class="form-group">
      <label class="form-label">Descripción</label>
      <textarea id="proj-desc" class="form-control" rows="3" placeholder="Descripción del proyecto...">${escapeHtml(project.descripcion || '')}</textarea>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Fecha de Inicio *</label>
        <input id="proj-inicio" type="date" class="form-control" value="${project.fechaInicio || ''}">
      </div>
      <div class="form-group">
        <label class="form-label">Fecha de Fin *</label>
        <input id="proj-fin" type="date" class="form-control" value="${project.fechaFin || ''}">
      </div>
    </div>`;
}

// ─── Apertura de modales ─────────────────────────────────────────────────────

/**
 * Abre el modal para crear un proyecto nuevo.
 * → Llamado desde projects-page.js y dashboard-page.js (vía index.js).
 */
export function openNew() {
  openModal({
    title : 'Nuevo Proyecto',
    body  : buildProjectForm(),
    onSave: () => saveProject(null)
  });
}

/**
 * Abre el modal de edición con los datos actuales del proyecto.
 * → Llamado desde projects-view.js al hacer clic en Editar.
 * @param {string} id - ID del proyecto a editar
 */
export function openEdit(id) {
  const project = Storage.getById('projects', id);
  if (!project) return;
  openModal({
    title : 'Editar Proyecto',
    body  : buildProjectForm(project),
    onSave: () => saveProject(id)
  });
}

// ─── Guardar, eliminar y finalizar ──────────────────────────────────────────

/**
 * Lee el formulario, valida y persiste el proyecto (nuevo o existente).
 * → Llamado internamente desde openNew y openEdit.
 * @param {string|null} id - ID para actualizar, null para insertar
 */
function saveProject(id) {
  const nombre      = document.getElementById('proj-nombre').value.trim();
  const descripcion = document.getElementById('proj-desc').value.trim();
  const fechaInicio = document.getElementById('proj-inicio').value;
  const fechaFin    = document.getElementById('proj-fin').value;

  if (!nombre || !fechaInicio || !fechaFin) {
    showToast('Por favor completa los campos requeridos.', 'danger');
    return;
  }
  if (fechaFin < fechaInicio) {
    showToast('La fecha de fin no puede ser anterior a la de inicio.', 'danger');
    return;
  }

  const data = { nombre, descripcion, fechaInicio, fechaFin };

  if (id) {
    Storage.update('projects', id, data);
    showToast('Proyecto actualizado correctamente.', 'success');
  } else {
    Storage.insert('projects', { ...data, estado: 'activo', fechaTerminado: null });
    showToast('Proyecto creado correctamente.', 'success');
  }

  closeModal();
  refreshProjectViews();
}

/**
 * Pide confirmación y elimina el proyecto junto con sus actividades e hitos.
 * → Llamado desde projects-view.js al hacer clic en Eliminar.
 * @param {string} id - ID del proyecto a eliminar
 */
export function confirmDelete(id) {
  const project = Storage.getById('projects', id);
  if (!project) return;

  openModal({
    title    : 'Eliminar Proyecto',
    body     : `<p>¿Estás seguro de eliminar el proyecto <strong>${escapeHtml(project.nombre)}</strong>?<br>Se eliminarán también sus actividades e hitos asociados.</p>`,
    saveLabel: 'Eliminar',
    saveCls  : 'btn-danger',
    onSave   : () => {
      // Elimina actividades e hitos vinculados antes de borrar el proyecto
      Storage.getAll('activities').filter(a => a.projectId === id).forEach(a => Storage.remove('activities', a.id));
      Storage.getAll('milestones').filter(m => m.projectId === id).forEach(m => Storage.remove('milestones', m.id));
      Storage.remove('projects', id);
      closeModal();
      refreshProjectViews();
      showToast('Proyecto eliminado.', 'success');
    }
  });
}

/**
 * Marca un proyecto como "terminado" si todas sus actividades e hitos están completos.
 * Muestra un mensaje de error descriptivo si aún no cumple los requisitos.
 * → Llamado desde projects-view.js al hacer clic en "Terminar proyecto".
 * @param {string} id - ID del proyecto a finalizar
 */
export function finishProject(id) {
  const project = Storage.getById('projects', id);
  if (!project) return;

  const summary = getProjectCompletion(id);
  if (!summary.canFinish) {
    showToast(
      `No se puede terminar el proyecto. Actividades: ${summary.activitiesDone}/${summary.activitiesTotal}. Hitos: ${summary.milestonesDone}/${summary.milestonesTotal}.`,
      'danger'
    );
    return;
  }

  openModal({
    title    : 'Terminar Proyecto',
    body     : `<p>¿Deseas marcar el proyecto <strong>${escapeHtml(project.nombre)}</strong> como terminado?</p>`,
    saveLabel: 'Terminar',
    onSave   : () => {
      const today = new Date();
      const fechaTerminado = [
        today.getFullYear(),
        String(today.getMonth() + 1).padStart(2, '0'),
        String(today.getDate()).padStart(2, '0')
      ].join('-');

      Storage.update('projects', id, { estado: 'terminado', fechaTerminado });
      closeModal();
      refreshProjectViews();
      showToast('Proyecto terminado correctamente.', 'success');
    }
  });
}
