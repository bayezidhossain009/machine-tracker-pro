/**
 * IDatabaseProvider — abstract contract for all storage engines.
 *
 * Current implementation: IndexedDBProvider (web).
 * Future implementation: CapacitorSQLiteProvider (Android / iOS native).
 *
 * To swap engines: implement this interface and pass the new provider to
 * AppDatabase.ts — zero changes required in repositories or services.
 */
export interface IDatabaseProvider {
  /** Fetch a single record by primary key. Returns null when not found. */
  get<T>(storeName: string, key: string): Promise<T | null>;

  /** Upsert a record (insert or replace by primary key). */
  put<T>(storeName: string, value: T): Promise<void>;

  /** Fetch every record in the store. Order is implementation-defined. */
  getAll<T>(storeName: string): Promise<T[]>;

  /** Remove a record by primary key. No-op when key is absent. */
  delete(storeName: string, key: string): Promise<void>;

  /** Remove all records in the store. */
  clear(storeName: string): Promise<void>;
}
