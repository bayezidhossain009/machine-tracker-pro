import { MachineRecord } from '../types';
import { MachineRepository } from '../repositories/MachineRepository';
import {
  hasPartialReturn,
  calcStats,
  calcPendingCounts,
  Stats,
  PendingCounts,
} from '../utils/statsUtils';

export class RecordService {
  constructor(private readonly repo: MachineRepository) {}

  async getStats(): Promise<Stats> {
    return calcStats(await this.repo.findAll());
  }

  async getPendingCounts(): Promise<PendingCounts> {
    return calcPendingCounts(await this.repo.findAll());
  }

  /** Returns only records with a partial (incomplete) return — NOT zero-return records. */
  async getPartialReturnRecords(): Promise<MachineRecord[]> {
    const all = await this.repo.findAll();
    return all.filter(hasPartialReturn);
  }

  async search(query: string): Promise<MachineRecord[]> {
    const all = await this.repo.findAll();
    if (!query.trim()) return all;
    const q = query.trim().toLowerCase();
    return all.filter(r =>
      r.recipient.name.toLowerCase().includes(q) ||
      (r.recipient.cardNumber ?? '').toLowerCase().includes(q) ||
      r.machineNumber.toLowerCase().includes(q) ||
      r.lineNumber.toString() === q ||
      r.machineType.toLowerCase().includes(q),
    );
  }
}
