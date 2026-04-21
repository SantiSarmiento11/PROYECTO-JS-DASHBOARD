/**
 * resources-form.js — Formulario CRUD de recursos humanos
 *
 * Gestiona la creación, edición y eliminación de recursos humanos.
 * Importa: storage.js, utils.js, ui.js
 * Exporta: openNew, openEdit, confirmDelete
 * Usado por: resources-page.js, resources-view.js, index.js (re-export al dashboard)
 */

import Storage from '../core/storage.js';
import { escapeHtml } from '../core/utils.js';
import { showToast, openModal, closeModal } from '../core/ui.js';

// ─── HTML del formulario ─────────────────────────────────────────────────────

/**
 * Genera el formulario de recurso humano con los campos requeridos.
 * @param {object} [resource={}] - Datos del recurso existente (vacío para nuevo)
 * @returns {string} HTML del formulario
 */
function buildResourceForm(resource = {}) {
  const roles      = ['Ingeniero', 'Arquitecto', 'Supervisor', 'Operario', 'Electricista', 'Plomero', 'Otro'];
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
          ${bloodTypes.map(t => `<option value="${t}" ${resource.tipoSangre === t ? 'selected' : ''}>${t}</option>`).join('')}
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
          <option value="Femenino"  ${resource.genero === 'Femenino'  ? 'selected' : ''}>Femenino</option>
          <option value="No binario"${resource.genero === 'No binario'? 'selected' : ''}>No binario</option>
          <option value="Otro"      ${resource.genero === 'Otro'      ? 'selected' : ''}>Otro</option>
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
          ${roles.map(r => `<option value="${r}" ${resource.rol === r ? 'selected' : ''}>${r}</option>`).join('')}
        </select>
      </div>
    </div>`;
}

// ─── Apertura de modales ─────────────────────────────────────────────────────

/**
 * Abre el modal para crear un nuevo recurso humano.
 * → Llamado desde resources-page.js y dashboard-page.js (vía index.js).
 */
export function openNew() {
  openModal({
    title : 'Nuevo Recurso Humano',
    body  : buildResourceForm(),
    onSave: () => saveResource(null)
  });
}

/**
 * Abre el modal de edición con los datos del recurso indicado.
 * → Llamado desde resources-view.js al hacer clic en Editar.
 * @param {string} id - ID del recurso a editar
 */
export function openEdit(id) {
  const resource = Storage.getById('resources', id);
  if (!resource) return;
  openModal({
    title : 'Editar Recurso Humano',
    body  : buildResourceForm(resource),
    onSave: () => saveResource(id)
  });
}

// ─── Guardar y eliminar ──────────────────────────────────────────────────────

/**
 * Lee el formulario, valida y guarda el recurso (nuevo o existente).
 * Refresca el componente <resource-list> al terminar.
 * → Llamado internamente desde openNew y openEdit.
 * @param {string|null} id - ID para actualizar, null para insertar
 */
function saveResource(id) {
  const identificacion = document.getElementById('res-id').value.trim();
  const nombre         = document.getElementById('res-nombre').value.trim();
  const fechaNacimiento= document.getElementById('res-fnac').value;
  const tipoSangre     = document.getElementById('res-sangre').value;
  const arl            = document.getElementById('res-arl').value.trim();
  const genero         = document.getElementById('res-genero').value;
  const salario        = parseFloat(document.getElementById('res-salario').value);
  const rol            = document.getElementById('res-rol').value;

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
 * Muestra confirmación y elimina el recurso si el usuario acepta.
 * → Llamado desde resources-view.js al hacer clic en Eliminar.
 * @param {string} id - ID del recurso a eliminar
 */
export function confirmDelete(id) {
  const resource = Storage.getById('resources', id);
  if (!resource) return;

  openModal({
    title    : 'Eliminar Recurso',
    body     : `<p>¿Eliminar a <strong>${escapeHtml(resource.nombre)}</strong>?</p>`,
    saveLabel: 'Eliminar',
    saveCls  : 'btn-danger',
    onSave   : () => {
      Storage.remove('resources', id);
      closeModal();
      document.querySelector('resource-list')?.render();
      showToast('Recurso eliminado.', 'success');
    }
  });
}
