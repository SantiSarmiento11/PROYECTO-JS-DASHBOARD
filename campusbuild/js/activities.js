// ============================================================
//  activities.js  –  Web Components <activity-list> y <milestone-list>
//  Gestiona el CRUD de actividades e hitos. Depende de Storage
//  y de las utilidades de app.js. Los hitos se consideran
//  cumplidos cuando todas sus actividades asociadas terminan.
// ============================================================
import Storage from './storage.js';
import {
  showToast,
  formatDate,
  openModal,
  closeModal,
  icon,
  resolveMilestoneDate,
  milestoneIsCompleted,
  syncProjectStatus,
} from './app.js';

// ── Helper ────────────────────────────────────────────────────
function _esc(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  
  /**Genera el HTML de un badge con la clase y etiqueta del estado. Estados válidos: 'pendiente' | 'en-proceso' | 'terminada'.
   */
function estadoBadge(e) {
    const map = { pendiente: 'badge-pending', 'en-proceso': 'badge-progress', terminada: 'badge-done' };
    const label = { pendiente: 'Pendiente', 'en-proceso': 'En Proceso', terminada: 'Terminada' };
    return `<span class="badge ${map[e] || 'badge-pending'}">${label[e] || e}</span>`;
}
  
function refreshProjectDependencies(projectId = '') {
    if (projectId) syncProjectStatus(projectId);
    document.querySelector('activity-list')?.render();
    document.querySelector('milestone-list')?.render();
    document.querySelector('project-list')?.render?.();
    document.querySelector('dashboard-stats')?.render?.();
    document.querySelector('activity-calendar')?.render?.();
}
  