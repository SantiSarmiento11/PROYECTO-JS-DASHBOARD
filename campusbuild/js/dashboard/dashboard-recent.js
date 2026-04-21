import Storage from '../core/storage.js';
import { escapeHtml, formatDate } from '../core/utils.js';
import { icon } from '../core/ui.js';

/**
 * Renderiza la tabla de actividades recientes en el dashboard.
 */
export function renderRecentActivities() {
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

  const stateLabel = {
    pendiente: 'Pendiente',
    'en-proceso': 'En Proceso',
    terminada: 'Terminada'
  };
  const stateClass = {
    pendiente: 'badge-pending',
    'en-proceso': 'badge-progress',
    terminada: 'badge-done'
  };

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
                <td><span class="badge ${stateClass[activity.estado] || 'badge-pending'}">${stateLabel[activity.estado] || activity.estado}</span></td>
              </tr>`;
  }).join('')}
        </tbody>
      </table>
    </div>`;
}
