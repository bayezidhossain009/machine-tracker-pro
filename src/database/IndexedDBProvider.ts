import { IDatabaseProvider } from './DatabaseProvider';

/**
 * Web implementation of IDatabaseProvider backed by the browser IndexedDB API.
 *
 * To add Capacitor SQLite support in the future:
 *   1. Create CapacitorSQLiteProvider implementing IDatabaseProvider.
 *   2. Swap the provider instance in AppDatabase.ts — nothing else changes.
 */
export class IndexedDBProvider implements IDatabaseProvider {
  constructor(private readonly db: IDBDatabase) {}

  get<T>(storeName: string, key: string): Promise<T | null> {
    return new Promise((resolve, reject) => {
      const req = this.db
        .transaction(storeName, 'readonly')
        .objectStore(storeName)
        .get(key);
      req.onsuccess = () => resolve((req.result as T) ?? null);
      req.onerror  = () => reject(req.error);
    });
  }

  put<T>(storeName: string, value: T): Promise<void> {
    return new Promise((resolve, reject) => {
      const req = this.db
        .transaction(storeName, 'readwrite')
        .objectStore(storeName)
        .put(value);
      req.onsuccess = () => resolve();
      req.onerror  = () => reject(req.error);
    });
  }

  getAll<T>(storeName: string): Promise<T[]> {
    return new Promise((resolve, reject) => {
      const req = this.db
        .transaction(storeName, 'readonly')
        .objectStore(storeName)
        .getAll();
      req.onsuccess = () => resolve(req.result as T[]);
      req.onerror  = () => reject(req.error);
    });
  }

  delete(storeName: string, key: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const req = this.db
        .transaction(storeName, 'readwrite')
        .objectStore(storeName)
        .delete(key);
      req.onsuccess = () => resolve();
      req.onerror  = () => reject(req.error);
    });
  }

  clear(storeName: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const req = this.db
        .transaction(storeName, 'readwrite')
        .objectStore(storeName)
        .clear();
      req.onsuccess = () => resolve();
      req.onerror  = () => reject(req.error);
    });
  }
}
