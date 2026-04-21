/**
 * resources-view.js — Web Component <resource-list>
 *
 * Muestra la tabla de recursos humanos con acciones de edición y borrado.
 * Importa: storage.js, utils.js, ui.js, resources-form.js
 */

import Storage from '../core/storage.js';
import { escapeHtml, formatDate } from '../core/utils.js';
import { icon } from '../core/ui.js';
import { confirmDelete, openEdit } from './resources-form.js';

/**
 * Web Component que muestra la lista de recursos humanos en una tabla.
 * Expone `render()` para que resources-form.js lo refresque desde fuera.
 */
class ResourceList extends HTMLElement {
  /**
   * Al insertarse en el DOM, registra el listener de clics una vez y renderiza.
   */
  connectedCallback() {
    if (!this.dataset.bound) {
      this.dataset.bound = 'true';
      // Delegación de eventos: un solo listener para todos los botones de la tabla
      this.addEventListener('click', event => {
        const btn = event.target.closest('[data-action]');
        if (!btn) return;
        const { action, resourceId } = btn.dataset;
        if (action === 'edit')   openEdit(resourceId);
        if (action === 'delete') confirmDelete(resourceId);
      });
    }
    this.render();
  }

  /**
   * Construye y pinta la tabla de recursos o muestra el estado vacío.
   * → Llamado en connectedCallback y desde resources-form.js tras guardar/eliminar.
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
            ${resources.map(r => `
              <tr>
                <td>${escapeHtml(r.identificacion)}</td>
                <td>
                  <strong>${escapeHtml(r.nombre)}</strong>
                  ${r.genero ? `<br><small style="color:var(--color-muted)">${escapeHtml(r.genero)}</small>` : ''}
                </td>
                <td><span style="background:var(--color-bg);padding:2px 8px;border-radius:4px;font-size:12px;">${escapeHtml(r.rol)}</span></td>
                <td>${formatDate(r.fechaNacimiento)}</td>
                <td><span style="font-weight:700;color:var(--color-danger);">${escapeHtml(r.tipoSangre)}</span></td>
                <td>${escapeHtml(r.arl)}</td>
                <td>$${Number(r.salario || 0).toLocaleString('es-CO')}</td>
                <td style="display:flex;gap:4px;align-items:center;">
                  <button class="btn-icon" title="Editar"   aria-label="Editar"   data-action="edit"   data-resource-id="${r.id}">${icon('edit')}</button>
                  <button class="btn-icon" title="Eliminar" aria-label="Eliminar" data-action="delete" data-resource-id="${r.id}">${icon('trash')}</button>
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
