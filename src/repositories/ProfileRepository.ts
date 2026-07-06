import { UserProfile } from '../types';
import { IDatabaseProvider } from '../database/DatabaseProvider';
import { STORES } from '../database/AppDatabase';

const PROFILE_KEY = 'singleton';
const PHOTO_KEY   = 'profilePhoto';

type ProfileRow = Omit<UserProfile, 'photo'> & { id: string };
interface AssetRow { id: string; data: string }

export class ProfileRepository {
  constructor(private readonly db: IDatabaseProvider) {}

  /** Returns profile data without photo (avoids loading large binary). */
  async getProfile(): Promise<UserProfile | null> {
    const row = await this.db.get<ProfileRow>(STORES.PROFILE, PROFILE_KEY);
    if (!row) return null;
    const { id: _id, ...profile } = row;
    return profile as UserProfile;
  }

  async getPhoto(): Promise<string | undefined> {
    const asset = await this.db.get<AssetRow>(STORES.ASSETS, PHOTO_KEY);
    return asset?.data;
  }

  /** Returns profile merged with photo — use for display or export. */
  async getProfileWithPhoto(): Promise<UserProfile | null> {
    const profile = await this.getProfile();
    if (!profile) return null;
    const photo = await this.getPhoto();
    return { ...profile, photo };
  }

  /** Saves profile. Photo is stored separately in ASSETS to keep PROFILE store small. */
  async saveProfile(profile: UserProfile): Promise<void> {
    const { photo, ...rest } = profile;
    await this.db.put<ProfileRow>(STORES.PROFILE, { id: PROFILE_KEY, ...rest });
    await this.savePhoto(photo);
  }

  async savePhoto(photo: string | undefined): Promise<void> {
    if (photo) {
      await this.db.put<AssetRow>(STORES.ASSETS, { id: PHOTO_KEY, data: photo });
    } else {
      await this.db.delete(STORES.ASSETS, PHOTO_KEY);
    }
  }
}
