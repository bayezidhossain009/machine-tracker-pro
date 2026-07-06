import { IDatabaseProvider } from './DatabaseProvider';
import { IndexedDBProvider }  from './IndexedDBProvider';
import { Capacitor } from '@capacitor/core';
import { CapacitorSQLiteProvider } from './CapacitorSQLiteProvider';

export const DB_NAME    = 'MachineTrackerDB';
export const DB_VERSION = 2; // Bumped: added lines, breakdowns, settings stores

/** Object store names — single source of truth. */
export const STORES = {
  PROFILE:    'profile',    // { id: 'singleton', ...UserProfile (no photo) }
  RECORDS:    'records',    // MachineRecord[] keyed by id
  ASSETS:     'assets',     // { id: string, data: string } — photos, blobs
  LINES:      'lines',      // Line[] keyed by id (future)
  BREAKDOWNS: 'breakdowns', // Breakdown[] keyed by id (future)
  SETTINGS:   'settings',   // { id: 'app', ...AppSettings }
} as const;

// ─── Singleton cache ─────────────────────────────────────────────────────────

let _provider:    IDatabaseProvider | null = null;
let _initPromise: Promise<IDatabaseProvider> | null = null;

// ─── IndexedDB schema ────────────────────────────────────────────────────────

function openIDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = event => {
      const db = (event.target as IDBOpenDBRequest).result;

      // v1 stores (idempotent)
      if (!db.objectStoreNames.contains(STORES.PROFILE)) {
        db.createObjectStore(STORES.PROFILE, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORES.RECORDS)) {
        const s = db.createObjectStore(STORES.RECORDS, { keyPath: 'id' });
        s.createIndex('status',   'status',   { unique: false });
        s.createIndex('issuedAt', 'issuedAt', { unique: false });
      }
      if (!db.objectStoreNames.contains(STORES.ASSETS)) {
        db.createObjectStore(STORES.ASSETS, { keyPath: 'id' });
      }

      // v2 stores (new in this version)
      if (!db.objectStoreNames.contains(STORES.LINES)) {
        const s = db.createObjectStore(STORES.LINES, { keyPath: 'id' });
        s.createIndex('number', 'number', { unique: true });
      }
      if (!db.objectStoreNames.contains(STORES.BREAKDOWNS)) {
        const s = db.createObjectStore(STORES.BREAKDOWNS, { keyPath: 'id' });
        s.createIndex('status',      'status',      { unique: false });
        s.createIndex('machineNumber','machineNumber',{ unique: false });
        s.createIndex('reportedAt',  'reportedAt',  { unique: false });
      }
      if (!db.objectStoreNames.contains(STORES.SETTINGS)) {
        db.createObjectStore(STORES.SETTINGS, { keyPath: 'id' });
      }
    };

    req.onsuccess  = () => resolve(req.result);
    req.onerror    = () => reject(req.error);
    req.onblocked  = () => reject(new Error('IndexedDB blocked by another tab'));
  });
}

// ─── One-time migration from legacy localStorage ─────────────────────────────

const LEGACY_DATA_KEY  = 'machine_tracker_data';
const LEGACY_PHOTO_KEY = 'machine_tracker_photo';

async function migrateFromLocalStorage(p: IDatabaseProvider): Promise<void> {
  try {
    const raw = localStorage.getItem(LEGACY_DATA_KEY);
    if (!raw) return;
    const legacy = JSON.parse(raw);

    if (Array.isArray(legacy.records)) {
      for (const r of legacy.records) await p.put(STORES.RECORDS, r);
    }
    if (legacy.profile) {
      const { photo: _photo, ...rest } = legacy.profile;
      await p.put(STORES.PROFILE, { id: 'singleton', ...rest });
      const photo = localStorage.getItem(LEGACY_PHOTO_KEY) ?? _photo;
      if (photo) await p.put(STORES.ASSETS, { id: 'profilePhoto', data: photo });
    }

    localStorage.removeItem(LEGACY_DATA_KEY);
    localStorage.removeItem(LEGACY_PHOTO_KEY);
  } catch {
    // Non-fatal — user starts fresh
  }
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Returns the singleton IDatabaseProvider.
 * Initialises IndexedDB (and runs any pending migrations) on first call.
 */
export function getDatabase(): Promise<IDatabaseProvider> {
  if (_provider) return Promise.resolve(_provider);
  if (_initPromise) return _initPromise;

  if (Capacitor.isNativePlatform()) {
    _initPromise = (async () => {
      const p = new CapacitorSQLiteProvider();
      _provider = p;
      return p;
    })();

    return _initPromise;
  }

  _initPromise = openIDB().then(async idb => {
    const p = new IndexedDBProvider(idb);
    await migrateFromLocalStorage(p);
    _provider = p;
    return p;
  });

  return _initPromise;
}
