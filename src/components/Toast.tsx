import { useEffect, useState } from 'react';
import { CheckCircle } from 'lucide-react';

interface Props {
  trigger: number; // increment each time you want to show toast
  message?: string;
}

export default function Toast({ trigger, message = 'Saved Successfully!' }: Props) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (trigger === 0) return;
    setShow(true);
    const t = setTimeout(() => setShow(false), 1800);
    return () => clearTimeout(t);
  }, [trigger]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <div style={{
        background: 'rgba(30,41,59,0.95)',
        borderRadius: 20,
        padding: '24px 36px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 12,
        boxShadow: '0 8px 40px rgba(0,0,0,0.35)',
        animation: 'toastIn 0.25s cubic-bezier(0.34,1.56,0.64,1)',
      }}>
        <div style={{
          width: 56, height: 56, borderRadius: '50%',
          background: 'linear-gradient(135deg, #22c55e, #16a34a)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <CheckCircle size={30} color="#fff" strokeWidth={2.5} />
        </div>
        <p style={{ color: '#fff', fontSize: 16, fontWeight: 700, textAlign: 'center' }}>{message}</p>
      </div>
    </div>
  );
}
