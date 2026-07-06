import { useState, useEffect } from 'react';
import { FileText, Search, X, Wrench, CheckCircle, Clock, AlertTriangle, SlidersHorizontal } from 'lucide-react';
import { searchRecords, hasPartialReturn } from '../store';
import { MachineRecord } from '../types';
import EditRecordModal from '../components/EditRecordModal';
import { useTheme } from '../ThemeContext';

interface Props {
  refreshKey: number;
  onSaved: () => void;
  initialFilter?: string;
}

type FilterType = 'all' | 'active' | 'closed' | 'pending';

export default function Records({ refreshKey, onSaved, initialFilter }: Props) {
  const { c } = useTheme();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<FilterType>((initialFilter as FilterType) || 'all');
  const [records, setRecords] = useState<MachineRecord[]>([]);
  const [editing, setEditing] = useState<MachineRecord | null>(null);
  const [showFilter, setShowFilter] = useState(false);

  useEffect(() => {
    let active = true;
    searchRecords(query).then(r => { if (active) setRecords(r); });
    return () => { active = false; };
  }, [query, refreshKey]);

  useEffect(() => {
    if (initialFilter) setFilter(initialFilter as FilterType);
  }, [initialFilter]);

  const filtered = records.filter(r => {
    if (filter === 'active') return r.status === 'active';
    if (filter === 'closed') return r.status === 'closed';
    if (filter === 'pending') return hasPartialReturn(r);
    return true;
  });

  function formatDate(iso: string) {
    const d = new Date(iso);
    return d.toLocaleDateString('en-GB') + ' ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  }

  const filterOptions: { id: FilterType; label: string; color: string }[] = [
    { id: 'all', label: 'সব রেকর্ড', color: '#1e40af' },
    { id: 'active', label: 'Active', color: '#f59e0b' },
    { id: 'closed', label: 'Closed', color: '#22c55e' },
    { id: 'pending', label: 'আংশিক জমা', color: '#ef4444' },
  ];

  const activeFilter = filterOptions.find(f => f.id === filter)!;

  return (
    <div className="min-h-screen" style={{ background: c.pageBg }}>
      {/* Header */}
      <div className="px-4 py-5" style={{ background: 'linear-gradient(135deg, #1e3a5f, #1e40af)' }}>
        <div className="flex items-center gap-3 mb-4">
          <FileText size={28} color="#fff" strokeWidth={2} />
          <div>
            <h1 style={{ color: '#fff', fontSize: 20, fontWeight: 700 }}>Records</h1>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>All machine issue records</p>
          </div>
        </div>

        {/* Search + Filter row */}
        <div className="flex gap-2">
          <div className="flex-1 flex items-center gap-3 px-4 py-3 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)' }}>
            <Search size={18} color="rgba(255,255,255,0.7)" />
            <input type="text" value={query} onChange={e => setQuery(e.target.value)}
              placeholder="নাম, কার্ড, মেশিন, লাইন..."
              className="flex-1 outline-none"
              style={{ background: 'transparent', fontSize: 15, color: '#fff' }} />
            {query && <button onClick={() => setQuery('')}><X size={16} color="rgba(255,255,255,0.7)" /></button>}
          </div>
          {/* Filter button */}
          <button onClick={() => setShowFilter(!showFilter)}
            className="px-3 rounded-xl flex items-center gap-1"
            style={{
              background: filter !== 'all' ? '#f59e0b' : 'rgba(255,255,255,0.12)',
              border: `1px solid ${filter !== 'all' ? '#f59e0b' : 'rgba(255,255,255,0.2)'}`,
              color: '#fff', minWidth: 48,
            }}>
            <SlidersHorizontal size={18} />
          </button>
        </div>

        {/* Active filter indicator */}
        {filter !== 'all' && (
          <div className="flex items-center gap-2 mt-2">
            <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>Filter:</span>
            <span style={{
              background: activeFilter.color, color: '#fff',
              fontSize: 12, fontWeight: 700, padding: '2px 10px', borderRadius: 20,
            }}>
              {activeFilter.label}
            </span>
            <button onClick={() => setFilter('all')} style={{ color: 'rgba(255,255,255,0.6)' }}>
              <X size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Filter dropdown */}
      {showFilter && (
        <div className="mx-4 mt-3 rounded-xl overflow-hidden shadow-lg"
          style={{ background: c.cardBg, border: `1px solid ${c.border}`, zIndex: 10, position: 'relative' }}>
          {filterOptions.map(opt => (
            <button key={opt.id}
              onClick={() => { setFilter(opt.id); setShowFilter(false); }}
              className="w-full flex items-center gap-3 px-4 py-3 text-left"
              style={{
                background: filter === opt.id ? `${opt.color}18` : 'transparent',
                borderBottom: `1px solid ${c.border}`,
              }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: opt.color, flexShrink: 0 }} />
              <span style={{ color: c.textPrimary, fontSize: 15, fontWeight: filter === opt.id ? 700 : 400 }}>
                {opt.label}
              </span>
              <span style={{ color: c.textMuted, fontSize: 13, marginLeft: 'auto' }}>
                ({records.filter(r => {
                  if (opt.id === 'active') return r.status === 'active';
                  if (opt.id === 'closed') return r.status === 'closed';
                  if (opt.id === 'pending') return hasPendingItems(r);
                  return true;
                }).length})
              </span>
            </button>
          ))}
        </div>
      )}

      <div className="page-content">
        <div className="px-4 py-2">
          <p style={{ color: c.textMuted, fontSize: 13 }}>{filtered.length} রেকর্ড পাওয়া গেছে</p>
        </div>

        <div className="px-4 flex flex-col gap-3 pb-4">
          {filtered.length === 0 ? (
            <div className="rounded-xl p-10 flex flex-col items-center gap-3"
              style={{ background: c.cardBg, border: `1.5px dashed ${c.border}` }}>
              <FileText size={40} color={c.textMuted} strokeWidth={1.5} />
              <p style={{ color: c.textMuted, fontSize: 15 }}>কোনো রেকর্ড নেই</p>
            </div>
          ) : (
            filtered.map(r => (
              <RecordItem key={r.id} record={r} isPending={hasPendingItems(r)}
                formatDate={formatDate} onEdit={() => setEditing(r)} c={c} />
            ))
          )}
        </div>
      </div>

      {editing && (
        <EditRecordModal
          record={editing}
          onClose={() => setEditing(null)}
          onSaved={() => { onSaved(); searchRecords(query).then(setRecords); }}
        />
      )}
    </div>
  );
}

function RecordItem({ record: r, isPending, formatDate, onEdit, c }: {
  record: MachineRecord; isPending: boolean;
  formatDate: (s: string) => string; onEdit: () => void;
  c: ReturnType<typeof useTheme>['c'];
}) {
  const isActive = r.status === 'active';
  return (
    <button onClick={onEdit} className="rounded-xl p-4 text-left w-full"
      style={{
        background: c.cardBg,
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        border: isPending ? '1.5px solid #f59e0b44' : `1.5px solid ${c.border}`,
      }}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <div style={{ background: isActive ? c.amberBg : c.successBg, borderRadius: 8, padding: 6 }}>
            <Wrench size={18} color={isActive ? '#f59e0b' : '#22c55e'} />
          </div>
          <div>
            <p style={{ color: c.textPrimary, fontWeight: 700, fontSize: 15 }}>
              Line {r.lineNumber} — {r.machineNumber}
            </p>
            <p style={{ color: c.textSecondary, fontSize: 13 }}>{r.machineType}</p>
          </div>
        </div>
        <span style={{
          background: isActive ? (isPending ? '#fff7ed' : c.amberBg) : c.successBg,
          color: isActive ? (isPending ? '#b45309' : '#b45309') : '#16a34a',
          fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 20, flexShrink: 0,
        }}>
          {isActive ? (isPending ? 'বাকি' : 'Active') : 'Closed'}
        </span>
      </div>

      <div className="flex items-center gap-3 py-2 mb-2"
        style={{ borderTop: `1px solid ${c.border}`, borderBottom: `1px solid ${c.border}` }}>
        <div style={{
          width: 32, height: 32, borderRadius: '50%', background: '#f59e0b',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 700, fontSize: 14, color: '#fff', flexShrink: 0,
        }}>
          {r.recipient.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1">
          <p style={{ color: c.textPrimary, fontWeight: 600, fontSize: 14 }}>{r.recipient.name}</p>
          <p style={{ color: c.textMuted, fontSize: 12 }}>
            {r.recipient.area}{r.recipient.cardNumber ? ` • ${r.recipient.cardNumber}` : ''}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-1 mb-2">
        {r.issuedItems.bobbin && (
          <ItemBadge label="Bobbin" returned={r.returnedItems.bobbin} c={c} />
        )}
        {r.issuedItems.case && (
          <ItemBadge label="Case" returned={r.returnedItems.case} c={c} />
        )}
        {r.issuedItems.needle > 0 && (
          <ItemBadge
            label={`Needle (${r.returnedItems.needle}/${r.issuedItems.needle})`}
            returned={r.returnedItems.needle >= r.issuedItems.needle}
            c={c}
          />
        )}
        {r.issuedItems.knife && (
          <ItemBadge label="Knife" returned={r.returnedItems.knife} c={c} />
        )}
      </div>

      <div className="flex items-center gap-1">
        <Clock size={12} color={c.textMuted} />
        <p style={{ color: c.textMuted, fontSize: 12 }}>Issued: {formatDate(r.issuedAt)}</p>
      </div>
      {r.returnedAt && (
        <div className="flex items-center gap-1 mt-0.5">
          <CheckCircle size={12} color="#22c55e" />
          <p style={{ color: '#22c55e', fontSize: 12 }}>Closed: {formatDate(r.returnedAt)}</p>
        </div>
      )}
      {isPending && (
        <div className="flex items-center gap-1 mt-1">
          <AlertTriangle size={12} color="#f59e0b" />
          <p style={{ color: '#b45309', fontSize: 12, fontWeight: 600 }}>কিছু জিনিস এখনো ফেরত আসেনি</p>
        </div>
      )}
    </button>
  );
}

function ItemBadge({ label, returned, c }: {
  label: string; returned: boolean; c: ReturnType<typeof useTheme>['c'];
}) {
  return (
    <span style={{
      background: returned ? c.badgeDone : c.badgePending,
      color: returned ? c.badgeDoneText : c.badgePendingText,
      fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20,
      border: `1px solid ${returned ? '#22c55e33' : '#f59e0b33'}`,
    }}>
      {returned ? '✓ ' : ''}{label}
    </span>
  );
}
