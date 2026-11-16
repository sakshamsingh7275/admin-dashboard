import { useCallback, useEffect, useState } from 'react';
import { api } from './api.js';
import { themeVars } from './theme.js';
import { Sidebar, Topbar } from './components/Layout.jsx';
import Overview from './pages/Overview.jsx';
import Analytics from './pages/Analytics.jsx';
import IpLookup from './pages/IpLookup.jsx';
import Simulator from './pages/Simulator.jsx';
import CssGenerator from './pages/CssGenerator.jsx';
import Settings from './pages/Settings.jsx';

export const NAV = [
  ['overview', 'Overview', Overview],
  ['analytics', 'User Analytics', Analytics],
  ['lookup', 'IP Lookup', IpLookup],
  ['simulator', 'Traffic Simulator', Simulator],
  ['css', 'CSS Generator', CssGenerator],
  ['settings', 'Settings', Settings],
];

export default function App() {
  const [page, setPage] = useState('overview');
  const [range, setRange] = useState('7d');
  const [tick, setTick] = useState(0);
  const [settings, setSettings] = useState(null);
  const [themeData, setThemeData] = useState(null); // { theme, presets }
  const [error, setError] = useState('');
  const refresh = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    Promise.all([api.get('/settings'), api.get('/theme')])
      .then(([s, t]) => { setSettings(s); setRange(s.defaultRange); setThemeData(t); })
      .catch((e) => setError(e.message));
  }, []);

  // Apply saved theme to the whole dashboard.
  useEffect(() => {
    if (!themeData) return;
    Object.entries(themeVars(themeData.theme)).forEach(([k, v]) => document.documentElement.style.setProperty(k, v));
  }, [themeData]);

  // Auto-refresh every N seconds so tables and charts stay live.
  useEffect(() => {
    if (!settings) return;
    const id = setInterval(refresh, settings.refreshSeconds * 1000);
    return () => clearInterval(id);
  }, [settings, refresh]);

  if (error) return <div className="boot error">Cannot reach the API ({error}). Start the server with <code>npm --prefix server start</code>.</div>;
  if (!settings || !themeData) return <div className="boot">Loading…</div>;

  const current = NAV.find((n) => n[0] === page);
  const Page = current[2];
  return (
    <div className="app">
      <Sidebar nav={NAV} page={page} setPage={setPage} siteName={settings.siteName} />
      <div className="main">
        <Topbar title={current[1]} range={range} setRange={setRange} refresh={refresh} />
        <main>
          <Page
            range={range} tick={tick} refresh={refresh}
            settings={settings} setSettings={setSettings}
            theme={themeData.theme} presets={themeData.presets}
            setTheme={(theme) => setThemeData((d) => ({ ...d, theme }))}
          />
        </main>
      </div>
    </div>
  );
}
