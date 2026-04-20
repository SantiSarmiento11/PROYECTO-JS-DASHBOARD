import Storage from '../core/storage.js';
import { getProjectCompletion, escapeHtml } from '../core/utils.js';
import { showToast, openModal, closeModal } from '../core/ui.js';
import { refreshProjectViews } from './projects-view.js';

/**
 * Genera el formulario base para crear o editar un proyecto.
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

/**
 * Abre el modal para crear un proyecto nuevo.
 */
export function openNew() {
  openModal({
    title: 'Nuevo Proyecto',
    body: buildProjectForm(),
    onSave: () => saveProject(null)
  });
}

/**
 * Abre el modal de edición con los datos actuales del proyecto.
 */
export function openEdit(id) {
  const project = Storage.getById('projects', id);
  if (!project) return;

  openModal({
    title: 'Editar Proyecto',
    body: buildProjectForm(project),
    onSave: () => saveProject(id)
  });
}

/**
 * Valida y persiste un proyecto nuevo o existente.
 */
function saveProject(id) {
  const nombre = document.getElementById('proj-nombre').value.trim();
  const descripcion = document.getElementById('proj-desc').value.trim();
  const fechaInicio = document.getElementById('proj-inicio').value;
  const fechaFin = document.getElementById('proj-fin').value;

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
 * Pide confirmación y elimina el proyecto junto con sus relaciones directas.
 */
export function confirmDelete(id) {
  const project = Storage.getById('projects', id);
  if (!project) return;

  openModal({
    title: 'Eliminar Proyecto',
    body: `<p>¿Estás seguro de eliminar el proyecto <strong>${escapeHtml(project.nombre)}</strong>?<br>Se eliminarán también sus actividades e hitos asociados.</p>`,
    saveLabel: 'Eliminar',
    saveCls: 'btn-danger',
    onSave: () => {
      Storage.getAll('activities')
        .filter(activity => activity.projectId === id)
        .forEach(activity => Storage.remove('activities', activity.id));

      Storage.getAll('milestones')
        .filter(milestone => milestone.projectId === id)
        .forEach(milestone => Storage.remove('milestones', milestone.id));

      Storage.remove('projects', id);
      closeModal();
      refreshProjectViews();
      showToast('Proyecto eliminado.', 'success');
    }
  });
}

/**
 * Marca un proyecto como terminado si ya cumplió todas sus dependencias internas.
 */
export function finishProject(id) {
  const project = Storage.getById('projects', id);
  if (!project) return;

  const summary = getProjectCompletion(id);
  if (!summary.canFinish) {
    showToast(`No se puede terminar el proyecto. Actividades: ${summary.activitiesDone}/${summary.activitiesTotal}. Hitos: ${summary.milestonesDone}/${summary.milestonesTotal}.`, 'danger');
    return;
  }

  openModal({
    title: 'Terminar Proyecto',
    body: `<p>¿Deseas marcar el proyecto <strong>${escapeHtml(project.nombre)}</strong> como terminado?</p>`,
    saveLabel: 'Terminar',
    onSave: () => {
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
