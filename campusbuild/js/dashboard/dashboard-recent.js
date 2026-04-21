/**
 * dashboard-recent.js — Tabla de actividades recientes del dashboard
 *
 * Muestra las últimas 5 actividades registradas con su proyecto y estado.
 * Importa: storage.js, utils.js, ui.js
 * Exporta: renderRecentActivities
 * Usado por: dashboard-page.js
 */

import Storage from '../core/storage.js';
import { escapeHtml, formatDate } from '../core/utils.js';
import { icon } from '../core/ui.js';

/** Mapas de clase CSS y texto para cada estado de actividad. */
const STATE_CLASS = { pendiente: 'badge-pending', 'en-proceso': 'badge-progress', terminada: 'badge-done' };
const STATE_LABEL = { pendiente: 'Pendiente',     'en-proceso': 'En Proceso',     terminada: 'Terminada'  };

/**
 * Renderiza la tabla de las 5 actividades más recientes en el dashboard.
 * Muestra un estado vacío si no hay actividades registradas.
 * → Llamado desde dashboard-page.js en renderDashboard.
 */
export function renderRecentActivities() {
  const container  = document.getElementById('recent-activities');
  if (!container) return;

  // Las últimas 5 en orden cronológico inverso (más reciente primero)
  const activities = Storage.getAll('activities').slice(-5).reverse();
  const projects   = Storage.getAll('projects');

  if (!activities.length) {
    container.innerHTML = `
      <div class="empty-state" style="padding:30px 0;">
        <div class="empty-icon">${icon('activities')}</div>
        <p>No hay actividades registradas aún.</p>
      </div>`;
    return;
  }

  container.innerHTML = `
    <div class="table-wrap">
      <table>
        <thead>
          <tr><th>Actividad</th><th>Proyecto</th><th>Inicio</th><th>Estado</th></tr>
        </thead>
        <tbody>
          ${activities.map(activity => {
            const project = projects.find(p => p.id === activity.projectId);
            return `
              <tr>
                <td><strong>${escapeHtml(activity.nombre)}</strong></td>
                <td>${project ? escapeHtml(project.nombre) : '—'}</td>
                <td>${formatDate(activity.fechaInicio)}</td>
                <td><span class="badge ${STATE_CLASS[activity.estado] || 'badge-pending'}">${STATE_LABEL[activity.estado] || activity.estado}</span></td>
              </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>`;
}
