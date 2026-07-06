import { useEffect, useState } from 'react';
import { Factory, Wrench } from 'lucide-react';

interface Props {
  onFinish: () => void;
}

export default function SplashScreen({ onFinish }: Props) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 100);
    const t2 = setTimeout(() => setPhase(2), 600);
    const t3 = setTimeout(() => setPhase(3), 1100);
    const t4 = setTimeout(() => setPhase(4), 1600);
    const t5 = setTimeout(() => onFinish(), 3200);
    return () => { [t1, t2, t3, t4, t5].forEach(clearTimeout); };
  }, [onFinish]);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-between"
      style={{ background: 'linear-gradient(180deg, #0a1628 0%, #0f1f3d 60%, #162040 100%)' }}>

      {/* Center content */}
      <div className="flex-1 flex flex-col items-center justify-center gap-6 px-8">
        {/* Icons */}
        <div
          className="flex items-center gap-4 mb-2"
          style={{
            opacity: phase >= 1 ? 1 : 0,
            transform: phase >= 1 ? 'translateY(0)' : 'translateY(30px)',
            transition: 'opacity 0.6s ease, transform 0.6s ease',
          }}>
          <Factory size={64} color="#f59e0b" strokeWidth={1.5} />
          <Wrench size={52} color="#f59e0b" strokeWidth={1.5} />
        </div>

        {/* Factory name */}
        <div style={{
          opacity: phase >= 2 ? 1 : 0,
          transform: phase >= 2 ? 'translateY(0)' : 'translateY(20px)',
          transition: 'opacity 0.5s ease, transform 0.5s ease',
          textAlign: 'center',
        }}>
          <h1 style={{ color: '#ffffff', fontSize: 26, fontWeight: 800, lineHeight: 1.2 }}>
            Bottoms Gallery Pvt. Ltd.
          </h1>
          <p style={{ color: '#f59e0b', fontSize: 18, fontWeight: 600, marginTop: 6 }}>
            Spider Group
          </p>
        </div>

        {/* Divider */}
        <div style={{
          width: 80,
          height: 3,
          background: '#f59e0b',
          borderRadius: 2,
          opacity: phase >= 3 ? 1 : 0,
          transform: phase >= 3 ? 'scaleX(1)' : 'scaleX(0)',
          transition: 'opacity 0.4s ease, transform 0.4s ease',
        }} />

        {/* App name */}
        <p style={{
          color: '#94a3b8',
          fontSize: 18,
          fontWeight: 400,
          letterSpacing: 0.5,
          opacity: phase >= 3 ? 1 : 0,
          transition: 'opacity 0.5s ease 0.1s',
        }}>
          Machine Issue Tracker
        </p>
      </div>

      {/* Developer card + dots */}
      <div className="w-full px-6 pb-12" style={{
        opacity: phase >= 4 ? 1 : 0,
        transform: phase >= 4 ? 'translateY(0)' : 'translateY(20px)',
        transition: 'opacity 0.5s ease, transform 0.5s ease',
      }}>
        <div style={{
          background: 'rgba(255,255,255,0.07)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 16,
          padding: '18px 20px',
          textAlign: 'center',
          marginBottom: 28,
        }}>
          <p style={{ color: '#94a3b8', fontSize: 14, marginBottom: 4 }}>Developed by</p>
          <p style={{ color: '#ffffff', fontSize: 20, fontWeight: 700 }}>Bayezid Miah</p>
          <p style={{ color: '#f59e0b', fontSize: 14, fontWeight: 500, marginTop: 4 }}>Mechanic Section</p>
        </div>

        {/* Loading dots */}
        <div className="flex justify-center gap-3">
          {[0, 1, 2].map(i => (
            <div key={i} className={`dot-pulse ${i === 1 ? 'dot-pulse-delay-1' : i === 2 ? 'dot-pulse-delay-2' : ''}`}
              style={{ width: 10, height: 10, borderRadius: '50%', background: '#f59e0b' }} />
          ))}
        </div>
      </div>
    </div>
  );
}
