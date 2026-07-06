import { MachineRecord, UserProfile, APP_VERSION } from '../types';
import { ProfileRepository } from '../repositories/ProfileRepository';
import { MachineRepository } from '../repositories/MachineRepository';

export interface BackupPayload {
  version: string;
  exportedAt: string;
  profile: UserProfile | null;
  records: MachineRecord[];
}

/**
 * Creates a full machine-readable backup for disaster recovery.
 * The resulting JSON can be restored via RestoreService.
 */
export class BackupService {
  constructor(
    private readonly profileRepo: ProfileRepository,
    private readonly machineRepo: MachineRepository,
  ) {}

  async createBackup(): Promise<BackupPayload> {
    const [profile, records] = await Promise.all([
      this.profileRepo.getProfileWithPhoto(),
      this.machineRepo.findAll(),
    ]);
    return {
      version:    APP_VERSION,
      exportedAt: new Date().toISOString(),
      profile,
      records,
    };
  }

  async downloadBackup(): Promise<void> {
    const payload = await this.createBackup();
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `MachineTracker_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
