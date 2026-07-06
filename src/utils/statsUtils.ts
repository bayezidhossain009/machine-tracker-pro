import { MachineRecord } from '../types';

/** True when the record is active AND at least one issued item is still unreturned. */
export function hasPendingItems(r: MachineRecord): boolean {
  return r.status === 'active' && (
    (r.issuedItems.bobbin && !r.returnedItems.bobbin) ||
    (r.issuedItems.case && !r.returnedItems.case) ||
    (r.issuedItems.needle > 0 && r.returnedItems.needle < r.issuedItems.needle) ||
    (r.issuedItems.knife && !r.returnedItems.knife)
  );
}

/**
 * True when the record is active AND the worker has returned SOME items
 * but NOT all — i.e., a partial/incomplete return.
 *
 * Records where nothing has been returned yet are excluded.
 */
export function hasPartialReturn(r: MachineRecord): boolean {
  if (r.status !== 'active') return false;

  const someReturned =
    (r.issuedItems.bobbin && r.returnedItems.bobbin) ||
    (r.issuedItems.case && r.returnedItems.case) ||
    (r.issuedItems.needle > 0 && r.returnedItems.needle > 0) ||
    (r.issuedItems.knife && r.returnedItems.knife);

  return !!someReturned && hasPendingItems(r);
}

export interface Stats {
  total: number;
  active: number;
  closed: number;
  /** Records with a partial (incomplete) return. */
  partialReturn: number;
  pendingBobbin: number;
  pendingCase: number;
  pendingNeedle: number;
  pendingKnife: number;
}

export function calcStats(records: MachineRecord[]): Stats {
  const total = records.length;
  const active = records.filter(r => r.status === 'active').length;
  const closed = records.filter(r => r.status === 'closed').length;
  const partialReturn = records.filter(hasPartialReturn).length;
  let pendingBobbin = 0, pendingCase = 0, pendingNeedle = 0, pendingKnife = 0;
  for (const r of records) {
    if (r.status !== 'active') continue;
    if (r.issuedItems.bobbin && !r.returnedItems.bobbin) pendingBobbin++;
    if (r.issuedItems.case && !r.returnedItems.case) pendingCase++;
    if (r.issuedItems.needle > 0 && r.returnedItems.needle < r.issuedItems.needle) pendingNeedle++;
    if (r.issuedItems.knife && !r.returnedItems.knife) pendingKnife++;
  }
  return { total, active, closed, partialReturn, pendingBobbin, pendingCase, pendingNeedle, pendingKnife };
}

export interface PendingCounts {
  bobbin: number;
  case: number;
  needle: number;
  knife: number;
  total: number;
}

export function calcPendingCounts(records: MachineRecord[]): PendingCounts {
  let bobbin = 0, caseCount = 0, needle = 0, knife = 0;
  for (const r of records) {
    if (r.status !== 'active') continue;
    if (r.issuedItems.bobbin && !r.returnedItems.bobbin) bobbin++;
    if (r.issuedItems.case && !r.returnedItems.case) caseCount++;
    needle += Math.max(0, r.issuedItems.needle - r.returnedItems.needle);
    if (r.issuedItems.knife && !r.returnedItems.knife) knife++;
  }
  return { bobbin, case: caseCount, needle, knife, total: bobbin + caseCount + needle + knife };
}
