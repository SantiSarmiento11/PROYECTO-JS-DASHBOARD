//  app.js  –  Bootstrap, enrutamiento SPA, modal global y toasts
//  Punto de entrada principal. Exporta utilidades consumidas por
//  projects.js, activities.js y resources.js.
// ============================================================
import Storage from './storage.js';

// ── Escapado de HTML ─────────────────────────────────────────
/** Previene XSS al insertar texto de usuario en el DOM. */
function _esc(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

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
  plus: `
    <svg viewBox="0 0 24 24" class="icon-svg" aria-hidden="true">
      <path d="M12 5v14M5 12h14" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round"/>
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
