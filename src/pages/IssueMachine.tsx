import { useState } from 'react';
import { Wrench, User, CreditCard, Hash, Check, Save, ChevronDown, MapPin } from 'lucide-react';
import { MACHINE_TYPES, MACHINE_TYPE_KEYS, LINE_NUMBERS, AREAS, Area, MachineRecord, IssuedItems } from '../types';
import { addRecord, generateId } from '../store';
import { useTheme } from '../ThemeContext';
import Toast from '../components/Toast';

interface Props {
  onSaved: () => void;
}

function defaultItems(type: string): IssuedItems {
  const cfg = MACHINE_TYPES[type];
  return {
    bobbin: cfg.hasBobbin,
    case: cfg.hasCase,
    needle: cfg.defaultNeedle,
    knife: cfg.hasKnife,
  };
}

export default function IssueMachine({ onSaved }: Props) {
  const { c } = useTheme();
  const [lineNumber, setLineNumber] = useState<number>(1);
  const [machineType, setMachineType] = useState<string>(MACHINE_TYPE_KEYS[0]);
  const [machineNumber, setMachineNumber] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [area, setArea] = useState<Area>('Front Part Area');
  const [cardNumber, setCardNumber] = useState('');
  const [issuedItems, setIssuedItems] = useState<IssuedItems>(() => defaultItems(MACHINE_TYPE_KEYS[0]));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toastKey, setToastKey] = useState(0);

  const config = MACHINE_TYPES[machineType];

  function handleMachineTypeChange(type: string) {
    setMachineType(type);
    setIssuedItems(defaultItems(type));
    setErrors({});
  }

  function toggleItem(key: 'bobbin' | 'case' | 'knife') {
    setIssuedItems(prev => ({ ...prev, [key]: !prev[key] }));
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!machineNumber.trim()) e.machineNumber = 'মেশিন নম্বর দিন';
    if (!recipientName.trim()) e.recipientName = 'নাম দিন';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;
    const record: MachineRecord = {
      id: generateId(),
      lineNumber,
      machineType,
      machineNumber: machineNumber.trim(),
      recipient: { name: recipientName.trim(), area, cardNumber: cardNumber.trim() || undefined },
      issuedItems,
      returnedItems: { bobbin: false, case: false, needle: 0, knife: false },
      status: 'active',
      issuedAt: new Date().toISOString(),
    };
    await addRecord(record);
    setToastKey(k => k + 1);
    setTimeout(() => {
      setMachineNumber('');
      setRecipientName('');
      setCardNumber('');
      setIssuedItems(defaultItems(machineType));
      onSaved();
    }, 1800);
  }

  const inputStyle = {
    background: c.inputBg, border: `1.5px solid ${c.border}`,
    fontSize: 15, color: c.textPrimary,
  };

  return (
    <div className="min-h-screen" style={{ background: c.pageBg }}>
      <div className="flex items-center gap-3 px-4 py-5"
        style={{ background: 'linear-gradient(135deg, #d97706, #f59e0b)' }}>
        <Wrench size={28} color="#fff" strokeWidth={2} />
        <div>
          <h1 style={{ color: '#fff', fontSize: 20, fontWeight: 700 }}>Issue Machine</h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13 }}>Record machine with accessories</p>
        </div>
      </div>

      <div className="page-content px-4 py-4 flex flex-col gap-4">
        {/* Line Selection */}
        <div className="rounded-2xl p-4" style={{ background: c.cardBg }}>
          <h3 style={{ color: c.textPrimary, fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Select Line</h3>
          <div className="grid grid-cols-5 gap-2">
            {LINE_NUMBERS.map(n => (
              <button key={n} onClick={() => setLineNumber(n)}
                className="rounded-xl flex items-center justify-center font-bold"
                style={{
                  height: 48, fontSize: 16,
                  background: lineNumber === n ? '#f59e0b' : c.cardBg2,
                  color: lineNumber === n ? '#fff' : c.textSecondary,
                  border: lineNumber === n ? 'none' : `1.5px solid ${c.border}`,
                }}>
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* Machine Type + Number */}
        <div className="rounded-2xl p-4 flex flex-col gap-4" style={{ background: c.cardBg }}>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Wrench size={18} color="#f59e0b" />
              <label style={{ color: c.textPrimary, fontWeight: 700, fontSize: 15 }}>Machine Type</label>
            </div>
            <div className="relative">
              <select value={machineType} onChange={e => handleMachineTypeChange(e.target.value)}
                className="w-full px-4 py-3 rounded-xl appearance-none outline-none"
                style={{ ...inputStyle, border: `1.5px solid ${c.border}` }}>
                {MACHINE_TYPE_KEYS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <ChevronDown size={18} color={c.textMuted} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <Hash size={18} color="#f59e0b" />
              <label style={{ color: c.textPrimary, fontWeight: 700, fontSize: 15 }}>
                Machine Number <span style={{ color: '#ef4444' }}>*</span>
              </label>
            </div>
            <input type="text" value={machineNumber}
              onChange={e => { setMachineNumber(e.target.value); setErrors(er => ({ ...er, machineNumber: '' })); }}
              placeholder="Enter machine number"
              className="w-full px-4 py-3 rounded-xl outline-none"
              style={{ ...inputStyle, border: `1.5px solid ${errors.machineNumber ? '#ef4444' : c.border}` }} />
            {errors.machineNumber && <p style={{ color: '#ef4444', fontSize: 13, marginTop: 4 }}>{errors.machineNumber}</p>}
          </div>
        </div>

        {/* Recipient */}
        <div className="rounded-2xl p-4 flex flex-col gap-4" style={{ background: c.cardBg }}>
          <h3 style={{ color: c.textPrimary, fontSize: 16, fontWeight: 700 }}>Recipient (Line Chief/Supervisor)</h3>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <User size={18} color="#f59e0b" />
              <label style={{ color: c.textPrimary, fontWeight: 700, fontSize: 15 }}>
                Name <span style={{ color: '#ef4444' }}>*</span>
              </label>
            </div>
            <input type="text" value={recipientName}
              onChange={e => { setRecipientName(e.target.value); setErrors(er => ({ ...er, recipientName: '' })); }}
              placeholder="Enter recipient name"
              className="w-full px-4 py-3 rounded-xl outline-none"
              style={{ ...inputStyle, border: `1.5px solid ${errors.recipientName ? '#ef4444' : c.border}` }} />
            {errors.recipientName && <p style={{ color: '#ef4444', fontSize: 13, marginTop: 4 }}>{errors.recipientName}</p>}
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <MapPin size={18} color="#f59e0b" />
              <label style={{ color: c.textPrimary, fontWeight: 700, fontSize: 15 }}>Area</label>
            </div>
            <div className="relative">
              <select value={area} onChange={e => setArea(e.target.value as Area)}
                className="w-full px-4 py-3 rounded-xl appearance-none outline-none"
                style={inputStyle}>
                {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
              <ChevronDown size={18} color={c.textMuted} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <CreditCard size={18} color="#f59e0b" />
              <label style={{ color: c.textPrimary, fontWeight: 700, fontSize: 15 }}>
                Card Number <span style={{ color: c.textMuted, fontWeight: 400, fontSize: 13 }}>(Optional)</span>
              </label>
            </div>
            <input type="text" value={cardNumber} onChange={e => setCardNumber(e.target.value)}
              placeholder="Enter card number"
              className="w-full px-4 py-3 rounded-xl outline-none"
              style={inputStyle} />
          </div>
        </div>

        {/* Items Given */}
        <div className="rounded-2xl p-4" style={{ background: c.cardBg }}>
          <h3 style={{ color: c.textPrimary, fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Items Given with Machine</h3>

          {(config.hasBobbin || config.hasCase || config.hasKnife) && (
            <div className="grid grid-cols-2 gap-3 mb-4">
              {config.hasBobbin && (
                <ToggleItem label="Bobbin" active={issuedItems.bobbin} onToggle={() => toggleItem('bobbin')} c={c} />
              )}
              {config.hasCase && (
                <ToggleItem label="Case" active={issuedItems.case} onToggle={() => toggleItem('case')} c={c} />
              )}
              {config.hasKnife && (
                <ToggleItem label="Knife" active={issuedItems.knife} onToggle={() => toggleItem('knife')} c={c} />
              )}
            </div>
          )}

          {config.needleOptions.length > 0 && (
            <div>
              <label style={{ color: c.textPrimary, fontWeight: 700, fontSize: 15, display: 'block', marginBottom: 8 }}>
                Needles
              </label>
              <div className="flex gap-2 flex-wrap">
                <button onClick={() => setIssuedItems(prev => ({ ...prev, needle: 0 }))}
                  className="px-4 py-2 rounded-xl font-semibold"
                  style={{
                    fontSize: 14, minWidth: 80,
                    background: issuedItems.needle === 0 ? '#f59e0b' : c.cardBg2,
                    color: issuedItems.needle === 0 ? '#fff' : c.textSecondary,
                    border: issuedItems.needle === 0 ? 'none' : `1.5px solid ${c.border}`,
                  }}>
                  No Needle
                </button>
                {config.needleOptions.map(n => (
                  <button key={n} onClick={() => setIssuedItems(prev => ({ ...prev, needle: n }))}
                    className="px-4 py-2 rounded-xl font-semibold"
                    style={{
                      fontSize: 14, minWidth: 60,
                      background: issuedItems.needle === n ? '#f59e0b' : c.cardBg2,
                      color: issuedItems.needle === n ? '#fff' : c.textSecondary,
                      border: issuedItems.needle === n ? 'none' : `1.5px solid ${c.border}`,
                    }}>
                    {n} Needle{n > 1 ? 's' : ''}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <button onClick={handleSave}
          className="w-full py-4 rounded-xl flex items-center justify-center gap-2 font-bold text-white"
          style={{
            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
            fontSize: 17,
          }}>
          <Save size={20} /> Save Issue Record
        </button>
      </div>
      <Toast trigger={toastKey} message="Issue সেভ হয়েছে!" />
    </div>
  );
}

function ToggleItem({ label, active, onToggle, c }: {
  label: string; active: boolean; onToggle: () => void; c: ReturnType<typeof useTheme>['c'];
}) {
  return (
    <button onClick={onToggle}
      className="py-3 px-4 rounded-xl flex items-center gap-3 transition-all"
      style={{
        background: active ? '#fffbeb' : c.cardBg2,
        border: `1.5px solid ${active ? '#f59e0b' : c.border}`,
      }}>
      <div style={{
        width: 22, height: 22, borderRadius: 6,
        background: active ? '#f59e0b' : c.border,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {active && <Check size={14} color="#fff" strokeWidth={3} />}
      </div>
      <span style={{ color: active ? '#b45309' : c.textSecondary, fontWeight: 600, fontSize: 15 }}>{label}</span>
    </button>
  );
}
