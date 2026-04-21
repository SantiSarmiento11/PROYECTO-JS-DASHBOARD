/**
 * calendar-view.js — Web Component <activity-calendar>
 *
 * Calendario mensual interactivo que muestra proyectos, hitos y actividades.
 * Permite filtrar por proyecto y navegar entre meses.
 * Importa: storage.js, utils.js, ui.js
 */

import Storage from '../core/storage.js';
import { activityEndDate, milestoneIsCompleted, resolveMilestoneDate } from '../core/utils.js';
import { icon } from '../core/ui.js';

/** Nombres de los días de la semana (Dom = índice 0). */
const DAYS   = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

/** Nombres de los meses del año (Enero = índice 0). */
const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

/**
 * Web Component que muestra un calendario mensual con eventos del sistema.
 * Expone `render()` para que refreshProjectViews y refreshActivityViews lo actualicen.
 */
class ActivityCalendar extends HTMLElement {
  constructor() {
    super();
    const now = new Date();
    this.year          = now.getFullYear();
    this.month         = now.getMonth();
    this.projectFilter = '';          // '' = todos los proyectos
  }

  /**
   * Al insertarse en el DOM registra los listeners de navegación y filtro,
   * y pinta el calendario del mes actual.
   */
  connectedCallback() {
    if (!this.dataset.bound) {
      this.dataset.bound = 'true';

      // Navegación entre meses con botones Anterior / Siguiente
      this.addEventListener('click', event => {
        const btn = event.target.closest('[data-action]');
        if (!btn) return;
        if (btn.dataset.action === 'prev-month') this.changeMonth(-1);
        if (btn.dataset.action === 'next-month') this.changeMonth(1);
      });

      // Filtro por proyecto (selector desplegable)
      this.addEventListener('change', event => {
        if (event.target.id === 'cal-filter') {
          this.projectFilter = event.target.value;
          this.render();
        }
      });
    }

    this.render();
  }

  /**
   * Avanza o retrocede un mes asegurando que el año sea coherente.
   * @param {number} step - 1 para siguiente mes, -1 para anterior
   */
  changeMonth(step) {
    this.month += step;
    if (this.month < 0)  { this.month = 11; this.year -= 1; }
    if (this.month > 11) { this.month = 0;  this.year += 1; }
    this.render();
  }

  /**
   * Construye la cuadrícula del calendario con los eventos del mes visible.
   * Los eventos incluyen proyectos (rango de fechas), hitos (día puntual)
   * y actividades (desde fechaInicio hasta dateEnd calculada por duración).
   * → Llamado en connectedCallback, changeMonth y al cambiar el filtro.
   */
  render() {
    const projects   = Storage.getAll('projects');
    const activities = Storage.getAll('activities');
    const milestones = Storage.getAll('milestones');

    // Aplica el filtro de proyecto si está activo
    const fp = this.projectFilter;
    const visProjects   = fp ? projects.filter(p   => p.id === fp)          : projects;
    const visActivities = fp ? activities.filter(a  => a.projectId === fp)   : activities;
    const visMilestones = fp ? milestones.filter(m  => m.projectId === fp)   : milestones;

    // Datos del mes en vista
    const firstDay    = new Date(this.year, this.month, 1).getDay();
    const daysInMonth = new Date(this.year, this.month + 1, 0).getDate();
    const daysInPrev  = new Date(this.year, this.month, 0).getDate();
    const today       = new Date();
    const todayStr    = [
      today.getFullYear(),
      String(today.getMonth() + 1).padStart(2, '0'),
      String(today.getDate()).padStart(2, '0')
    ].join('-');

    // Lista unificada de eventos con rango de fechas y clase CSS
    const entries = [
      ...visProjects.map(p => ({
        start    : p.fechaInicio,
        end      : p.fechaFin,
        className: p.estado === 'terminado' ? 'project-done' : 'project-active',
        title    : `${p.nombre} · Proyecto`,
        label    : `Proyecto: ${p.nombre}`,
        order    : 0   // los proyectos se muestran primero
      })),
      ...visMilestones.map(m => ({
        start    : resolveMilestoneDate(m, visActivities),
        end      : resolveMilestoneDate(m, visActivities),
        className: milestoneIsCompleted(m, visActivities) ? 'milestone-done' : 'milestone-pending',
        title    : `${m.nombre} · Hito`,
        label    : `Hito: ${m.nombre}`,
        order    : 1
      })),
      ...visActivities.map(a => ({
        start    : a.fechaInicio,
        end      : activityEndDate(a),
        className: a.estado,
        title    : `${a.nombre} · Actividad · ${a.estado}`,
        label    : `Actividad: ${a.nombre}`,
        order    : 2
      }))
    ].filter(e => e.start && e.end);   // descarta eventos sin fecha

    // Construye el array de celdas (días prev + días del mes + días next)
    const cells = [];
    for (let i = firstDay - 1; i >= 0; i -= 1) {
      cells.push({ day: daysInPrev - i, current: false });
    }
    for (let d = 1; d <= daysInMonth; d += 1) {
      cells.push({ day: d, current: true });
    }
    while (cells.length % 7 !== 0) {
      cells.push({ day: cells.length - (firstDay + daysInMonth) + 1, current: false });
    }

    const monthLabel = `${MONTHS[this.month]} ${this.year}`;

    this.innerHTML = `
      <div class="calendar-filter">
        <label for="cal-filter">Filtrar por proyecto:</label>
        <select id="cal-filter">
          <option value="">Todos los proyectos</option>
          ${projects.map(p => `<option value="${p.id}" ${fp === p.id ? 'selected' : ''}>${p.nombre}</option>`).join('')}
        </select>
        <span style="font-size:13px;color:var(--color-muted);">${monthLabel}</span>
      </div>
      <div class="calendar-controls">
        <button class="btn btn-ghost btn-sm" data-action="prev-month">Anterior</button>
        <strong style="font-size:15px;">${monthLabel}</strong>
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
        <div class="cal-header">
          ${DAYS.map(d => `<div class="cal-header-cell">${d}</div>`).join('')}
        </div>
        <div class="cal-body">
          ${cells.map(cell => {
            // Genera el string de fecha solo para días del mes actual
            const dateStr = cell.current
              ? `${this.year}-${String(this.month + 1).padStart(2, '0')}-${String(cell.day).padStart(2, '0')}`
              : null;

            // Filtra y ordena los eventos que caen en este día
            const dayEntries = dateStr
              ? entries.filter(e => e.start <= dateStr && e.end >= dateStr)
                       .sort((a, b) => a.order - b.order)
              : [];

            return `
              <div class="cal-day ${cell.current ? '' : 'other-month'} ${dateStr === todayStr ? 'today' : ''}">
                <div class="cal-day-num">${cell.day}</div>
                ${dayEntries.map(e => `<div class="cal-event ${e.className}" title="${e.title}">${e.label}</div>`).join('')}
              </div>`;
          }).join('')}
        </div>
      </div>`;
  }
}

if (!customElements.get('activity-calendar')) {
  customElements.define('activity-calendar', ActivityCalendar);
}
