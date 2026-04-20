import Storage from '../core/storage.js';
import { escapeHtml, formatDate } from '../core/utils.js';
import { icon } from '../core/ui.js';
import { confirmDelete, openEdit } from './resources-form.js';

/**
 * Tabla principal de recursos humanos con acciones CRUD.
 */
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

  /**
   * Dibuja la tabla de recursos o el estado vacío si no hay datos.
   */
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
