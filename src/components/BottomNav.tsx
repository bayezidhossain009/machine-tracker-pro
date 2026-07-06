import { Home, Wrench, Download, FileText, User } from 'lucide-react';
import { ReactNode } from 'react';
import { useTheme } from '../ThemeContext';

export type Tab = 'home' | 'issue' | 'deposit' | 'records' | 'profile';

interface Props {
  active: Tab;
  onChange: (tab: Tab) => void;
}

const tabs: { id: Tab; label: string; icon: ReactNode }[] = [
  { id: 'home', label: 'Home', icon: <Home size={22} strokeWidth={1.8} /> },
  { id: 'issue', label: 'Issue', icon: <Wrench size={22} strokeWidth={1.8} /> },
  { id: 'deposit', label: 'Deposit', icon: <Download size={22} strokeWidth={1.8} /> },
  { id: 'records', label: 'Records', icon: <FileText size={22} strokeWidth={1.8} /> },
  { id: 'profile', label: 'Profile', icon: <User size={22} strokeWidth={1.8} /> },
];

export default function BottomNav({ active, onChange }: Props) {
  const { c } = useTheme();
  return (
    <div className="fixed bottom-0 left-0 right-0 safe-bottom"
      style={{
        background: c.navBg,
        borderTop: `1px solid ${c.border}`,
        display: 'flex', zIndex: 100,
        boxShadow: '0 -2px 12px rgba(0,0,0,0.08)',
      }}>
      {tabs.map(tab => {
        const isActive = tab.id === active;
        return (
          <button key={tab.id} onClick={() => onChange(tab.id)}
            className="flex-1 flex flex-col items-center justify-center py-2 gap-1"
            style={{
              color: isActive ? '#f59e0b' : c.textMuted,
              border: 'none', background: 'transparent',
              minHeight: 60, cursor: 'pointer', transition: 'color 0.2s',
            }}>
            {tab.icon}
            <span style={{ fontSize: 11, fontWeight: isActive ? 700 : 500 }}>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
