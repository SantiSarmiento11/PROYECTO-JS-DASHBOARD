import { initAppShell } from '../core/ui.js';
import './calendar-view.js';

/**
 * Inicializa la página del cronograma.
 */
export function initCalendarPage() {
  if (!document.querySelector('activity-calendar')) return;

  initAppShell();
  document.querySelector('activity-calendar')?.render();
}
