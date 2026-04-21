/**
 * resources-page.js — Inicializador de la página de Recursos Humanos
 *
 * Conecta el shell del modal y el botón "Nuevo Recurso".
 * Importa: ui.js, resources-view.js (registra <resource-list>), resources-form.js
 * Exporta: initResourcesPage
 * Llamado desde: index.js (boot)
 */

import { initAppShell } from '../core/ui.js';
import './resources-view.js';
import { openNew } from './resources-form.js';

/**
 * Inicializa la página de recursos humanos.
 * Verifica que exista <resource-list> antes de continuar.
 * → Llamado automáticamente por index.js cuando el DOM está listo.
 */
export function initResourcesPage() {
  if (!document.querySelector('resource-list')) return;

  initAppShell();
  document.getElementById('btn-new-resource')?.addEventListener('click', openNew);
  document.querySelector('resource-list')?.render();
}
