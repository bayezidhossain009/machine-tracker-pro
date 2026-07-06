import { SQLiteDBConnection } from '@capacitor-community/sqlite';

import { IDatabaseProvider } from './DatabaseProvider';
import { getSQLiteDatabase } from './DatabaseFactory';

export class CapacitorSQLiteProvider implements IDatabaseProvider {
  private db: SQLiteDBConnection | null = null;

  private async getDB(): Promise<SQLiteDBConnection> {
    if (!this.db) {
      this.db = await getSQLiteDatabase();
    }
    return this.db;
  }

  async get<T>(storeName: string, key: string): Promise<T | null> {
    const db = await this.getDB();

    const result = await db.query(
      `SELECT data
       FROM kv_store
       WHERE store_name = ?
         AND id = ?`,
      [storeName, key]
    );

    const rows = result.values ?? [];

    if (rows.length === 0) {
      return null;
    }

    return JSON.parse(rows[0].data as string) as T;
  }

  async put<T>(storeName: string, value: T): Promise<void> {
    const db = await this.getDB();

    const row = value as Record<string, unknown>;

    if (typeof row.id !== 'string') {
      throw new Error('Record must contain a string id');
    }

    await db.run(
      `INSERT OR REPLACE INTO kv_store (store_name, id, data)
       VALUES (?, ?, ?)`,
      [
        storeName,
        row.id,
        JSON.stringify(value),
      ]
    );
  }

  async getAll<T>(storeName: string): Promise<T[]> {
    const db = await this.getDB();

    const result = await db.query(
      `SELECT data
       FROM kv_store
       WHERE store_name = ?`,
      [storeName]
    );

    const rows = result.values ?? [];

    return rows.map((row: any) => JSON.parse(row.data));
  }

  async delete(storeName: string, key: string): Promise<void> {
    const db = await this.getDB();

    await db.run(
      `DELETE FROM kv_store
       WHERE store_name = ?
         AND id = ?`,
      [storeName, key]
    );
  }

  async clear(storeName: string): Promise<void> {
    const db = await this.getDB();

    await db.run(
      `DELETE FROM kv_store
       WHERE store_name = ?`,
      [storeName]
    );
  }
}
