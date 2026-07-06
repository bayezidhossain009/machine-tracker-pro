import { Breakdown } from '../models';
import { IDatabaseProvider } from '../database/DatabaseProvider';
import { STORES } from '../database/AppDatabase';
import { IRepository } from './IRepository';

/**
 * Manages machine breakdown / maintenance records.
 * Ready for use when breakdown tracking is added to the UI.
 */
export class BreakdownRepository implements IRepository<Breakdown> {
  constructor(private readonly db: IDatabaseProvider) {}

  async findById(id: string): Promise<Breakdown | null> {
    return this.db.get<Breakdown>(STORES.BREAKDOWNS, id);
  }

  async findAll(): Promise<Breakdown[]> {
    const rows = await this.db.getAll<Breakdown>(STORES.BREAKDOWNS);
    return rows.sort(
      (a, b) => new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime(),
    );
  }

  async findByStatus(status: Breakdown['status']): Promise<Breakdown[]> {
    const all = await this.findAll();
    return all.filter(b => b.status === status);
  }

  async findByMachine(machineNumber: string): Promise<Breakdown[]> {
    const all = await this.findAll();
    return all.filter(b => b.machineNumber === machineNumber);
  }

  async save(breakdown: Breakdown): Promise<void> {
    await this.db.put<Breakdown>(STORES.BREAKDOWNS, breakdown);
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(STORES.BREAKDOWNS, id);
  }

  async clear(): Promise<void> {
    await this.db.clear(STORES.BREAKDOWNS);
  }
}
