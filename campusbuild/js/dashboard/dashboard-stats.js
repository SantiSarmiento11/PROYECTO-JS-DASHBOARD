import Storage from '../core/storage.js';
import { milestoneIsCompleted } from '../core/utils.js';
import { icon } from '../core/ui.js';

/**
 * Tarjetas de resumen global del sistema.
 */
class DashboardStats extends HTMLElement {
  connectedCallback() {
    this.render();
  }

  /**
   * Calcula y pinta los indicadores clave del dashboard.
   */
  render() {
    const projects = Storage.getAll('projects');
    const activities = Storage.getAll('activities');
    const resources = Storage.getAll('resources');
    const milestones = Storage.getAll('milestones');

    const completedActivities = activities.filter(activity => activity.estado === 'terminada').length;
    const activeActivities = activities.filter(activity => activity.estado === 'en-proceso').length;
    const pendingActivities = activities.filter(activity => activity.estado === 'pendiente').length;
    const completedMilestones = milestones.filter(milestone => milestoneIsCompleted(milestone, activities)).length;

    this.innerHTML = `
      <div class="stat-grid">
        <div class="stat-card"><div class="stat-icon">${icon('project')}</div><div class="stat-value">${projects.length}</div><div class="stat-label">Proyectos</div></div>
        <div class="stat-card"><div class="stat-icon">${icon('activities')}</div><div class="stat-value">${activities.length}</div><div class="stat-label">Actividades</div></div>
        <div class="stat-card"><div class="stat-icon">${icon('check')}</div><div class="stat-value" style="color:var(--color-success)">${completedActivities}</div><div class="stat-label">Terminadas</div></div>
        <div class="stat-card"><div class="stat-icon">${icon('bolt')}</div><div class="stat-value" style="color:var(--color-primary)">${activeActivities}</div><div class="stat-label">En Proceso</div></div>
        <div class="stat-card"><div class="stat-icon">${icon('pending')}</div><div class="stat-value" style="color:var(--color-warning)">${pendingActivities}</div><div class="stat-label">Pendientes</div></div>
        <div class="stat-card"><div class="stat-icon">${icon('resource')}</div><div class="stat-value">${resources.length}</div><div class="stat-label">Recursos Humanos</div></div>
        <div class="stat-card"><div class="stat-icon">${icon('trophy')}</div><div class="stat-value">${completedMilestones}/${milestones.length}</div><div class="stat-label">Hitos Cumplidos</div></div>
      </div>`;
  }
}

if (!customElements.get('dashboard-stats')) {
  customElements.define('dashboard-stats', DashboardStats);
}
