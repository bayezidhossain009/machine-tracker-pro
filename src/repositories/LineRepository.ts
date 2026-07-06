import { Line } from '../models';
import { IDatabaseProvider } from '../database/DatabaseProvider';
import { STORES } from '../database/AppDatabase';
import { IRepository } from './IRepository';

/**
 * Manages production line data.
 * Ready for use when line management is added to the UI.
 */
export class LineRepository implements IRepository<Line> {
  constructor(private readonly db: IDatabaseProvider) {}

  async findById(id: string): Promise<Line | null> {
    return this.db.get<Line>(STORES.LINES, id);
  }

  async findAll(): Promise<Line[]> {
    const rows = await this.db.getAll<Line>(STORES.LINES);
    return rows.sort((a, b) => a.number - b.number);
  }

  async findByNumber(number: number): Promise<Line | null> {
    const all = await this.findAll();
    return all.find(l => l.number === number) ?? null;
  }

  async save(line: Line): Promise<void> {
    await this.db.put<Line>(STORES.LINES, line);
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(STORES.LINES, id);
  }

  async clear(): Promise<void> {
    await this.db.clear(STORES.LINES);
  }
}
