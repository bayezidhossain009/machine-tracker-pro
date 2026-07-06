/**
 * store.ts — Single public async façade over the entire data layer.
 *
 * UI components import ONLY from this file.
 * Nothing in the UI knows about IndexedDB, repositories, or services.
 */

import { getDatabase }         from './database/AppDatabase';
import { ProfileRepository }   from './repositories/ProfileRepository';
import { MachineRepository }   from './repositories/MachineRepository';
import { SettingsRepository }  from './repositories/SettingsRepository';
import { RecordService }       from './services/RecordService';
import { BackupService }       from './services/BackupService';
import { RestoreService }      from './services/RestoreService';
import { ExportService }       from './services/ExportService';
import { MachineRecord, UserProfile } from './types';
import { AppSettings } from './models';

// ─── Re-exports for UI ───────────────────────────────────────────────────────
export { generateId }      from './utils/idGenerator';
export { resizeImage }     from './utils/imageUtils';
export { hasPendingItems, hasPartialReturn } from './utils/statsUtils';
export type { Stats, PendingCounts } from './utils/statsUtils';

// ─── Singleton repository/service cache ─────────────────────────────────────

let _profile:   ProfileRepository  | null = null;
let _machine:   MachineRepository  | null = null;
let _settings:  SettingsRepository | null = null;

async function getRepos() {
  if (_profile && _machine && _settings) {
    return { profile: _profile, machine: _machine, settings: _settings };
  }
  const db = await getDatabase();
  _profile  = new ProfileRepository(db);
  _machine  = new MachineRepository(db);
  _settings = new SettingsRepository(db);
  return { profile: _profile, machine: _machine, settings: _settings };
}

// ─── Profile ─────────────────────────────────────────────────────────────────

export async function getProfile(): Promise<UserProfile | null> {
  const { profile } = await getRepos();
  return profile.getProfileWithPhoto();
}

export async function saveProfile(p: UserProfile): Promise<void> {
  const { profile } = await getRepos();
  await profile.saveProfile(p);
}

// ─── Machine records ─────────────────────────────────────────────────────────

export async function getRecords(): Promise<MachineRecord[]> {
  const { machine } = await getRepos();
  return machine.findAll();
}

export async function addRecord(r: MachineRecord): Promise<void> {
  const { machine } = await getRepos();
  await machine.save(r);
}

export async function updateRecord(r: MachineRecord): Promise<void> {
  const { machine } = await getRepos();
  await machine.save(r);
}

export async function deleteRecord(id: string): Promise<void> {
  const { machine } = await getRepos();
  await machine.delete(id);
}

// ─── Business logic ───────────────────────────────────────────────────────────

export async function getStats() {
  const { machine } = await getRepos();
  return new RecordService(machine).getStats();
}

export async function getPendingAccessoryCounts() {
  const { machine } = await getRepos();
  return new RecordService(machine).getPendingCounts();
}

/** Returns records where some items were returned but NOT all (partial returns). */
export async function getPartialReturnRecords(): Promise<MachineRecord[]> {
  const { machine } = await getRepos();
  return new RecordService(machine).getPartialReturnRecords();
}

export async function searchRecords(query: string): Promise<MachineRecord[]> {
  const { machine } = await getRepos();
  return new RecordService(machine).search(query);
}

// ─── Backup / Restore / Export ────────────────────────────────────────────────

export async function downloadBackup(): Promise<void> {
  const { profile, machine } = await getRepos();
  await new BackupService(profile, machine).downloadBackup();
}

export async function restoreFromFile(file: File) {
  const { profile, machine } = await getRepos();
  return new RestoreService(profile, machine).restoreFromFile(file);
}

export async function exportAsJSON(): Promise<void> {
  const { machine } = await getRepos();
  await new ExportService(machine).exportJSON();
}

export async function exportAsCSV(): Promise<void> {
  const { machine } = await getRepos();
  await new ExportService(machine).exportCSV();
}

export async function clearAllData(): Promise<void> {
  const { machine } = await getRepos();
  await machine.clear();
}

// ─── Settings ─────────────────────────────────────────────────────────────────

export async function getSettings(): Promise<AppSettings> {
  const { settings } = await getRepos();
  return settings.getSettings();
}

export async function saveSettings(s: Partial<AppSettings>): Promise<void> {
  const { settings } = await getRepos();
  await settings.saveSettings(s);
}

export async function getDarkMode(): Promise<boolean> {
  const { settings } = await getRepos();
  return settings.getDarkMode();
}

export async function setDarkMode(darkMode: boolean): Promise<void> {
  const { settings } = await getRepos();
  await settings.setDarkMode(darkMode);
}
