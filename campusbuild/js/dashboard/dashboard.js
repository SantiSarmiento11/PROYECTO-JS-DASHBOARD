import Storage from '../core/storage.js';
import { escapeHtml, formatDate, milestoneIsCompleted } from '../core/utils.js';
import { icon, initAppShell } from '../core/ui.js';
import { openNew as openNewProject } from '../projects/projects.js';
import { openNew as openNewResource } from '../resources/resources.js';
import { openNewActivity, openNewMilestone } from '../activities/activities.js';

class DashboardStats extends HTMLElement {
  connectedCallback() {
    this.render();
  }

  render() {
    const projects = Storage.getAll('projects');
    const activities = Storage.getAll('activities');
    const resources = Storage.getAll('resources');
    const milestones = Storage.getAll('milestones');

    const done = activities.filter(activity => activity.estado === 'terminada').length;
    const inProcess = activities.filter(activity => activity.estado === 'en-proceso').length;
    const pending = activities.filter(activity => activity.estado === 'pendiente').length;
    const completedMilestones = milestones.filter(milestone => milestoneIsCompleted(milestone, activities)).length;

    this.innerHTML = `
      <div class="stat-grid">
        <div class="stat-card"><div class="stat-icon">${icon('project')}</div><div class="stat-value">${projects.length}</div><div class="stat-label">Proyectos</div></div>
        <div class="stat-card"><div class="stat-icon">${icon('activities')}</div><div class="stat-value">${activities.length}</div><div class="stat-label">Actividades</div></div>
        <div class="stat-card"><div class="stat-icon">${icon('check')}</div><div class="stat-value" style="color:var(--color-success)">${done}</div><div class="stat-label">Terminadas</div></div>
        <div class="stat-card"><div class="stat-icon">${icon('bolt')}</div><div class="stat-value" style="color:var(--color-primary)">${inProcess}</div><div class="stat-label">En Proceso</div></div>
        <div class="stat-card"><div class="stat-icon">${icon('pending')}</div><div class="stat-value" style="color:var(--color-warning)">${pending}</div><div class="stat-label">Pendientes</div></div>
        <div class="stat-card"><div class="stat-icon">${icon('resource')}</div><div class="stat-value">${resources.length}</div><div class="stat-label">Recursos Humanos</div></div>
        <div class="stat-card"><div class="stat-icon">${icon('trophy')}</div><div class="stat-value">${completedMilestones}/${milestones.length}</div><div class="stat-label">Hitos Cumplidos</div></div>
      </div>`;
  }
}

if (!customElements.get('dashboard-stats')) {
  customElements.define('dashboard-stats', DashboardStats);
}

function renderDashboard() {
  document.querySelector('dashboard-stats')?.render();

  const activities = Storage.getAll('activities').slice(-5).reverse();
  const projects = Storage.getAll('projects');
  const container = document.getElementById('recent-activities');
  if (!container) return;

  if (!activities.length) {
    container.innerHTML = `
      <div class="empty-state" style="padding:30px 0;">
        <div class="empty-icon">${icon('activities')}</div>
        <p>No hay actividades registradas aún.</p>
      </div>`;
    return;
  }

  const stateLabel = { pendiente: 'Pendiente', 'en-proceso': 'En Proceso', terminada: 'Terminada' };
  const stateCls = { pendiente: 'badge-pending', 'en-proceso': 'badge-progress', terminada: 'badge-done' };

  container.innerHTML = `
    <div class="table-wrap">
      <table>
        <thead><tr><th>Actividad</th><th>Proyecto</th><th>Inicio</th><th>Estado</th></tr></thead>
        <tbody>
          ${activities.map(activity => {
            const project = projects.find(item => item.id === activity.projectId);
            return `
              <tr>
                <td><strong>${escapeHtml(activity.nombre)}</strong></td>
                <td>${project ? escapeHtml(project.nombre) : '—'}</td>
                <td>${formatDate(activity.fechaInicio)}</td>
                <td><span class="badge ${stateCls[activity.estado] || 'badge-pending'}">${stateLabel[activity.estado] || activity.estado}</span></td>
              </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>`;
}

function initDashboardPage() {
  if (!document.getElementById('recent-activities')) return;
  initAppShell();
  renderDashboard();
  document.getElementById('btn-dashboard-new-project')?.addEventListener('click', openNewProject);
  document.getElementById('btn-dashboard-new-activity')?.addEventListener('click', openNewActivity);
  document.getElementById('btn-dashboard-new-resource')?.addEventListener('click', openNewResource);
  document.getElementById('btn-dashboard-new-milestone')?.addEventListener('click', openNewMilestone);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initDashboardPage);
} else {
  initDashboardPage();
}
