import { initAppShell } from '../core/ui.js';
import './projects-view.js';
import { openNew } from './projects-form.js';

/**
 * Inicializa la página de proyectos y conecta sus acciones principales.
 */
export function initProjectsPage() {
  if (!document.querySelector('project-list')) return;

  initAppShell();
  document.getElementById('btn-new-project')?.addEventListener('click', openNew);
  document.querySelector('project-list')?.render();
}
