import { AppSettings } from '../models';
import { IDatabaseProvider } from '../database/DatabaseProvider';
import { STORES } from '../database/AppDatabase';

const SETTINGS_KEY = 'app';

type SettingsRow = AppSettings & { id: string };

const DEFAULTS: AppSettings = { darkMode: false, language: 'bn' };

export class SettingsRepository {
  constructor(private readonly db: IDatabaseProvider) {}

  async getSettings(): Promise<AppSettings> {
    const row = await this.db.get<SettingsRow>(STORES.SETTINGS, SETTINGS_KEY);
    if (!row) return { ...DEFAULTS };
    const { id: _id, ...settings } = row;
    return settings as AppSettings;
  }

  async saveSettings(settings: Partial<AppSettings>): Promise<void> {
    const current = await this.getSettings();
    await this.db.put<SettingsRow>(STORES.SETTINGS, {
      id: SETTINGS_KEY,
      ...current,
      ...settings,
    });
  }

  async getDarkMode(): Promise<boolean> {
    const s = await this.getSettings();
    return s.darkMode;
  }

  async setDarkMode(darkMode: boolean): Promise<void> {
    await this.saveSettings({ darkMode });
  }
}
