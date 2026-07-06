import { MachineRecord } from '../types';
import { IDatabaseProvider } from '../database/DatabaseProvider';
import { STORES } from '../database/AppDatabase';
import { IRepository } from './IRepository';

/**
 * All persistence for machine-issue records.
 * UI and services must never touch the database directly.
 */
export class MachineRepository implements IRepository<MachineRecord> {
  constructor(private readonly db: IDatabaseProvider) {}

  async findById(id: string): Promise<MachineRecord | null> {
    return this.db.get<MachineRecord>(STORES.RECORDS, id);
  }

  /** Returns all records sorted newest-first by issuedAt. */
  async findAll(): Promise<MachineRecord[]> {
    const rows = await this.db.getAll<MachineRecord>(STORES.RECORDS);
    return rows.sort(
      (a, b) => new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime(),
    );
  }

  async findByStatus(status: 'active' | 'closed'): Promise<MachineRecord[]> {
    const all = await this.findAll();
    return all.filter(r => r.status === status);
  }

  async save(record: MachineRecord): Promise<void> {
    await this.db.put<MachineRecord>(STORES.RECORDS, record);
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(STORES.RECORDS, id);
  }

  async clear(): Promise<void> {
    await this.db.clear(STORES.RECORDS);
  }
}
