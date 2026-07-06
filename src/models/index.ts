// ─── Re-exports from core types ─────────────────────────────────────────────
export type {
  Area,
  RecordStatus,
  Recipient,
  IssuedItems,
  ReturnedItems,
  MachineRecord,
  UserProfile,
  AppData,
  MachineConfig,
} from '../types';

export {
  MACHINE_TYPES,
  MACHINE_TYPE_KEYS,
  LINE_NUMBERS,
  AREAS,
  APP_VERSION,
} from '../types';

// ─── Extended domain models ──────────────────────────────────────────────────

/** Represents a production line in the factory. */
export interface Line {
  id: string;
  number: number;
  name?: string;
  floor?: string;
  capacity?: number;
  createdAt: string;
}

/** Represents a machine breakdown / maintenance event. */
export interface Breakdown {
  id: string;
  machineNumber: string;
  lineNumber: number;
  machineType: string;
  reason?: string;
  reportedAt: string;
  resolvedAt?: string;
  status: 'reported' | 'in_progress' | 'resolved';
}

/** Persisted application-level settings. */
export interface AppSettings {
  darkMode: boolean;
  language?: 'bn' | 'en';
}
