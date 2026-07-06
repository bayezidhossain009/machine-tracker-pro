import { useState, useCallback } from 'react';
import SplashScreen from './pages/SplashScreen';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import IssueMachine from './pages/IssueMachine';
import Deposit from './pages/Deposit';
import Records from './pages/Records';
import Profile from './pages/Profile';
import BottomNav, { Tab } from './components/BottomNav';
import { getProfile } from './store';
import { UserProfile } from './types';
import { useTheme } from './ThemeContext';

type AppState = 'splash' | 'onboarding' | 'main';

function AppInner() {
  const { c } = useTheme();
  const [appState, setAppState] = useState<AppState>('splash');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [recordsFilter, setRecordsFilter] = useState<string>('all');
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => setRefreshKey(k => k + 1), []);

  async function handleSplashFinish() {
    const p = await getProfile();
    if (p) { setProfile(p); setAppState('main'); }
    else setAppState('onboarding');
  }

  async function handleOnboardingComplete() {
    setProfile(await getProfile());
    setAppState('main');
  }

  async function handleDataChanged() {
    setProfile(await getProfile());
    refresh();
  }

  function handleNavigate(tab: string, filter?: string) {
    setActiveTab(tab as Tab);
    if (tab === 'records') setRecordsFilter(filter || 'all');
  }

  if (appState === 'splash') return <SplashScreen onFinish={handleSplashFinish} />;
  if (appState === 'onboarding') return <Onboarding onComplete={handleOnboardingComplete} />;
  if (!profile) return null;

  return (
    <div style={{ minHeight: '100vh', background: c.pageBg }}>
      <div style={{ display: activeTab === 'home' ? 'block' : 'none' }}>
        <Dashboard profile={profile} onNavigate={handleNavigate} refreshKey={refreshKey} />
      </div>
      <div style={{ display: activeTab === 'issue' ? 'block' : 'none' }}>
        <IssueMachine onSaved={() => { refresh(); setActiveTab('home'); }} />
      </div>
      <div style={{ display: activeTab === 'deposit' ? 'block' : 'none' }}>
        <Deposit refreshKey={refreshKey} onSaved={refresh} />
      </div>
      <div style={{ display: activeTab === 'records' ? 'block' : 'none' }}>
        <Records refreshKey={refreshKey} onSaved={refresh} initialFilter={recordsFilter} />
      </div>
      <div style={{ display: activeTab === 'profile' ? 'block' : 'none' }}>
        <Profile
          profile={profile}
          onProfileUpdated={p => setProfile(p)}
          onDataChanged={handleDataChanged}
        />
      </div>
      <BottomNav active={activeTab} onChange={setActiveTab} />
    </div>
  );
}

export default function App() {
  return <AppInner />;
}
