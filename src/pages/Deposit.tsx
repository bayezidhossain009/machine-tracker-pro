import { useState, useEffect } from 'react';
import { Download, Search, Check, CheckCircle, X, AlertTriangle } from 'lucide-react';
import { getRecords, updateRecord, hasPendingItems } from '../store';
import { MachineRecord, ReturnedItems } from '../types';
import { useTheme } from '../ThemeContext';
import Toast from '../components/Toast';

interface Props {
  refreshKey: number;
  onSaved: () => void;
}

export default function Deposit({ refreshKey, onSaved }: Props) {
  const { c } = useTheme();
  const [query, setQuery] = useState('');
  const [activeRecords, setActiveRecords] = useState<MachineRecord[]>([]);
  const [selected, setSelected] = useState<MachineRecord | null>(null);
  const [returnedItems, setReturnedItems] = useState<ReturnedItems>({ bobbin: false, case: false, needle: 0, knife: false });
  const [toastKey, setToastKey] = useState(0);

  useEffect(() => {
    let active = true;
    getRecords().then(all => {
      if (active) {
        setActiveRecords(all.filter(r => r.status === 'active'));
        setSelected(null);
      }
    });
    return () => { active = false; };
  }, [refreshKey]);

  const filtered = activeRecords.filter(r => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      r.recipient.name.toLowerCase().includes(q) ||
      (r.recipient.cardNumber || '').toLowerCase().includes(q) ||
      r.machineNumber.toLowerCase().includes(q) ||
      r.lineNumber.toString() === q
    );
  });

  function selectRecord(r: MachineRecord) {
    setSelected(r);
    setReturnedItems({ ...r.returnedItems });
  }

  function allReturned(r: MachineRecord, ret: ReturnedItems) {
    return (
      (!r.issuedItems.bobbin || ret.bobbin) &&
      (!r.issuedItems.case || ret.case) &&
      (r.issuedItems.needle === 0 || ret.needle >= r.issuedItems.needle) &&
      (!r.issuedItems.knife || ret.knife)
    );
  }

  async function handleDeposit() {
    if (!selected) return;
    const closed = allReturned(selected, returnedItems);
    const updated: MachineRecord = {
      ...selected,
      returnedItems,
      status: closed ? 'closed' : 'active',
      returnedAt: closed ? new Date().toISOString() : undefined,
    };
    await updateRecord(updated);
    setToastKey(k => k + 1);
    setTimeout(() => { setSelected(null); onSaved(); }, 1800);
  }

  function formatDate(iso: string) {
    const d = new Date(iso);
    return d.toLocaleDateString('en-GB') + ' ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  }

  return (
    <div className="min-h-screen" style={{ background: c.pageBg }}>
      <div className="flex items-center gap-3 px-4 py-5"
        style={{ background: 'linear-gradient(135deg, #0f766e, #0d9488)' }}>
        <Download size={28} color="#fff" strokeWidth={2} />
        <div>
          <h1 style={{ color: '#fff', fontSize: 20, fontWeight: 700 }}>Deposit Machine</h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13 }}>Record returned accessories</p>
        </div>
      </div>

      <div className="page-content px-4 py-4 flex flex-col gap-4">
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl"
          style={{ background: c.cardBg, border: `1.5px solid ${c.border}` }}>
          <Search size={18} color={c.textMuted} />
          <input type="text" value={query} onChange={e => setQuery(e.target.value)}
            placeholder="নাম, কার্ড নম্বর বা মেশিন নম্বর..."
            className="flex-1 outline-none"
            style={{ background: 'transparent', fontSize: 15, color: c.textPrimary }} />
          {query && <button onClick={() => setQuery('')}><X size={16} color={c.textMuted} /></button>}
        </div>

        {!selected && (
          <>
            <p style={{ color: c.textSecondary, fontSize: 14, fontWeight: 500 }}>
              Active Issues: {filtered.length}
            </p>
            {filtered.length === 0 ? (
              <div className="rounded-xl p-8 flex flex-col items-center gap-3"
                style={{ background: c.cardBg, border: `1.5px dashed ${c.border}` }}>
                <CheckCircle size={40} color="#22c55e" strokeWidth={1.5} />
                <p style={{ color: c.textSecondary, fontSize: 15, fontWeight: 500 }}>কোনো active issue নেই</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {filtered.map(r => (
                  <button key={r.id} onClick={() => selectRecord(r)}
                    className="rounded-xl p-4 flex items-start gap-3 text-left w-full"
                    style={{ background: c.cardBg, border: hasPendingItems(r) ? `1.5px solid ${c.amber}44` : `1px solid ${c.border}` }}>
                    <div style={{ background: c.amberBg, borderRadius: 10, padding: 8, flexShrink: 0, display: 'flex' }}>
                      <Download size={20} color="#f59e0b" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p style={{ color: c.textPrimary, fontWeight: 700, fontSize: 14 }}>
                        Line {r.lineNumber} — {r.machineNumber}
                      </p>
                      <p style={{ color: c.textSecondary, fontSize: 13 }}>{r.machineType}</p>
                      <p style={{ color: c.textMuted, fontSize: 12, marginTop: 2 }}>
                        {r.recipient.name} • {formatDate(r.issuedAt)}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {r.issuedItems.bobbin && <Tag label="Bobbin" done={r.returnedItems.bobbin} c={c} />}
                        {r.issuedItems.case && <Tag label="Case" done={r.returnedItems.case} c={c} />}
                        {r.issuedItems.needle > 0 && (
                          <Tag
                            label={`${r.returnedItems.needle}/${r.issuedItems.needle} Needle`}
                            done={r.returnedItems.needle >= r.issuedItems.needle}
                            c={c}
                          />
                        )}
                        {r.issuedItems.knife && <Tag label="Knife" done={r.returnedItems.knife} c={c} />}
                      </div>
                    </div>
                    {hasPendingItems(r) && <AlertTriangle size={18} color="#f59e0b" className="flex-shrink-0 mt-1" />}
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        {selected && (
          <div className="flex flex-col gap-4">
            <button onClick={() => setSelected(null)}
              className="flex items-center gap-2"
              style={{ color: '#0d9488', fontWeight: 600, fontSize: 14 }}>
              <X size={16} /> বাতিল করুন
            </button>

            <div className="rounded-xl p-4" style={{ background: c.cardBg }}>
              <h3 style={{ color: c.textPrimary, fontWeight: 700, fontSize: 16, marginBottom: 4 }}>
                Line {selected.lineNumber} — {selected.machineNumber}
              </h3>
              <p style={{ color: c.textSecondary, fontSize: 14 }}>{selected.machineType}</p>
              <p style={{ color: c.textMuted, fontSize: 13 }}>
                {selected.recipient.name} • {selected.recipient.area}
              </p>
              <p style={{ color: c.textMuted, fontSize: 12, marginTop: 2 }}>Issued: {formatDate(selected.issuedAt)}</p>
            </div>

            <div className="rounded-xl p-4" style={{ background: c.cardBg }}>
              <h3 style={{ color: c.textPrimary, fontWeight: 700, fontSize: 16, marginBottom: 12 }}>
                কি কি ফেরত দিয়েছে?
              </h3>
              <div className="flex flex-col gap-3">
                {selected.issuedItems.bobbin && (
                  <ReturnToggle label="Bobbin" checked={returnedItems.bobbin}
                    onToggle={() => setReturnedItems(p => ({ ...p, bobbin: !p.bobbin }))} c={c} />
                )}
                {selected.issuedItems.case && (
                  <ReturnToggle label="Case" checked={returnedItems.case}
                    onToggle={() => setReturnedItems(p => ({ ...p, case: !p.case }))} c={c} />
                )}
                {selected.issuedItems.knife && (
                  <ReturnToggle label="Knife" checked={returnedItems.knife}
                    onToggle={() => setReturnedItems(p => ({ ...p, knife: !p.knife }))} c={c} />
                )}
                {selected.issuedItems.needle > 0 && (
                  <div>
                    <p style={{ color: c.textPrimary, fontWeight: 700, fontSize: 15, marginBottom: 8 }}>
                      Needle ফেরত ({selected.issuedItems.needle}টা দেওয়া হয়েছিল)
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      {Array.from({ length: selected.issuedItems.needle + 1 }, (_, i) => i).map(n => (
                        <button key={n}
                          onClick={() => setReturnedItems(p => ({ ...p, needle: n }))}
                          className="px-4 py-2 rounded-xl font-semibold"
                          style={{
                            fontSize: 14, minWidth: 60,
                            background: returnedItems.needle === n ? (n === selected.issuedItems.needle ? '#22c55e' : '#f59e0b') : c.cardBg2,
                            color: returnedItems.needle === n ? '#fff' : c.textSecondary,
                            border: returnedItems.needle === n ? 'none' : `1.5px solid ${c.border}`,
                          }}>
                          {n === 0 ? 'কোনোটা না' : `${n}টা`}
                        </button>
                      ))}
                    </div>
                    {returnedItems.needle < selected.issuedItems.needle && returnedItems.needle > 0 && (
                      <p style={{ color: '#f59e0b', fontSize: 13, marginTop: 6, fontWeight: 500 }}>
                        {selected.issuedItems.needle - returnedItems.needle}টা Needle এখনো বাকি
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            <button onClick={handleDeposit}
              className="w-full py-4 rounded-xl flex items-center justify-center gap-2 font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #0f766e, #0d9488)', fontSize: 17 }}>
              <CheckCircle size={20} /> Deposit Record সেভ করুন
            </button>
          </div>
        )}
      </div>
      <Toast trigger={toastKey} message="Deposit সেভ হয়েছে!" />
    </div>
  );
}

function Tag({ label, done, c }: { label: string; done: boolean; c: ReturnType<typeof useTheme>['c'] }) {
  return (
    <span style={{
      background: done ? c.badgeDone : c.badgePending,
      color: done ? c.badgeDoneText : c.badgePendingText,
      fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20,
      border: `1px solid ${done ? '#bbf7d044' : '#fed7aa44'}`,
    }}>
      {done ? '✓ ' : ''}{label}
    </span>
  );
}

function ReturnToggle({ label, checked, onToggle, c }: {
  label: string; checked: boolean; onToggle: () => void; c: ReturnType<typeof useTheme>['c'];
}) {
  return (
    <button onClick={onToggle}
      className="flex items-center gap-3 py-3 px-4 rounded-xl text-left"
      style={{
        background: checked ? c.successBg : c.cardBg2,
        border: `1.5px solid ${checked ? '#22c55e' : c.border}`,
      }}>
      <div style={{
        width: 24, height: 24, borderRadius: 7,
        background: checked ? '#22c55e' : c.border,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        {checked && <Check size={15} color="#fff" strokeWidth={3} />}
      </div>
      <span style={{ color: checked ? '#22c55e' : c.textSecondary, fontWeight: 600, fontSize: 15 }}>{label}</span>
    </button>
  );
}
