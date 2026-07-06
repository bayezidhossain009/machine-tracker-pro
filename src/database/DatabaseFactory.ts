import { Capacitor } from '@capacitor/core';
import {
  CapacitorSQLite,
  SQLiteConnection,
  SQLiteDBConnection,
} from '@capacitor-community/sqlite';

const sqlite = new SQLiteConnection(CapacitorSQLite);

let db: SQLiteDBConnection | null = null;

export async function getSQLiteDatabase(): Promise<SQLiteDBConnection> {
  if (db) return db;

  if (!Capacitor.isNativePlatform()) {
    throw new Error('SQLite is only available on Android/iOS');
  }

  db = await sqlite.createConnection(
    'MachineTrackerDB',
    false,
    'no-encryption',
    2,
    false
  );

  await db.open();
  await db.execute(`
CREATE TABLE IF NOT EXISTS kv_store (
  store_name TEXT NOT NULL,
  id TEXT NOT NULL,
  data TEXT NOT NULL,
  PRIMARY KEY (store_name, id)
);
`);

  return db;
}
