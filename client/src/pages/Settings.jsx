import { useState } from 'react';
import { api } from '../api.js';
import { Panel } from '../components/ui.jsx';

export default function Settings({ settings, setSettings, refresh }) {
  const [form, setForm] = useState(settings);
  const [msg, setMsg] = useState({ ok: true, text: '' });
  const say = (ok, text) => setMsg({ ok, text });

  async function save(e) {
    e.preventDefault();
    try {
      const s = await api.send('PUT', '/settings', { ...form, refreshSeconds: Number(form.refreshSeconds) });
      setSettings(s); say(true, 'Settings saved.');
    } catch (err) { say(false, err.message); }
  }
  async function data(label, fn) {
    if (!window.confirm(`${label}? This changes the stored analytics data.`)) return;
    try { await fn(); refresh(); say(true, `${label} complete.`); } catch (err) { say(false, err.message); }
  }

  return (
    <>
      <Panel title="General">
        <form className="stack" onSubmit={save}>
          <label className="field"><span>Site name</span>
            <input value={form.siteName} maxLength={40} onChange={(e) => setForm({ ...form, siteName: e.target.value })} /></label>
          <label className="field"><span>Auto-refresh (seconds, 2–60)</span>
            <input type="number" min="2" max="60" value={form.refreshSeconds} onChange={(e) => setForm({ ...form, refreshSeconds: e.target.value })} /></label>
          <label className="field"><span>Default date range</span>
            <select value={form.defaultRange} onChange={(e) => setForm({ ...form, defaultRange: e.target.value })}>
              <option value="today">Today</option><option value="7d">Last 7 Days</option><option value="30d">Last 30 Days</option>
            </select></label>
          <div><button className="btn">Save settings</button></div>
        </form>
        {msg.text && <p className={msg.ok ? 'ok' : 'error'}>{msg.text}</p>}
      </Panel>
      <Panel title="Data">
        <div className="row">
          <button className="btn btn-ghost" onClick={() => data('Add 400 sample requests', () => api.send('POST', '/seed', {}))}>Add sample data</button>
          <button className="btn btn-ghost" onClick={() => data('Clear all requests', () => api.send('DELETE', '/requests'))}>Clear all requests</button>
        </div>
      </Panel>
    </>
  );
}
