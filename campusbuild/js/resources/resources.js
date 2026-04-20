import Storage from '../core/storage.js';
import { escapeHtml, formatDate } from '../core/utils.js';
import { icon, showToast, openModal, closeModal, initAppShell } from '../core/ui.js';

class ResourceList extends HTMLElement {
  connectedCallback() {
    if (!this.dataset.bound) {
      this.dataset.bound = 'true';
      this.addEventListener('click', event => {
        const actionButton = event.target.closest('[data-action]');
        if (!actionButton) return;
        const { action, resourceId } = actionButton.dataset;
        if (action === 'edit') openEdit(resourceId);
        if (action === 'delete') confirmDelete(resourceId);
      });
    }
    this.render();
  }

  render() {
    const resources = Storage.getAll('resources');

    if (!resources.length) {
      this.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">${icon('resource')}</div>
          <p>No hay recursos humanos registrados. Crea uno con <strong>Nuevo Recurso</strong>.</p>
        </div>`;
      return;
    }

    this.innerHTML = `
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Identificación</th>
              <th>Nombre</th>
              <th>Rol</th>
              <th>Fecha Nacimiento</th>
              <th>Sangre</th>
              <th>ARL</th>
              <th>Salario</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${resources.map(resource => `
              <tr>
                <td>${escapeHtml(resource.identificacion)}</td>
                <td><strong>${escapeHtml(resource.nombre)}</strong>${resource.genero ? `<br><small style="color:var(--color-muted)">${escapeHtml(resource.genero)}</small>` : ''}</td>
                <td><span style="background:var(--color-bg);padding:2px 8px;border-radius:4px;font-size:12px;">${escapeHtml(resource.rol)}</span></td>
                <td>${formatDate(resource.fechaNacimiento)}</td>
                <td><span style="font-weight:700;color:var(--color-danger);">${escapeHtml(resource.tipoSangre)}</span></td>
                <td>${escapeHtml(resource.arl)}</td>
                <td>$${Number(resource.salario || 0).toLocaleString('es-CO')}</td>
                <td style="display:flex;gap:4px;align-items:center;">
                  <button class="btn-icon" title="Editar" aria-label="Editar" data-action="edit" data-resource-id="${resource.id}">${icon('edit')}</button>
                  <button class="btn-icon" title="Eliminar" aria-label="Eliminar" data-action="delete" data-resource-id="${resource.id}">${icon('trash')}</button>
                </td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>`;
  }
}

if (!customElements.get('resource-list')) {
  customElements.define('resource-list', ResourceList);
}

function buildForm(resource = {}) {
  const roles = ['Ingeniero', 'Arquitecto', 'Supervisor', 'Operario', 'Electricista', 'Plomero', 'Otro'];
  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  return `
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Identificación *</label>
        <input id="res-id" class="form-control" placeholder="Cédula / NIT" value="${escapeHtml(resource.identificacion || '')}">
      </div>
      <div class="form-group">
        <label class="form-label">Nombre completo *</label>
        <input id="res-nombre" class="form-control" placeholder="Ej. Juan Pérez" value="${escapeHtml(resource.nombre || '')}">
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Fecha de Nacimiento *</label>
        <input id="res-fnac" type="date" class="form-control" value="${resource.fechaNacimiento || ''}">
      </div>
      <div class="form-group">
        <label class="form-label">Tipo de Sangre *</label>
        <select id="res-sangre" class="form-control">
          ${bloodTypes.map(type => `<option value="${type}" ${resource.tipoSangre === type ? 'selected' : ''}>${type}</option>`).join('')}
        </select>
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">ARL *</label>
        <input id="res-arl" class="form-control" placeholder="Ej. Sura, Colmena..." value="${escapeHtml(resource.arl || '')}">
      </div>
      <div class="form-group">
        <label class="form-label">Género <small style="font-weight:400;color:var(--color-muted)">(opcional)</small></label>
        <select id="res-genero" class="form-control">
          <option value="">No especificar</option>
          <option value="Masculino" ${resource.genero === 'Masculino' ? 'selected' : ''}>Masculino</option>
          <option value="Femenino" ${resource.genero === 'Femenino' ? 'selected' : ''}>Femenino</option>
          <option value="No binario" ${resource.genero === 'No binario' ? 'selected' : ''}>No binario</option>
          <option value="Otro" ${resource.genero === 'Otro' ? 'selected' : ''}>Otro</option>
        </select>
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Salario *</label>
        <input id="res-salario" type="number" min="0" class="form-control" placeholder="Ej. 2000000" value="${resource.salario || ''}">
      </div>
      <div class="form-group">
        <label class="form-label">Rol *</label>
        <select id="res-rol" class="form-control">
          ${roles.map(role => `<option value="${role}" ${resource.rol === role ? 'selected' : ''}>${role}</option>`).join('')}
        </select>
      </div>
    </div>`;
}

export function openNew() {
  openModal({ title: 'Nuevo Recurso Humano', body: buildForm(), onSave: () => saveResource(null) });
}

function openEdit(id) {
  const resource = Storage.getById('resources', id);
  if (!resource) return;
  openModal({ title: 'Editar Recurso Humano', body: buildForm(resource), onSave: () => saveResource(id) });
}

function saveResource(id) {
  const identificacion = document.getElementById('res-id').value.trim();
  const nombre = document.getElementById('res-nombre').value.trim();
  const fechaNacimiento = document.getElementById('res-fnac').value;
  const tipoSangre = document.getElementById('res-sangre').value;
  const arl = document.getElementById('res-arl').value.trim();
  const genero = document.getElementById('res-genero').value;
  const salario = parseFloat(document.getElementById('res-salario').value);
  const rol = document.getElementById('res-rol').value;

  if (!identificacion || !nombre || !fechaNacimiento || !arl || !salario || !rol) {
    showToast('Completa todos los campos requeridos.', 'danger');
    return;
  }

  const data = { identificacion, nombre, fechaNacimiento, tipoSangre, arl, genero, salario, rol };
  if (id) {
    Storage.update('resources', id, data);
    showToast('Recurso actualizado.', 'success');
  } else {
    Storage.insert('resources', data);
    showToast('Recurso creado.', 'success');
  }

  closeModal();
  document.querySelector('resource-list')?.render();
}

function confirmDelete(id) {
  const resource = Storage.getById('resources', id);
  if (!resource) return;

  openModal({
    title: 'Eliminar Recurso',
    body: `<p>¿Eliminar a <strong>${escapeHtml(resource.nombre)}</strong>?</p>`,
    saveLabel: 'Eliminar',
    saveCls: 'btn-danger',
    onSave: () => {
      Storage.remove('resources', id);
      closeModal();
      document.querySelector('resource-list')?.render();
      showToast('Recurso eliminado.', 'success');
    }
  });
}

function initResourcesPage() {
  if (!document.querySelector('resource-list')) return;
  initAppShell();
  document.getElementById('btn-new-resource')?.addEventListener('click', openNew);
  document.querySelector('resource-list')?.render();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initResourcesPage);
} else {
  initResourcesPage();
}
