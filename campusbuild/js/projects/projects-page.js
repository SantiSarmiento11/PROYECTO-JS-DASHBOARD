/**
 * projects-page.js — Inicializador de la página de Proyectos
 *
 * Inicializa el shell del modal y conecta el botón "Nuevo Proyecto".
 * Importa: ui.js, projects-view.js (registra <project-list>), projects-form.js
 * Exporta: initProjectsPage
 * Llamado desde: index.js (boot)
 */

import { initAppShell } from '../core/ui.js';
import './projects-view.js';
import { openNew } from './projects-form.js';

/**
 * Inicializa la página de proyectos.
 * Verifica que exista <project-list> antes de continuar.
 * → Llamado automáticamente por index.js cuando el DOM está listo.
 */
export function initProjectsPage() {
  if (!document.querySelector('project-list')) return;

  initAppShell();
  document.getElementById('btn-new-project')?.addEventListener('click', openNew);
  document.querySelector('project-list')?.render();
}
