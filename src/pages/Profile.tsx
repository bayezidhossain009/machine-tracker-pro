import { useState, useRef, ReactNode } from 'react';
import { User, Upload, Download, Trash2, Info, Github, Instagram, Facebook, MessageCircle, Edit3, Check, X, CreditCard, Layers, Briefcase, Moon, Sun, Code } from 'lucide-react';
import { UserProfile } from '../types';
import { downloadBackup, restoreFromFile, clearAllData, saveProfile } from '../store';
import { useTheme } from '../ThemeContext';

interface Props {
  profile: UserProfile;
  onProfileUpdated: (p: UserProfile) => void;
  onDataChanged: () => void;
}

export default function Profile({ profile, onProfileUpdated, onDataChanged }: Props) {
  const { c, darkMode, toggleDarkMode } = useTheme();
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    name: profile.name, cardNumber: profile.cardNumber,
    floor: profile.floor, designation: profile.designation,
  });
  const [showClear, setShowClear] = useState(false);
  const [toast, setToast] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  }

  async function handleSaveProfile() {
    const updated: UserProfile = { ...profile, ...form };
    await saveProfile(updated);
    onProfileUpdated(updated);
    setEditMode(false);
    showToast('প্রোফাইল আপডেট হয়েছে');
  }

  async function handleExport() {
    await downloadBackup();
    showToast('ডেটা এক্সপোর্ট হচ্ছে...');
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const result = await restoreFromFile(file);
    onDataChanged();
    showToast(result.message);
    if (fileRef.current) fileRef.current.value = '';
  }

  async function handleClearAll() {
    await clearAllData();
    setShowClear(false);
    onDataChanged();
    showToast('সব রেকর্ড মুছে ফেলা হয়েছে');
  }

  const cardStyle = { background: c.cardBg };
  const dividerStyle = { borderBottom: `1px solid ${c.border}` };

  return (
    <div className="min-h-screen" style={{ background: c.pageBg }}>
      {/* Header */}
      <div className="px-4 py-5" style={{ background: c.headerBg }}>
        <div className="flex items-center gap-3 mb-4">
          <User size={28} color="#fff" strokeWidth={2} />
          <div>
            <h1 style={{ color: '#fff', fontSize: 20, fontWeight: 700 }}>Profile</h1>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>Settings & Information</p>
          </div>
        </div>

        <div style={{
          background: 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: 16, padding: 16,
          display: 'flex', alignItems: 'center', gap: 14,
        }}>
          <div style={{
            width: 52, height: 52, borderRadius: '50%', background: '#f59e0b',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: 22, color: '#fff', flexShrink: 0,
          }}>
            {profile.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <p style={{ color: '#fff', fontWeight: 700, fontSize: 17 }}>{profile.name}</p>
            <p style={{ color: '#94a3b8', fontSize: 13 }}>{profile.designation} • {profile.floor}</p>
            {profile.cardNumber && (
              <p style={{ color: '#f59e0b', fontSize: 13, fontWeight: 600, marginTop: 2 }}>{profile.cardNumber}</p>
            )}
          </div>
          <button onClick={() => setEditMode(true)}
            style={{ color: '#f59e0b', background: 'rgba(245,158,11,0.15)', padding: 8, borderRadius: 10 }}>
            <Edit3 size={18} />
          </button>
        </div>
      </div>

      <div className="page-content px-4 py-4 flex flex-col gap-4">
        {/* Edit profile */}
        {editMode && (
          <div className="rounded-2xl p-4 flex flex-col gap-3" style={cardStyle}>
            <div className="flex items-center justify-between mb-1">
              <h3 style={{ color: c.textPrimary, fontWeight: 700, fontSize: 16 }}>প্রোফাইল এডিট করুন</h3>
              <button onClick={() => setEditMode(false)}><X size={20} color={c.textMuted} /></button>
            </div>
            {[
              { icon: <User size={16} />, label: 'নাম', key: 'name', placeholder: 'আপনার নাম' },
              { icon: <CreditCard size={16} />, label: 'কার্ড নম্বর', key: 'cardNumber', placeholder: 'B-2500 (Optional)' },
              { icon: <Layers size={16} />, label: 'ফ্লোর', key: 'floor', placeholder: '3rd Floor' },
              { icon: <Briefcase size={16} />, label: 'পদবী', key: 'designation', placeholder: 'Mechanic' },
            ].map(f => (
              <div key={f.key}>
                <div className="flex items-center gap-2 mb-1.5">
                  <span style={{ color: '#f59e0b' }}>{f.icon}</span>
                  <label style={{ color: c.textPrimary, fontSize: 14, fontWeight: 600 }}>{f.label}</label>
                </div>
                <input
                  value={form[f.key as keyof typeof form]}
                  onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                  placeholder={f.placeholder}
                  className="w-full px-3 py-2.5 rounded-xl outline-none"
                  style={{ background: c.inputBg, border: `1.5px solid ${c.border}`, fontSize: 14, color: c.textPrimary }}
                />
              </div>
            ))}
            <div className="flex gap-3 mt-1">
              <button onClick={() => setEditMode(false)}
                className="flex-1 py-3 rounded-xl font-semibold"
                style={{ background: c.cardBg2, color: c.textSecondary, fontSize: 15 }}>
                বাতিল
              </button>
              <button onClick={handleSaveProfile}
                className="flex-1 py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', fontSize: 15 }}>
                <Check size={18} /> সেভ করুন
              </button>
            </div>
          </div>
        )}

        {/* Dark Mode toggle */}
        <div className="rounded-2xl overflow-hidden" style={cardStyle}>
          <button onClick={toggleDarkMode}
            className="w-full flex items-center gap-4 px-4 py-4">
            <div style={{
              background: darkMode ? '#1a2030' : '#f0f4ff',
              borderRadius: 12, padding: 10,
            }}>
              {darkMode
                ? <Sun size={22} color="#f59e0b" />
                : <Moon size={22} color="#6366f1" />
              }
            </div>
            <div className="flex-1 text-left">
              <p style={{ color: c.textPrimary, fontWeight: 600, fontSize: 15 }}>
                {darkMode ? 'Light Mode' : 'Dark Mode'}
              </p>
              <p style={{ color: c.textSecondary, fontSize: 13 }}>
                {darkMode ? 'সাদা থিমে যান' : 'কালো থিমে যান'}
              </p>
            </div>
            {/* Toggle switch */}
            <div style={{
              width: 48, height: 26, borderRadius: 13,
              background: darkMode ? '#f59e0b' : c.border,
              position: 'relative', transition: 'background 0.2s',
              flexShrink: 0,
            }}>
              <div style={{
                width: 20, height: 20, borderRadius: '50%', background: '#fff',
                position: 'absolute', top: 3,
                left: darkMode ? 25 : 3,
                transition: 'left 0.2s',
                boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
              }} />
            </div>
          </button>
        </div>

        {/* Data Management */}
        <div className="rounded-2xl overflow-hidden" style={cardStyle}>
          <div className="px-4 py-3" style={dividerStyle}>
            <h3 style={{ color: c.textPrimary, fontWeight: 700, fontSize: 15 }}>Data Management</h3>
          </div>

          <button onClick={handleExport} className="w-full flex items-center gap-4 px-4 py-4" style={dividerStyle}>
            <div style={{ background: '#eff6ff', borderRadius: 12, padding: 10 }}>
              <Upload size={22} color="#3b82f6" />
            </div>
            <div className="flex-1 text-left">
              <p style={{ color: c.textPrimary, fontWeight: 600, fontSize: 15 }}>Export Data</p>
              <p style={{ color: c.textSecondary, fontSize: 13 }}>Save backup to file</p>
            </div>
          </button>

          <button onClick={() => fileRef.current?.click()}
            className="w-full flex items-center gap-4 px-4 py-4" style={dividerStyle}>
            <div style={{ background: '#f0fdf4', borderRadius: 12, padding: 10 }}>
              <Download size={22} color="#22c55e" />
            </div>
            <div className="flex-1 text-left">
              <p style={{ color: c.textPrimary, fontWeight: 600, fontSize: 15 }}>Import Data</p>
              <p style={{ color: c.textSecondary, fontSize: 13 }}>Restore from backup file</p>
            </div>
          </button>
          <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleImport} />

          <button onClick={() => setShowClear(true)} className="w-full flex items-center gap-4 px-4 py-4">
            <div style={{ background: '#fff1f2', borderRadius: 12, padding: 10 }}>
              <Trash2 size={22} color="#ef4444" />
            </div>
            <div className="flex-1 text-left">
              <p style={{ color: '#ef4444', fontWeight: 600, fontSize: 15 }}>Clear All Data</p>
              <p style={{ color: c.textSecondary, fontSize: 13 }}>Delete all records permanently</p>
            </div>
          </button>
        </div>

        {showClear && (
          <div className="rounded-2xl p-4 flex flex-col gap-3"
            style={{ background: '#fff1f2', border: '1.5px solid #fecdd3' }}>
            <p style={{ color: '#991b1b', fontWeight: 700, fontSize: 15 }}>সব ডেটা মুছে ফেলবেন?</p>
            <p style={{ color: '#b91c1c', fontSize: 13 }}>এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না।</p>
            <div className="flex gap-3">
              <button onClick={() => setShowClear(false)}
                className="flex-1 py-3 rounded-xl font-semibold"
                style={{ background: c.cardBg2, color: c.textSecondary, border: `1px solid ${c.border}`, fontSize: 14 }}>
                বাতিল
              </button>
              <button onClick={handleClearAll}
                className="flex-1 py-3 rounded-xl font-semibold text-white"
                style={{ background: '#ef4444', fontSize: 14 }}>
                হ্যাঁ, মুছুন
              </button>
            </div>
          </div>
        )}

        {/* App Information */}
        <div className="rounded-2xl p-4" style={cardStyle}>
          <div className="flex items-center gap-2 mb-4">
            <Info size={18} color={c.textMuted} />
            <h3 style={{ color: c.textPrimary, fontWeight: 700, fontSize: 15 }}>App Information</h3>
          </div>
          {[
            ['App Name', 'Machine Issue Tracker'],
            ['Version', '1.0.0'],
            ['Company', 'Bottoms Gallery Pvt. Ltd.'],
            ['Group', 'Spider Group'],
          ].map(([key, val]) => (
            <div key={key} className="flex justify-between py-2" style={dividerStyle}>
              <span style={{ color: c.textSecondary, fontSize: 14 }}>{key}</span>
              <span style={{ color: c.textPrimary, fontWeight: 600, fontSize: 14 }}>{val}</span>
            </div>
          ))}
        </div>

        {/* Developer Contact */}
        <div className="rounded-2xl p-4" style={cardStyle}>
          <h3 style={{ color: c.textPrimary, fontWeight: 700, fontSize: 15, marginBottom: 14 }}>Developer Contact</h3>
          <div className="flex items-center gap-4 mb-5">
            <div style={{
              width: 56, height: 56, borderRadius: '50%', background: '#f59e0b',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Code size={28} color="#fff" strokeWidth={2.5} />
            </div>
            <div>
              <p style={{ color: c.textPrimary, fontWeight: 700, fontSize: 17 }}>Bayezid Miah</p>
              <p style={{ color: '#f59e0b', fontSize: 13, fontWeight: 500 }}>Software Developer</p>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-3">
            <SocialBtn icon={<Facebook size={22} color="#1877f2" />} label="Facebook"
              color="#eff6ff" href="https://www.facebook.com/bayezid.hossain.007" />
            <SocialBtn icon={<Instagram size={22} color="#e1306c" />} label="Instagram"
              color="#fff1f2" href="https://www.instagram.com/bayezid.hossain.007" />
            <SocialBtn icon={<Github size={22} color={c.textPrimary} />} label="GitHub"
              color={c.cardBg2} href="https://github.com/bayezid-404" />
            <SocialBtn icon={<MessageCircle size={22} color="#25d366" />} label="WhatsApp"
              color="#f0fdf4" href="https://wa.me/8801613164879" />
          </div>
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-20 left-4 right-4 z-50 py-3 px-4 rounded-xl text-center"
          style={{ background: '#1e293b', color: '#fff', fontSize: 14, fontWeight: 500, boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
          {toast}
        </div>
      )}
    </div>
  );
}

function SocialBtn({ icon, label, color, href }: { icon: ReactNode; label: string; color: string; href: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer"
      className="flex flex-col items-center gap-2 py-3 rounded-xl"
      style={{ background: color, textDecoration: 'none' }}>
      {icon}
      <span style={{ color: '#1e293b', fontSize: 11, fontWeight: 600 }}>{label}</span>
    </a>
  );
}
