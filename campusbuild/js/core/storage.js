const DB_KEY = 'campusbuild_db';

function _defaultDB() {
  return {
    projects: [],
    activities: [],
    milestones: [],
    resources: []
  };
}

function _load() {
  try {
    return JSON.parse(localStorage.getItem(DB_KEY)) || _defaultDB();
  } catch {
    return _defaultDB();
  }
}

function _save(db) {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
}

function _genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function getAll(collection) {
  return _load()[collection] || [];
}

function getById(collection, id) {
  return getAll(collection).find(item => item.id === id) || null;
}

function insert(collection, data) {
  const db = _load();
  const record = { ...data, id: _genId(), createdAt: new Date().toISOString() };
  db[collection].push(record);
  _save(db);
  return record;
}

function update(collection, id, data) {
  const db = _load();
  const index = db[collection].findIndex(item => item.id === id);
  if (index === -1) return null;
  db[collection][index] = { ...db[collection][index], ...data, updatedAt: new Date().toISOString() };
  _save(db);
  return db[collection][index];
}

function remove(collection, id) {
  const db = _load();
  const before = db[collection].length;
  db[collection] = db[collection].filter(item => item.id !== id);
  _save(db);
  return db[collection].length < before;
}

const Storage = { getAll, getById, insert, update, remove };

export default Storage;
