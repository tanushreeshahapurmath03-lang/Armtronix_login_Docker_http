// Local persistence layer for local/offline mode.
// Replaces server/database persistence while keeping the same CRUD response shapes.

const DB_NAME = 'armtronix_local_db';
const DB_VERSION = 2;

const STORE = {
  users: 'users',
  claims: 'claims',
  payments: 'payments',
  tasks: 'tasks',
  leaveRequests: 'leaveRequests',
  events: 'events',
  counters: 'counters',
  attendance: 'attendance',
  leaveSettings: 'leaveSettings'
};

function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = () => {
      const db = req.result;
      Object.values(STORE).forEach((storeName) => {
        if (!db.objectStoreNames.contains(storeName)) {
          // id-based lookups
          const keyPath = storeName === STORE.counters || storeName === STORE.leaveSettings ? 'key' : 'id';
          const store = db.createObjectStore(storeName, { keyPath });
          // extra indexes for common queries
          if (storeName === STORE.users) {
            store.createIndex('email', 'email', { unique: true });
            store.createIndex('empId', 'empId', { unique: true });
          }
          if (storeName === STORE.tasks) store.createIndex('userId', 'userId', { unique: false });
          if (storeName === STORE.claims) store.createIndex('claimNumber', 'claimNumber', { unique: true });
          if (storeName === STORE.payments) store.createIndex('claimNumber', 'claimNumber', { unique: false });
          if (storeName === STORE.leaveRequests) store.createIndex('email', 'email', { unique: false });
          if (storeName === STORE.attendance) store.createIndex('userId', 'userId', { unique: false });
        } else {
          const store = req.transaction.objectStore(storeName);
          if (storeName === STORE.users) {
            if (!store.indexNames.contains('email')) store.createIndex('email', 'email', { unique: true });
            if (!store.indexNames.contains('empId')) store.createIndex('empId', 'empId', { unique: true });
          }
          if (storeName === STORE.tasks && !store.indexNames.contains('userId')) store.createIndex('userId', 'userId', { unique: false });
          if (storeName === STORE.claims && !store.indexNames.contains('claimNumber')) store.createIndex('claimNumber', 'claimNumber', { unique: true });
          if (storeName === STORE.payments && !store.indexNames.contains('claimNumber')) store.createIndex('claimNumber', 'claimNumber', { unique: false });
          if (storeName === STORE.leaveRequests && !store.indexNames.contains('email')) store.createIndex('email', 'email', { unique: false });
          if (storeName === STORE.attendance && !store.indexNames.contains('userId')) store.createIndex('userId', 'userId', { unique: false });
        }
      });

      req.transaction.objectStore(STORE.counters).put({ key: 'claimNumber', value: 'CF/24-25/' });
      req.transaction.objectStore(STORE.leaveSettings).put({
        key: 'global',
        totalLeaves: 30,
        leavesTaken: 0,
        lastResetDate: new Date().toISOString(),
        isGlobal: true
      });
    };

    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function tx(storeName, mode, fn) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const t = db.transaction(storeName, mode);
    const store = t.objectStore(storeName);
    Promise.resolve(fn(store))
      .then((res) => {
        t.oncomplete = () => resolve(res);
        t.onerror = () => reject(t.error);
      })
      .catch(reject);
  });
}

export async function getAll(storeName) {
  const items = await tx(storeName, 'readonly', (store) => {
    return new Promise((resolve, reject) => {
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  });
  return items || [];
}

export async function getById(storeName, id) {
  return tx(storeName, 'readonly', (store) => store.get(id));
}

export async function put(storeName, value) {
  return tx(storeName, 'readwrite', (store) => store.put(value));
}

export async function del(storeName, id) {
  return tx(storeName, 'readwrite', (store) => store.delete(id));
}

export async function queryIndex(storeName, indexName, value) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const t = db.transaction(storeName, 'readonly');
    const store = t.objectStore(storeName);
    const index = store.index(indexName);
    const req = index.getAll(value);
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

export async function ensureSeedData() {
  const users = await getAll(STORE.users);
  const existingAdmin = users.find((user) => user.email === 'admin@gmail.com')
    || users.find((user) => user.email === 'admin123');
  const adminUser = {
    id: existingAdmin?.id || 'local-admin-123',
    name: existingAdmin?.name || 'Admin',
    empId: existingAdmin?.empId || 'admin',
    email: 'admin@gmail.com',
    password: '123456',
    role: 'admin',
    phone: existingAdmin?.phone || '',
    address: existingAdmin?.address || '',
    BloodGroup: existingAdmin?.BloodGroup || '',
    Designation: existingAdmin?.Designation || '',
    Gender: existingAdmin?.Gender || '',
    profileImage: existingAdmin?.profileImage || '',
    teams: existingAdmin?.teams || [],
    requirePasswordChange: false,
    createdAt: existingAdmin?.createdAt || new Date().toISOString()
  };

  await put(STORE.users, adminUser);

  const oldAdmin = users.find((user) => user.email === 'admin123' && user.id !== adminUser.id);
  if (oldAdmin) await del(STORE.users, oldAdmin.id);

  const globalLeaveSettings = await getById(STORE.leaveSettings, 'global');
  if (!globalLeaveSettings) {
    await put(STORE.leaveSettings, {
      key: 'global',
      totalLeaves: 30,
      leavesTaken: 0,
      lastResetDate: new Date().toISOString(),
      isGlobal: true
    });
  }
}

export async function nextClaimNumber() {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const t = db.transaction(STORE.counters, 'readwrite');
    const store = t.objectStore(STORE.counters);

    const getReq = store.get('claimNumber');
    getReq.onsuccess = () => {
      const counter = getReq.result || { key: 'claimNumber', value: 'CF/24-25/' };
      // Keep simple: incrementing suffix number
      const base = (counter.value || 'CF/24-25/').replace(/\d+$/, '');
      const numberPart = (counter.value.match(/(\d+)\s*$/) || [null, '0'])[1];
      const next = parseInt(numberPart || '0', 10) + 1;

      // If existing value already has no numeric suffix, start from 1
      const nextStr = `${base}${String(next).padStart(3, '0')}`;
      counter.value = nextStr;
      const putReq = store.put(counter);
      putReq.onsuccess = () => resolve({ claimNumber: nextStr });
      putReq.onerror = () => reject(putReq.error);
    };
    getReq.onerror = () => reject(getReq.error);
  });
}

export async function getCounterValue(key, defaultValue) {
  const item = await getById(STORE.counters, key);
  return item?.value ?? defaultValue;
}
