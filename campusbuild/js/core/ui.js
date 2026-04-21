/**
 * ui.js — Componentes de interfaz compartidos (modal, toasts, íconos)
 *
 * Exporta: icon, showToast, openModal, closeModal, initAppShell
 * Usado por: todos los módulos de formularios y páginas
 */

// ─── Estado interno ────────────────────────────────────────────────────────────

/** Guarda la función `onSave` del modal activo para ejecutarla al confirmar. */
let currentOnSave = null;

// ─── Íconos SVG ───────────────────────────────────────────────────────────────

const ICONS = {
  project: `
    <svg viewBox="0 0 24 24" class="icon-svg" aria-hidden="true">
      <path d="M3 21h18M4 21V10l8-6 8 6v11" stroke="currentColor" fill="none" stroke-width="2"/>
    </svg>`,
  activities: `
    <svg viewBox="0 0 24 24" class="icon-svg" aria-hidden="true">
      <path d="M4 4h16v16H4zM8 8h8M8 12h6M8 16h4" stroke="currentColor" fill="none" stroke-width="2"/>
    </svg>`,
  resource: `
    <svg viewBox="0 0 24 24" class="icon-svg" aria-hidden="true">
      <circle cx="12" cy="8" r="4" stroke="currentColor" fill="none" stroke-width="2"/>
      <path d="M4 20c0-4 16-4 16 0" stroke="currentColor" fill="none" stroke-width="2"/>
    </svg>`,
  calendar: `
    <svg viewBox="0 0 24 24" class="icon-svg" aria-hidden="true">
      <rect x="3" y="5" width="18" height="16" stroke="currentColor" fill="none" stroke-width="2"/>
      <path d="M3 10h18M8 3v4M16 3v4" stroke="currentColor" fill="none" stroke-width="2"/>
    </svg>`,
  flag: `
    <svg viewBox="0 0 24 24" class="icon-svg" aria-hidden="true">
      <path d="M5 21V4m0 0h10l-2 3 2 3H5" stroke="currentColor" fill="none" stroke-width="2" stroke-linejoin="round"/>
    </svg>`,
  chart: `
    <svg viewBox="0 0 24 24" class="icon-svg" aria-hidden="true">
      <path d="M4 20V10M10 20V4M16 20v-8M22 20H2" stroke="currentColor" fill="none" stroke-width="2"/>
    </svg>`,
  check: `
    <svg viewBox="0 0 24 24" class="icon-svg" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" fill="none" stroke-width="2"/>
      <path d="m8 12 2.5 2.5L16 9" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
  bolt: `
    <svg viewBox="0 0 24 24" class="icon-svg" aria-hidden="true">
      <path d="M13 2 6 13h5l-1 9 8-12h-5l0-8Z" stroke="currentColor" fill="none" stroke-width="2" stroke-linejoin="round"/>
    </svg>`,
  pending: `
    <svg viewBox="0 0 24 24" class="icon-svg" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" fill="none" stroke-width="2"/>
      <path d="M12 7v5l3 2" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
  trophy: `
    <svg viewBox="0 0 24 24" class="icon-svg" aria-hidden="true">
      <path d="M8 4h8v3a4 4 0 0 1-8 0V4Z" stroke="currentColor" fill="none" stroke-width="2"/>
      <path d="M9 16h6M12 11v5m-5-9H4a3 3 0 0 0 3 3m10-3h3a3 3 0 0 1-3 3M10 20h4" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round"/>
    </svg>`,
  edit: `
    <svg viewBox="0 0 24 24" class="icon-svg" aria-hidden="true">
      <path d="m4 20 4.5-1 9-9a2.1 2.1 0 1 0-3-3l-9 9L4 20Z" stroke="currentColor" fill="none" stroke-width="2" stroke-linejoin="round"/>
    </svg>`,
  trash: `
    <svg viewBox="0 0 24 24" class="icon-svg" aria-hidden="true">
      <path d="M4 7h16M9 7V4h6v3m-8 0 1 13h8l1-13" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`
};

// ─── Funciones públicas ───────────────────────────────────────────────────────

/**
 * Devuelve el SVG del ícono solicitado, con clase CSS opcional adicional.
 * → Usado en todos los módulos que renderizan HTML dinámico.
 * @param {string} name - Clave del ícono en ICONS
 * @param {string} [extraClass] - Clase CSS adicional a agregar al SVG
 * @returns {string} HTML del SVG o cadena vacía si no existe
 */
export function icon(name, extraClass = '') {
  const markup = ICONS[name];
  if (!markup) return '';
  return extraClass
    ? markup.replace('class="icon-svg"', `class="icon-svg ${extraClass}"`)
    : markup;
}

/**
 * Muestra una notificación temporal en pantalla (toast).
 * → Llamado desde cualquier módulo después de guardar/eliminar datos.
 * @param {string} message - Texto a mostrar
 * @param {string} [type] - 'success' | 'danger' (agrega clase CSS al toast)
 */
export function showToast(message, type = '') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast${type ? ` toast-${type}` : ''}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3200);
}

/**
 * Abre el modal global con el contenido y comportamiento indicados.
 * → Llamado desde los formularios de proyectos, actividades, hitos y recursos.
 * @param {object} options
 * @param {string}   options.title      - Título del modal
 * @param {string}   options.body       - HTML del cuerpo del modal
 * @param {Function} options.onSave     - Acción al confirmar (botón Guardar)
 * @param {string}   [options.saveLabel]- Texto del botón de acción (default: 'Guardar')
 * @param {string}   [options.saveCls]  - Clase CSS del botón (default: 'btn-primary')
 * @param {Function} [options.onOpen]   - Callback ejecutado tras renderizar el cuerpo
 */
export function openModal({ title, body, onSave, saveLabel = 'Guardar', saveCls = 'btn-primary', onOpen }) {
  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-body').innerHTML = body;
  document.getElementById('modal-save').className = `btn ${saveCls}`;
  document.getElementById('modal-save').textContent = saveLabel;
  currentOnSave = onSave;
  document.getElementById('modal-backdrop').classList.add('open');
  if (typeof onOpen === 'function') onOpen();
}

/**
 * Cierra el modal global y limpia la acción de guardado activa.
 * → Llamado desde botones de cierre y tras completar un guardado.
 */
export function closeModal() {
  document.getElementById('modal-backdrop').classList.remove('open');
  currentOnSave = null;
}

/**
 * Registra los listeners del modal y el botón de guardado.
 * Solo se ejecuta una vez gracias a `data-bound`.
 * → Llamado desde `initDashboardPage`, `initProjectsPage`,
 *   `initActivitiesPage` e `initResourcesPage`.
 */
export function initAppShell() {
  const backdrop = document.getElementById('modal-backdrop');
  if (!backdrop || backdrop.dataset.bound === 'true') return;

  backdrop.dataset.bound = 'true';
  backdrop.addEventListener('click', event => {
    if (event.target === backdrop) closeModal();
  });

  document.getElementById('modal-close-btn')?.addEventListener('click', closeModal);
  document.getElementById('modal-cancel-btn')?.addEventListener('click', closeModal);
  document.getElementById('modal-save')?.addEventListener('click', () => {
    if (typeof currentOnSave === 'function') currentOnSave();
  });
}
