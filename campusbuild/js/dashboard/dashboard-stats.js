/**
 * dashboard-stats.js — Web Component <dashboard-stats>
 *
 * Muestra las tarjetas de resumen global del sistema:
 * proyectos, actividades por estado, recursos e hitos.
 * Importa: storage.js, utils.js, ui.js
 */

import Storage from '../core/storage.js';
import { milestoneIsCompleted } from '../core/utils.js';
import { icon } from '../core/ui.js';

/**
 * Web Component que calcula y pinta las estadísticas globales del dashboard.
 * Expone `render()` para ser refrescado por refreshProjectViews y refreshActivityViews.
 */
class DashboardStats extends HTMLElement {
  /** Se ejecuta al insertar el componente en el DOM. */
  connectedCallback() {
    this.render();
  }

  /**
   * Lee todos los datos de Storage, calcula los indicadores clave
   * y pinta las tarjetas de estadísticas.
   * → Llamado en connectedCallback, refreshProjectViews y refreshActivityViews.
   */
  render() {
    const projects   = Storage.getAll('projects');
    const activities = Storage.getAll('activities');
    const resources  = Storage.getAll('resources');
    const milestones = Storage.getAll('milestones');

    const completed = activities.filter(a => a.estado === 'terminada').length;
    const active    = activities.filter(a => a.estado === 'en-proceso').length;
    const pending   = activities.filter(a => a.estado === 'pendiente').length;
    const hitosOk   = milestones.filter(m => milestoneIsCompleted(m, activities)).length;

    this.innerHTML = `
      <div class="stat-grid">
        <div class="stat-card"><div class="stat-icon">${icon('project')}</div><div class="stat-value">${projects.length}</div><div class="stat-label">Proyectos</div></div>
        <div class="stat-card"><div class="stat-icon">${icon('activities')}</div><div class="stat-value">${activities.length}</div><div class="stat-label">Actividades</div></div>
        <div class="stat-card"><div class="stat-icon">${icon('check')}</div><div class="stat-value" style="color:var(--color-success)">${completed}</div><div class="stat-label">Terminadas</div></div>
        <div class="stat-card"><div class="stat-icon">${icon('bolt')}</div><div class="stat-value" style="color:var(--color-primary)">${active}</div><div class="stat-label">En Proceso</div></div>
        <div class="stat-card"><div class="stat-icon">${icon('pending')}</div><div class="stat-value" style="color:var(--color-warning)">${pending}</div><div class="stat-label">Pendientes</div></div>
        <div class="stat-card"><div class="stat-icon">${icon('resource')}</div><div class="stat-value">${resources.length}</div><div class="stat-label">Recursos Humanos</div></div>
        <div class="stat-card"><div class="stat-icon">${icon('trophy')}</div><div class="stat-value">${hitosOk}/${milestones.length}</div><div class="stat-label">Hitos Cumplidos</div></div>
      </div>`;
  }
}

if (!customElements.get('dashboard-stats')) {
  customElements.define('dashboard-stats', DashboardStats);
}
