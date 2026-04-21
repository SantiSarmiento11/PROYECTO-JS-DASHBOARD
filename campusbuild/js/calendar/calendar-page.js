/**
 * calendar-page.js — Inicializador de la página de Cronograma
 *
 * Inicializa el shell del modal y activa el componente <activity-calendar>.
 * Importa: ui.js, calendar-view.js (registra <activity-calendar>)
 * Exporta: initCalendarPage
 * Llamado desde: index.js (boot)
 */

import { initAppShell } from '../core/ui.js';
import './calendar-view.js';

/**
 * Inicializa la página del cronograma.
 * Verifica que exista <activity-calendar> antes de continuar.
 * → Llamado automáticamente por index.js cuando el DOM está listo.
 */
export function initCalendarPage() {
  if (!document.querySelector('activity-calendar')) return;

  initAppShell();
  document.querySelector('activity-calendar')?.render();
}
