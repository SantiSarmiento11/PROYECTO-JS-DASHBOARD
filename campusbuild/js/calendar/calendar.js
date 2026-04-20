import Storage from '../core/storage.js';
import { activityEndDate, milestoneIsCompleted, resolveMilestoneDate } from '../core/utils.js';
import { icon, initAppShell } from '../core/ui.js';

const DAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

class ActivityCalendar extends HTMLElement {
  constructor() {
    super();
    const now = new Date();
    this.year = now.getFullYear();
    this.month = now.getMonth();
    this.projectFilter = '';
  }

  connectedCallback() {
    if (!this.dataset.bound) {
      this.dataset.bound = 'true';
      this.addEventListener('click', event => {
        const actionButton = event.target.closest('[data-action]');
        if (!actionButton) return;
        if (actionButton.dataset.action === 'prev-month') this.changeMonth(-1);
        if (actionButton.dataset.action === 'next-month') this.changeMonth(1);
      });

      this.addEventListener('change', event => {
        if (event.target.id === 'cal-filter') {
          this.projectFilter = event.target.value;
          this.render();
        }
      });
    }
    this.render();
  }

  changeMonth(step) {
    this.month += step;
    if (this.month < 0) {
      this.month = 11;
      this.year -= 1;
    }
    if (this.month > 11) {
      this.month = 0;
      this.year += 1;
    }
    this.render();
  }

  render() {
    const projects = Storage.getAll('projects');
    const activities = Storage.getAll('activities');
    const milestones = Storage.getAll('milestones');

    const visibleProjects = this.projectFilter ? projects.filter(project => project.id === this.projectFilter) : projects;
    const visibleActivities = this.projectFilter ? activities.filter(activity => activity.projectId === this.projectFilter) : activities;
    const visibleMilestones = this.projectFilter ? milestones.filter(milestone => milestone.projectId === this.projectFilter) : milestones;

    const firstDay = new Date(this.year, this.month, 1).getDay();
    const daysInMonth = new Date(this.year, this.month + 1, 0).getDate();
    const daysInPrev = new Date(this.year, this.month, 0).getDate();
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    const entries = [
      ...visibleProjects.map(project => ({
        start: project.fechaInicio,
        end: project.fechaFin,
        className: project.estado === 'terminado' ? 'project-done' : 'project-active',
        title: `${project.nombre} · Proyecto`,
        label: `Proyecto: ${project.nombre}`,
        order: 0
      })),
      ...visibleMilestones.map(milestone => ({
        start: resolveMilestoneDate(milestone, visibleActivities),
        end: resolveMilestoneDate(milestone, visibleActivities),
        className: milestoneIsCompleted(milestone, visibleActivities) ? 'milestone-done' : 'milestone-pending',
        title: `${milestone.nombre} · Hito`,
        label: `Hito: ${milestone.nombre}`,
        order: 1
      })),
      ...visibleActivities.map(activity => ({
        start: activity.fechaInicio,
        end: activityEndDate(activity),
        className: activity.estado,
        title: `${activity.nombre} · Actividad · ${activity.estado}`,
        label: `Actividad: ${activity.nombre}`,
        order: 2
      }))
    ].filter(entry => entry.start && entry.end);

    const cells = [];
    for (let index = firstDay - 1; index >= 0; index -= 1) {
      cells.push({ day: daysInPrev - index, current: false });
    }
    for (let day = 1; day <= daysInMonth; day += 1) {
      cells.push({ day, current: true });
    }
    while (cells.length % 7 !== 0) {
      cells.push({ day: cells.length - (firstDay + daysInMonth) + 1, current: false });
    }

    this.innerHTML = `
      <div class="calendar-filter">
        <label for="cal-filter">Filtrar por proyecto:</label>
        <select id="cal-filter">
          <option value="">Todos los proyectos</option>
          ${projects.map(project => `<option value="${project.id}" ${this.projectFilter === project.id ? 'selected' : ''}>${project.nombre}</option>`).join('')}
        </select>
        <span style="font-size:13px;color:var(--color-muted);">${MONTHS[this.month]} ${this.year}</span>
      </div>
      <div class="calendar-controls">
        <button class="btn btn-ghost btn-sm" data-action="prev-month">Anterior</button>
        <strong style="font-size:15px;">${MONTHS[this.month]} ${this.year}</strong>
        <button class="btn btn-ghost btn-sm" data-action="next-month">Siguiente</button>
      </div>
      <div style="display:flex;gap:12px;margin-bottom:14px;flex-wrap:wrap;">
        <span class="badge badge-project-active">${icon('project')} Proyecto</span>
        <span class="badge badge-milestone-no">${icon('trophy')} Hito</span>
        <span class="badge badge-pending">Pendiente</span>
        <span class="badge badge-progress">En Proceso</span>
        <span class="badge badge-done">Terminada</span>
      </div>
      <div class="calendar-grid">
        <div class="cal-header">${DAYS.map(day => `<div class="cal-header-cell">${day}</div>`).join('')}</div>
        <div class="cal-body">
          ${cells.map(cell => {
            const dateStr = cell.current ? `${this.year}-${String(this.month + 1).padStart(2, '0')}-${String(cell.day).padStart(2, '0')}` : null;
            const dayEntries = dateStr ? entries.filter(entry => entry.start <= dateStr && entry.end >= dateStr).sort((a, b) => a.order - b.order) : [];
            return `
              <div class="cal-day ${cell.current ? '' : 'other-month'} ${dateStr === todayStr ? 'today' : ''}">
                <div class="cal-day-num">${cell.day}</div>
                ${dayEntries.map(entry => `<div class="cal-event ${entry.className}" title="${entry.title}">${entry.label}</div>`).join('')}
              </div>`;
          }).join('')}
        </div>
      </div>`;
  }
}

if (!customElements.get('activity-calendar')) {
  customElements.define('activity-calendar', ActivityCalendar);
}

function initCalendarPage() {
  if (!document.querySelector('activity-calendar')) return;
  initAppShell();
  document.querySelector('activity-calendar')?.render();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCalendarPage);
} else {
  initCalendarPage();
}
