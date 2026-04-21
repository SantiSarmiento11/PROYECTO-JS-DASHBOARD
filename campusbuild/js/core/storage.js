/**
 * storage.js — Capa de persistencia con localStorage
 *
 * Exporta el objeto `Storage` con operaciones CRUD genéricas.
 * Usado por: utils.js, projects-form.js, projects-view.js,
 *            activity-form.js, activity-list.js, milestone-form.js,
 *            milestone-list.js, resources-form.js, resources-view.js,
 *            dashboard-recent.js, dashboard-stats.js, calendar-view.js
 */

const DB_KEY = 'campusbuild_db';

/** Retorna la estructura inicial vacía de la base de datos. */
function _defaultDB() {
  return { projects: [], activities: [], milestones: [], resources: [] };
}

/** Carga los datos guardados en localStorage. Si hay error, devuelve la BD vacía. */
function _load() {
  try {
    return JSON.parse(localStorage.getItem(DB_KEY)) || _defaultDB();
  } catch {
    return _defaultDB();
  }
}

/** Serializa y guarda el objeto `db` completo en localStorage. */
function _save(db) {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
}

/** Genera un ID único combinando timestamp y número aleatorio. */
function _genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// ─── API pública ──────────────────────────────────────────────────────────────

/**
 * Devuelve todos los registros de una colección.
 * @param {string} collection - 'projects' | 'activities' | 'milestones' | 'resources'
 */
function getAll(collection) {
  return _load()[collection] || [];
}

/**
 * Busca un registro por su `id` dentro de una colección.
 * @param {string} collection
 * @param {string} id
 * @returns {object|null}
 */
function getById(collection, id) {
  return getAll(collection).find(item => item.id === id) || null;
}

/**
 * Inserta un nuevo registro con `id` y `createdAt` generados automáticamente.
 * @param {string} collection
 * @param {object} data - Campos del registro (sin id)
 * @returns {object} El registro insertado
 */
function insert(collection, data) {
  const db = _load();
  const record = { ...data, id: _genId(), createdAt: new Date().toISOString() };
  db[collection].push(record);
  _save(db);
  return record;
}

/**
 * Actualiza un registro existente fusionando `data` con los valores actuales.
 * Agrega `updatedAt` automáticamente.
 * @param {string} collection
 * @param {string} id
 * @param {object} data - Campos a actualizar
 * @returns {object|null} Registro actualizado, o `null` si no existe
 */
function update(collection, id, data) {
  const db = _load();
  const index = db[collection].findIndex(item => item.id === id);
  if (index === -1) return null;
  db[collection][index] = { ...db[collection][index], ...data, updatedAt: new Date().toISOString() };
  _save(db);
  return db[collection][index];
}

/**
 * Elimina un registro de la colección por su `id`.
 * @param {string} collection
 * @param {string} id
 * @returns {boolean} `true` si se eliminó, `false` si no existía
 */
function remove(collection, id) {
  const db = _load();
  const before = db[collection].length;
  db[collection] = db[collection].filter(item => item.id !== id);
  _save(db);
  return db[collection].length < before;
}

const Storage = { getAll, getById, insert, update, remove };

export default Storage;
