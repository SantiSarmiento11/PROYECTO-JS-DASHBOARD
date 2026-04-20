import { initAppShell } from '../core/ui.js';
import './resources-view.js';
import { openNew } from './resources-form.js';

/**
 * Conecta la página de recursos con el shell y el botón principal.
 */
export function initResourcesPage() {
  if (!document.querySelector('resource-list')) return;

  initAppShell();
  document.getElementById('btn-new-resource')?.addEventListener('click', openNew);
  document.querySelector('resource-list')?.render();
}
