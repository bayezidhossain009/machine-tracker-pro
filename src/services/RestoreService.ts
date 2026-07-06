import { ProfileRepository } from '../repositories/ProfileRepository';
import { MachineRepository } from '../repositories/MachineRepository';
import { BackupPayload } from './BackupService';

export interface RestoreResult {
  success: boolean;
  message: string;
  recordsRestored?: number;
}

/**
 * Restores application data from a backup file produced by BackupService.
 * Replaces all existing records; profile is updated if present in backup.
 */
export class RestoreService {
  constructor(
    private readonly profileRepo: ProfileRepository,
    private readonly machineRepo: MachineRepository,
  ) {}

  async restoreFromFile(file: File): Promise<RestoreResult> {
    return new Promise(resolve => {
      const reader = new FileReader();

      reader.onload = async e => {
        try {
          const payload = JSON.parse(e.target?.result as string) as BackupPayload;

          if (!Array.isArray(payload.records)) {
            resolve({ success: false, message: 'ফাইলটি সঠিক ফরম্যাটে নেই।' });
            return;
          }

          await this.machineRepo.clear();
          for (const r of payload.records) {
            await this.machineRepo.save(r);
          }

          if (payload.profile) {
            await this.profileRepo.saveProfile(payload.profile);
          }

          resolve({
            success: true,
            message: `${payload.records.length} রেকর্ড সফলভাবে রিস্টোর হয়েছে।`,
            recordsRestored: payload.records.length,
          });
        } catch {
          resolve({ success: false, message: 'ফাইল পড়তে সমস্যা হয়েছে।' });
        }
      };

      reader.onerror = () => resolve({ success: false, message: 'ফাইল খুলতে পারেনি।' });
      reader.readAsText(file);
    });
  }
}
