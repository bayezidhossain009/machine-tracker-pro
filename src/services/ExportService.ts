import { MachineRecord } from '../types';
import { MachineRepository } from '../repositories/MachineRepository';

/**
 * Exports records in user-friendly formats (JSON list, CSV).
 * Use BackupService for full DR backups; use ExportService for data analysis.
 */
export class ExportService {
  constructor(private readonly machineRepo: MachineRepository) {}

  // ─── JSON ────────────────────────────────────────────────────────────────

  async exportJSON(): Promise<void> {
    const records = await this.machineRepo.findAll();
    const blob = new Blob([JSON.stringify(records, null, 2)], { type: 'application/json' });
    this.triggerDownload(blob, `MachineTracker_records_${this.dateStamp()}.json`);
  }

  // ─── CSV ─────────────────────────────────────────────────────────────────

  async exportCSV(): Promise<void> {
    const records = await this.machineRepo.findAll();
    const csv = this.toCSV(records);
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    this.triggerDownload(blob, `MachineTracker_records_${this.dateStamp()}.csv`);
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────

  private toCSV(records: MachineRecord[]): string {
    const header = [
      'ID', 'Line', 'Machine Type', 'Machine No',
      'Recipient', 'Card No', 'Area',
      'Bobbin', 'Case', 'Needle', 'Knife',
      'Returned Bobbin', 'Returned Case', 'Returned Needle', 'Returned Knife',
      'Status', 'Issued At', 'Returned At',
    ].join(',');

    const rows = records.map(r => [
      r.id,
      r.lineNumber,
      this.q(r.machineType),
      this.q(r.machineNumber),
      this.q(r.recipient.name),
      this.q(r.recipient.cardNumber ?? ''),
      this.q(r.recipient.area),
      r.issuedItems.bobbin   ? 1 : 0,
      r.issuedItems.case     ? 1 : 0,
      r.issuedItems.needle,
      r.issuedItems.knife    ? 1 : 0,
      r.returnedItems.bobbin ? 1 : 0,
      r.returnedItems.case   ? 1 : 0,
      r.returnedItems.needle,
      r.returnedItems.knife  ? 1 : 0,
      r.status,
      r.issuedAt,
      r.returnedAt ?? '',
    ].join(','));

    return [header, ...rows].join('\r\n');
  }

  /** Wrap a string value in quotes and escape any existing quotes. */
  private q(val: string): string {
    return `"${val.replace(/"/g, '""')}"`;
  }

  private dateStamp(): string {
    return new Date().toISOString().slice(0, 10);
  }

  private triggerDownload(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a   = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
