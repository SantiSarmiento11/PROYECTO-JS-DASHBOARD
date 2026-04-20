import Storage from '../core/storage.js';
import { escapeHtml } from '../core/utils.js';
import { showToast, openModal, closeModal } from '../core/ui.js';

/**
 * Renderiza el formulario de recurso con valores actuales o vacíos.
 */
function buildResourceForm(resource = {}) {
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

/**
 * Abre el formulario para crear un recurso humano.
 */
export function openNew() {
  openModal({
    title: 'Nuevo Recurso Humano',
    body: buildResourceForm(),
    onSave: () => saveResource(null)
  });
}

/**
 * Abre el formulario de edición de un recurso existente.
 */
export function openEdit(id) {
  const resource = Storage.getById('resources', id);
  if (!resource) return;

  openModal({
    title: 'Editar Recurso Humano',
    body: buildResourceForm(resource),
    onSave: () => saveResource(id)
  });
}

/**
 * Valida y guarda un recurso en localStorage.
 */
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

/**
 * Confirma la eliminación de un recurso y actualiza la tabla.
 */
export function confirmDelete(id) {
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
