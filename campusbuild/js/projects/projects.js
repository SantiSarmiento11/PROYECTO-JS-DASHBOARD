import Storage from '../core/storage.js';
import { getProjectCompletion, syncProjectStatus, formatDate, escapeHtml } from '../core/utils.js';
import { icon, showToast, openModal, closeModal, initAppShell } from '../core/ui.js';

function refreshProjectViews() {
  document.querySelector('project-list')?.render();
  document.querySelector('dashboard-stats')?.render?.();
  document.querySelector('activity-calendar')?.render?.();
}

class ProjectList extends HTMLElement {
  connectedCallback() {
    if (!this.dataset.bound) {
      this.dataset.bound = 'true';
      this.addEventListener('click', event => {
        const actionButton = event.target.closest('[data-action]');
        if (!actionButton) return;
        const { action, projectId } = actionButton.dataset;
        if (action === 'edit') openEdit(projectId);
        if (action === 'delete') confirmDelete(projectId);
        if (action === 'finish') finishProject(projectId);
      });
    }
    this.render();
  }

  render() {
    const projects = Storage.getAll('projects');
    const activities = Storage.getAll('activities');

    if (!projects.length) {
      this.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">${icon('project')}</div>
          <p>No hay proyectos registrados. Haz clic en <strong>Nuevo Proyecto</strong> para comenzar.</p>
        </div>`;
      return;
    }

    this.innerHTML = `
      <div class="project-cards">
        ${projects.map(project => {
          const current = syncProjectStatus(project.id) || project;
          const acts = activities.filter(activity => activity.projectId === project.id);
          const done = acts.filter(activity => activity.estado === 'terminada').length;
          const summary = getProjectCompletion(project.id);
          const isFinished = current.estado === 'terminado';

          return `
            <div class="project-card">
              <div class="project-card-header">
                <div>
                  <div class="project-card-title">${icon('activities')} <span>${escapeHtml(current.nombre)}</span></div>
                  <div class="project-card-status">
                    <span class="badge ${isFinished ? 'badge-project-done' : 'badge-project-active'}">${isFinished ? 'Terminado' : 'Activo'}</span>
                  </div>
                </div>
                <div style="display:flex;gap:4px;">
                  <button class="btn-icon" title="Editar" aria-label="Editar" data-action="edit" data-project-id="${current.id}">${icon('edit')}</button>
                  <button class="btn-icon" title="Eliminar" aria-label="Eliminar" data-action="delete" data-project-id="${current.id}">${icon('trash')}</button>
                </div>
              </div>
              <div class="project-card-desc">${escapeHtml(current.descripcion || '—')}</div>
              <div class="project-card-meta">
                <span>${icon('calendar')} Inicio: ${formatDate(current.fechaInicio)}</span>
                <span>${icon('flag')} Fin: ${formatDate(current.fechaFin)}</span>
              </div>
              <div class="project-card-meta">
                <span>${icon('chart')} Actividades: ${acts.length} | Terminadas: ${done}</span>
                <span>${icon('trophy')} Hitos: ${summary.milestonesDone}/${summary.milestonesTotal}</span>
              </div>
              <div class="project-card-actions">
                <button class="btn btn-ghost btn-sm" data-action="finish" data-project-id="${current.id}" ${isFinished || !summary.canFinish ? 'disabled' : ''}>
                  ${icon('check')} ${isFinished ? 'Proyecto terminado' : 'Terminar proyecto'}
                </button>
              </div>
            </div>`;
        }).join('')}
      </div>`;
  }
}

if (!customElements.get('project-list')) {
  customElements.define('project-list', ProjectList);
}

function buildForm(project = {}) {
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

export function openNew() {
  openModal({ title: 'Nuevo Proyecto', body: buildForm(), onSave: () => saveProject(null) });
}

function openEdit(id) {
  const project = Storage.getById('projects', id);
  if (!project) return;
  openModal({ title: 'Editar Proyecto', body: buildForm(project), onSave: () => saveProject(id) });
}

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

function confirmDelete(id) {
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

function finishProject(id) {
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

export function initProjectsPage() {
  if (!document.querySelector('project-list')) return;
  initAppShell();
  document.getElementById('btn-new-project')?.addEventListener('click', openNew);
  document.querySelector('project-list')?.render();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initProjectsPage);
} else {
  initProjectsPage();
}
