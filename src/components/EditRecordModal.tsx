import { useState } from 'react';
import { X, Save, Check, ChevronDown, Trash2 } from 'lucide-react';
import { MachineRecord, MACHINE_TYPES, MACHINE_TYPE_KEYS, LINE_NUMBERS, AREAS, Area } from '../types';
import { updateRecord, deleteRecord } from '../store';
import { useTheme } from '../ThemeContext';

interface Props {
  record: MachineRecord;
  onClose: () => void;
  onSaved: () => void;
}

export default function EditRecordModal({ record, onClose, onSaved }: Props) {
  const { c } = useTheme();
  const [form, setForm] = useState({
    lineNumber: record.lineNumber,
    machineType: record.machineType,
    machineNumber: record.machineNumber,
    recipientName: record.recipient.name,
    area: record.recipient.area as Area,
    cardNumber: record.recipient.cardNumber || '',
    issuedBobbin: record.issuedItems.bobbin,
    issuedCase: record.issuedItems.case,
    issuedNeedle: record.issuedItems.needle,
    issuedKnife: record.issuedItems.knife,
    returnedBobbin: record.returnedItems.bobbin,
    returnedCase: record.returnedItems.case,
    returnedNeedle: record.returnedItems.needle,
    returnedKnife: record.returnedItems.knife,
  });
  const [showDelete, setShowDelete] = useState(false);
  const [saved, setSaved] = useState(false);

  const config = MACHINE_TYPES[form.machineType] || MACHINE_TYPES[MACHINE_TYPE_KEYS[0]];

  // When issued needle changes, clamp returned needle
  function setIssuedNeedle(n: number) {
    setForm(f => ({ ...f, issuedNeedle: n, returnedNeedle: Math.min(f.returnedNeedle, n) }));
  }

  async function handleSave() {
    const allReturned =
      (!form.issuedBobbin || form.returnedBobbin) &&
      (!form.issuedCase || form.returnedCase) &&
      (form.issuedNeedle === 0 || form.returnedNeedle >= form.issuedNeedle) &&
      (!form.issuedKnife || form.returnedKnife);

    const updated: MachineRecord = {
      ...record,
      lineNumber: form.lineNumber,
      machineType: form.machineType,
      machineNumber: form.machineNumber,
      recipient: { name: form.recipientName, area: form.area, cardNumber: form.cardNumber || undefined },
      issuedItems: { bobbin: form.issuedBobbin, case: form.issuedCase, needle: form.issuedNeedle, knife: form.issuedKnife },
      returnedItems: { bobbin: form.returnedBobbin, case: form.returnedCase, needle: form.returnedNeedle, knife: form.returnedKnife },
      status: allReturned ? 'closed' : 'active',
      returnedAt: allReturned && !record.returnedAt ? new Date().toISOString() : record.returnedAt,
    };
    await updateRecord(updated);
    setSaved(true);
    setTimeout(() => { onSaved(); onClose(); }, 900);
  }

  async function handleDelete() {
    await deleteRecord(record.id);
    onSaved();
    onClose();
  }

  const inputStyle = { background: c.inputBg, border: `1.5px solid ${c.border}`, fontSize: 14, color: c.textPrimary };
  const cardStyle = { background: c.cardBg };

  return (
    <div className="fixed inset-0 z-50 flex items-end" style={{ background: 'rgba(0,0,0,0.6)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full rounded-t-3xl overflow-y-auto"
        style={{ background: c.pageBg, maxHeight: '92vh', paddingBottom: 'env(safe-area-inset-bottom,0)' }}>
        <div className="flex justify-center pt-3 pb-1">
          <div style={{ width: 36, height: 4, background: c.border, borderRadius: 2 }} />
        </div>

        <div className="flex items-center justify-between px-4 py-3">
          <h2 style={{ color: c.textPrimary, fontSize: 18, fontWeight: 700 }}>Edit Record</h2>
          <button onClick={onClose}><X size={22} color={c.textMuted} /></button>
        </div>

        <div className="px-4 pb-6 flex flex-col gap-4">
          {/* Line + Machine */}
          <div className="rounded-xl p-4 flex flex-col gap-3" style={cardStyle}>
            <div>
              <label style={{ color: c.textPrimary, fontWeight: 700, fontSize: 14, display: 'block', marginBottom: 6 }}>Line Number</label>
              <div className="grid grid-cols-5 gap-2">
                {LINE_NUMBERS.map(n => (
                  <button key={n} onClick={() => setForm(f => ({ ...f, lineNumber: n }))}
                    className="rounded-lg flex items-center justify-center font-bold"
                    style={{
                      height: 40, fontSize: 14,
                      background: form.lineNumber === n ? '#f59e0b' : c.cardBg2,
                      color: form.lineNumber === n ? '#fff' : c.textSecondary,
                      border: form.lineNumber === n ? 'none' : `1px solid ${c.border}`,
                    }}>
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={{ color: c.textPrimary, fontWeight: 700, fontSize: 14, display: 'block', marginBottom: 6 }}>Machine Type</label>
              <div className="relative">
                <select value={form.machineType}
                  onChange={e => setForm(f => ({ ...f, machineType: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl appearance-none outline-none"
                  style={inputStyle}>
                  {MACHINE_TYPE_KEYS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <ChevronDown size={16} color={c.textMuted} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div>
              <label style={{ color: c.textPrimary, fontWeight: 700, fontSize: 14, display: 'block', marginBottom: 6 }}>Machine Number</label>
              <input value={form.machineNumber} onChange={e => setForm(f => ({ ...f, machineNumber: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl outline-none" style={inputStyle} />
            </div>
          </div>

          {/* Recipient */}
          <div className="rounded-xl p-4 flex flex-col gap-3" style={cardStyle}>
            <h3 style={{ color: c.textPrimary, fontWeight: 700, fontSize: 15 }}>Recipient</h3>
            {[
              { label: 'Name', key: 'recipientName' },
              { label: 'Card Number (Optional)', key: 'cardNumber' },
            ].map(f => (
              <div key={f.key}>
                <label style={{ color: c.textSecondary, fontSize: 13, display: 'block', marginBottom: 4 }}>{f.label}</label>
                <input value={form[f.key as keyof typeof form] as string}
                  onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl outline-none" style={inputStyle} />
              </div>
            ))}
            <div>
              <label style={{ color: c.textSecondary, fontSize: 13, display: 'block', marginBottom: 4 }}>Area</label>
              <div className="relative">
                <select value={form.area} onChange={e => setForm(f => ({ ...f, area: e.target.value as Area }))}
                  className="w-full px-3 py-2 rounded-xl appearance-none outline-none" style={inputStyle}>
                  {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
                <ChevronDown size={16} color={c.textMuted} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Issued Items */}
          <div className="rounded-xl p-4" style={cardStyle}>
            <h3 style={{ color: c.textPrimary, fontWeight: 700, fontSize: 15, marginBottom: 10 }}>Issued Items</h3>
            <div className="flex flex-col gap-3">
              {config.hasBobbin && (
                <EditToggle label="Bobbin" checked={form.issuedBobbin}
                  onToggle={() => setForm(f => ({ ...f, issuedBobbin: !f.issuedBobbin }))} color="#f59e0b" c={c} />
              )}
              {config.hasCase && (
                <EditToggle label="Case" checked={form.issuedCase}
                  onToggle={() => setForm(f => ({ ...f, issuedCase: !f.issuedCase }))} color="#f59e0b" c={c} />
              )}
              {config.hasKnife && (
                <EditToggle label="Knife" checked={form.issuedKnife}
                  onToggle={() => setForm(f => ({ ...f, issuedKnife: !f.issuedKnife }))} color="#f59e0b" c={c} />
              )}
              {config.needleOptions.length > 0 && (
                <div>
                  <p style={{ color: c.textSecondary, fontSize: 13, marginBottom: 6 }}>Issued Needles</p>
                  <div className="flex gap-2 flex-wrap">
                    <button onClick={() => setIssuedNeedle(0)}
                      className="px-3 py-1.5 rounded-lg font-semibold"
                      style={{ fontSize: 13, background: form.issuedNeedle === 0 ? '#f59e0b' : c.cardBg2, color: form.issuedNeedle === 0 ? '#fff' : c.textSecondary }}>
                      None
                    </button>
                    {config.needleOptions.map(n => (
                      <button key={n} onClick={() => setIssuedNeedle(n)}
                        className="px-3 py-1.5 rounded-lg font-semibold"
                        style={{ fontSize: 13, background: form.issuedNeedle === n ? '#f59e0b' : c.cardBg2, color: form.issuedNeedle === n ? '#fff' : c.textSecondary }}>
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Returned Items */}
          <div className="rounded-xl p-4" style={cardStyle}>
            <h3 style={{ color: c.textPrimary, fontWeight: 700, fontSize: 15, marginBottom: 10 }}>Returned Items</h3>
            <div className="flex flex-col gap-3">
              {form.issuedBobbin && (
                <EditToggle label="Bobbin" checked={form.returnedBobbin}
                  onToggle={() => setForm(f => ({ ...f, returnedBobbin: !f.returnedBobbin }))} color="#22c55e" c={c} />
              )}
              {form.issuedCase && (
                <EditToggle label="Case" checked={form.returnedCase}
                  onToggle={() => setForm(f => ({ ...f, returnedCase: !f.returnedCase }))} color="#22c55e" c={c} />
              )}
              {form.issuedKnife && (
                <EditToggle label="Knife" checked={form.returnedKnife}
                  onToggle={() => setForm(f => ({ ...f, returnedKnife: !f.returnedKnife }))} color="#22c55e" c={c} />
              )}
              {form.issuedNeedle > 0 && (
                <div>
                  <p style={{ color: c.textSecondary, fontSize: 13, marginBottom: 6 }}>
                    Returned Needles (issued: {form.issuedNeedle})
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {Array.from({ length: form.issuedNeedle + 1 }, (_, i) => i).map(n => (
                      <button key={n}
                        onClick={() => setForm(f => ({ ...f, returnedNeedle: n }))}
                        className="px-3 py-1.5 rounded-lg font-semibold"
                        style={{
                          fontSize: 13,
                          background: form.returnedNeedle === n
                            ? (n === form.issuedNeedle ? '#22c55e' : '#f59e0b')
                            : c.cardBg2,
                          color: form.returnedNeedle === n ? '#fff' : c.textSecondary,
                        }}>
                        {n === 0 ? 'None' : n}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <button onClick={handleSave}
            className="w-full py-4 rounded-xl flex items-center justify-center gap-2 font-bold text-white"
            style={{ background: saved ? 'linear-gradient(135deg, #22c55e, #16a34a)' : 'linear-gradient(135deg, #f59e0b, #d97706)', fontSize: 16 }}>
            {saved ? <><Check size={20} /> সেভ হয়েছে!</> : <><Save size={18} /> পরিবর্তন সেভ করুন</>}
          </button>

          <button onClick={() => setShowDelete(true)}
            className="w-full py-3 rounded-xl flex items-center justify-center gap-2 font-bold"
            style={{ background: c.dangerBg, border: '1.5px solid #fecdd3', color: '#ef4444', fontSize: 15 }}>
            <Trash2 size={18} /> রেকর্ড মুছে ফেলুন
          </button>

          {showDelete && (
            <div className="rounded-xl p-4 flex flex-col gap-3"
              style={{ background: '#fff1f2', border: '1.5px solid #fecdd3' }}>
              <p style={{ color: '#991b1b', fontWeight: 700, fontSize: 15 }}>নিশ্চিত করুন?</p>
              <p style={{ color: '#b91c1c', fontSize: 13 }}>এই রেকর্ড স্থায়ীভাবে মুছে যাবে।</p>
              <div className="flex gap-3">
                <button onClick={() => setShowDelete(false)}
                  className="flex-1 py-2 rounded-lg font-semibold"
                  style={{ background: c.cardBg2, color: c.textSecondary, border: `1px solid ${c.border}`, fontSize: 14 }}>
                  বাতিল
                </button>
                <button onClick={handleDelete}
                  className="flex-1 py-2 rounded-lg font-semibold text-white"
                  style={{ background: '#ef4444', fontSize: 14 }}>
                  মুছুন
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function EditToggle({ label, checked, onToggle, color, c }: {
  label: string; checked: boolean; onToggle: () => void; color: string;
  c: ReturnType<typeof useTheme>['c'];
}) {
  return (
    <button onClick={onToggle}
      className="flex items-center gap-3 py-2.5 px-3 rounded-xl text-left"
      style={{ background: checked ? `${color}18` : c.cardBg2, border: `1.5px solid ${checked ? color : c.border}` }}>
      <div style={{
        width: 22, height: 22, borderRadius: 6,
        background: checked ? color : c.border,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        {checked && <Check size={13} color="#fff" strokeWidth={3} />}
      </div>
      <span style={{ color: checked ? c.textPrimary : c.textSecondary, fontWeight: 600, fontSize: 14 }}>{label}</span>
    </button>
  );
}
