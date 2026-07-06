export type Area = 'Front Part Area' | 'Back Part Area' | 'Output Area';
export type RecordStatus = 'active' | 'closed';

export interface Recipient {
  name: string;
  area: Area;
  cardNumber?: string;
}

export interface IssuedItems {
  bobbin: boolean;
  case: boolean;
  needle: number; // 0 = none
  knife: boolean;
}

export interface ReturnedItems {
  bobbin: boolean;
  case: boolean;
  needle: number; // how many needles returned (0 = none returned yet)
  knife: boolean;
}

export interface MachineRecord {
  id: string;
  lineNumber: number;
  machineType: string;
  machineNumber: string;
  recipient: Recipient;
  issuedItems: IssuedItems;
  returnedItems: ReturnedItems;
  status: RecordStatus;
  issuedAt: string;
  returnedAt?: string;
  notes?: string;
}

export interface UserProfile {
  name: string;
  cardNumber: string;
  floor: string;
  designation: string;
  photo?: string;
  createdAt: string;
}

export interface AppData {
  version: string;
  profile: UserProfile | null;
  records: MachineRecord[];
  exportedAt?: string;
}

export interface MachineConfig {
  hasBobbin: boolean;
  hasCase: boolean;
  needleOptions: number[]; // available needle counts (excluding 0 — 0 = no needle is always shown)
  defaultNeedle: number;   // pre-selected needle count
  hasKnife: boolean;
}

export const MACHINE_TYPES: Record<string, MachineConfig> = {
  'Plane Machine (Auto)':     { hasBobbin: true,  hasCase: true,  needleOptions: [1],          defaultNeedle: 1, hasKnife: false },
  'Plane Machine (Manual)':   { hasBobbin: true,  hasCase: true,  needleOptions: [1],          defaultNeedle: 1, hasKnife: false },
  'Plane Machine (Vertical)': { hasBobbin: true,  hasCase: true,  needleOptions: [1],          defaultNeedle: 1, hasKnife: false },
  'Overlock (4 Thread)':      { hasBobbin: false, hasCase: false, needleOptions: [1, 2],       defaultNeedle: 2, hasKnife: false },
  'Overlock (5 Thread)':      { hasBobbin: false, hasCase: false, needleOptions: [1, 2],       defaultNeedle: 2, hasKnife: false },
  'Overlock (6 Thread)':      { hasBobbin: false, hasCase: false, needleOptions: [1, 2],       defaultNeedle: 2, hasKnife: false },
  'Two Needle / Double Needle':{ hasBobbin: true,  hasCase: false, needleOptions: [1, 2],      defaultNeedle: 2, hasKnife: false },
  'Flat Lock':                { hasBobbin: false, hasCase: false, needleOptions: [1, 2],       defaultNeedle: 1, hasKnife: false },
  'Kansai':                   { hasBobbin: false, hasCase: false, needleOptions: [1, 2, 3, 4], defaultNeedle: 1, hasKnife: false },
  'Fit of The Arm':           { hasBobbin: false, hasCase: false, needleOptions: [1, 2],       defaultNeedle: 2, hasKnife: false },
  'Button Hole':              { hasBobbin: true,  hasCase: true,  needleOptions: [1],          defaultNeedle: 1, hasKnife: true  },
  'Eyelet Hole':              { hasBobbin: false, hasCase: false, needleOptions: [1],          defaultNeedle: 1, hasKnife: true  },
  'Bar Teck':                 { hasBobbin: true,  hasCase: true,  needleOptions: [1],          defaultNeedle: 1, hasKnife: false },
  'Button Stitch':            { hasBobbin: true,  hasCase: true,  needleOptions: [1],          defaultNeedle: 1, hasKnife: false },
  'Chain Stitch':             { hasBobbin: false, hasCase: false, needleOptions: [1, 2],       defaultNeedle: 1, hasKnife: false },
  'Blind Stitch':             { hasBobbin: false, hasCase: false, needleOptions: [1],          defaultNeedle: 1, hasKnife: false },
  'Pocket Rolling':           { hasBobbin: false, hasCase: false, needleOptions: [1, 2],       defaultNeedle: 1, hasKnife: false },
};

export const MACHINE_TYPE_KEYS = Object.keys(MACHINE_TYPES);
export const LINE_NUMBERS = Array.from({ length: 19 }, (_, i) => i + 1);
export const AREAS: Area[] = ['Front Part Area', 'Back Part Area', 'Output Area'];
export const APP_VERSION = '1.0.0';
