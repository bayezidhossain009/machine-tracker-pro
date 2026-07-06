import { ReactNode, useState, useRef } from 'react';
import { User, CreditCard, Layers, Briefcase, Factory, Wrench, ChevronRight, Camera } from 'lucide-react';
import { saveProfile, resizeImage } from '../store';
import { UserProfile } from '../types';

interface FieldProps {
  icon: ReactNode;
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  required?: boolean;
}

function Field({ icon, label, placeholder, value, onChange, error, required }: FieldProps) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <span style={{ color: '#f59e0b' }}>{icon}</span>
        <label style={{ color: '#1e293b', fontWeight: 600, fontSize: 15 }}>
          {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
        </label>
      </div>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 rounded-xl outline-none"
        style={{
          background: '#f8fafc',
          border: `1.5px solid ${error ? '#ef4444' : '#e2e8f0'}`,
          fontSize: 16, color: '#1e293b',
        }}
      />
      {error && <p style={{ color: '#ef4444', fontSize: 13, marginTop: 4 }}>{error}</p>}
    </div>
  );
}

interface Props {
  onComplete: () => void;
}

export default function Onboarding({ onComplete }: Props) {
  const [form, setForm] = useState({ name: '', cardNumber: '', floor: '', designation: '' });
  const [photo, setPhoto] = useState<string | undefined>(undefined);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const photoRef = useRef<HTMLInputElement>(null);

  function set(key: keyof typeof form) {
    return (v: string) => {
      setForm(f => ({ ...f, [key]: v }));
      setErrors(er => ({ ...er, [key]: '' }));
    };
  }

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const resized = await resizeImage(file);
    setPhoto(resized);
    if (photoRef.current) photoRef.current.value = '';
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'নাম দিন';
    if (!form.floor.trim()) e.floor = 'ফ্লোর লিখুন';
    if (!form.designation.trim()) e.designation = 'পদবী লিখুন';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    const profile: UserProfile = {
      name: form.name.trim(),
      cardNumber: form.cardNumber.trim(),
      floor: form.floor.trim(),
      designation: form.designation.trim(),
      photo,
      createdAt: new Date().toISOString(),
    };
    await saveProfile(profile);
    onComplete();
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #0a1628 0%, #0f1f3d 35%, #f0f2f5 35%)' }}>
      <div className="flex flex-col items-center pt-10 pb-6 px-6">
        <div className="flex items-center gap-3 mb-4">
          <Factory size={36} color="#f59e0b" strokeWidth={1.5} />
          <Wrench size={28} color="#f59e0b" strokeWidth={1.5} />
        </div>
        <h1 style={{ color: '#ffffff', fontSize: 20, fontWeight: 700, textAlign: 'center' }}>
          Bottoms Gallery Pvt. Ltd.
        </h1>
        <p style={{ color: '#f59e0b', fontSize: 14, fontWeight: 500, marginTop: 2 }}>Spider Group</p>
      </div>

      <div className="mx-4 rounded-2xl p-6 shadow-lg" style={{ background: '#ffffff' }}>
        <h2 style={{ color: '#1e293b', fontSize: 20, fontWeight: 700, marginBottom: 4 }}>প্রোফাইল তৈরি করুন</h2>
        <p style={{ color: '#64748b', fontSize: 14, marginBottom: 20 }}>আপনার তথ্য দিয়ে অ্যাকাউন্ট তৈরি করুন</p>

        {/* Photo upload */}
        <div className="flex flex-col items-center mb-6">
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <div style={{
              width: 80, height: 80, borderRadius: '50%',
              background: photo ? 'transparent' : '#f59e0b',
              border: '3px solid #f59e0b',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden',
            }}>
              {photo
                ? <img src={photo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <span style={{ color: '#fff', fontSize: 28, fontWeight: 700 }}>
                    {form.name ? form.name.charAt(0).toUpperCase() : <User size={32} color="#fff" />}
                  </span>
              }
            </div>
            <button
              onClick={() => photoRef.current?.click()}
              style={{
                position: 'absolute', bottom: 0, right: 0,
                background: '#f59e0b', borderRadius: '50%',
                width: 26, height: 26,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '2px solid #fff',
              }}>
              <Camera size={13} color="#fff" />
            </button>
          </div>
          <p style={{ color: '#94a3b8', fontSize: 12, marginTop: 8 }}>ছবি দিন (Optional)</p>
          <input ref={photoRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
        </div>

        <div className="flex flex-col gap-5">
          <Field icon={<User size={18} />} label="নাম" placeholder="আপনার নাম লিখুন"
            value={form.name} onChange={set('name')} error={errors.name} required />
          <Field icon={<CreditCard size={18} />} label="কার্ড নাম্বার" placeholder="যেমন: B-2500 (অপশনাল)"
            value={form.cardNumber} onChange={set('cardNumber')} />
          <Field icon={<Layers size={18} />} label="ফ্লোর" placeholder="যেমন: 3rd Floor"
            value={form.floor} onChange={set('floor')} error={errors.floor} required />
          <Field icon={<Briefcase size={18} />} label="পদবী" placeholder="যেমন: Mechanic"
            value={form.designation} onChange={set('designation')} error={errors.designation} required />
        </div>

        <button
          onClick={handleSubmit}
          className="w-full mt-8 py-4 rounded-xl flex items-center justify-center gap-2 font-bold text-white"
          style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', fontSize: 17 }}>
          শুরু করুন <ChevronRight size={20} />
        </button>
      </div>

      <p style={{ textAlign: 'center', color: '#64748b', fontSize: 13, padding: '16px 0 8px' }}>
        Machine Issue Tracker v1.0.0
      </p>
    </div>
  );
}
