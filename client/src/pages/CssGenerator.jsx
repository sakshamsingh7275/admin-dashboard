import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { FONTS, themeVars } from '../theme.js';
import { Panel } from '../components/ui.jsx';

const COLORS = [['bg', 'Page background'], ['surface', 'Cards & sidebar'], ['border', 'Borders'], ['text', 'Text'], ['muted', 'Muted text'], ['primary', 'Primary (buttons)'], ['accent', 'Accent (links, badges)']];
const isHex = (v) => /^#[0-9a-f]{6}$/i.test(v);

function ColorField({ label, value, onChange }) {
  return (
    <label className="field"><span>{label}</span>
      <div className="color-row">
        <input type="color" value={isHex(value) ? value : '#000000'} onChange={(e) => onChange(e.target.value)} aria-label={label} />
        <input value={value} maxLength={7} onChange={(e) => onChange(e.target.value)} className={isHex(value) ? '' : 'invalid'} />
      </div>
    </label>
  );
}

function Slider({ label, unit = '', min, max, value, onChange }) {
  return (
    <label className="field"><span>{label}: {value}{unit}</span>
      <input type="range" min={min} max={max} value={value} onChange={(e) => onChange(Number(e.target.value))} /></label>
  );
}

export default function CssGenerator({ theme: saved, presets, setTheme: saveToApp }) {
  const [theme, setTheme] = useState(saved);
  const [css, setCss] = useState('');
  const [bytes, setBytes] = useState(0);
  const [filename, setFilename] = useState('theme.css');
  const [msg, setMsg] = useState({ ok: true, text: '' });
  const set = (patch) => setTheme((t) => ({ ...t, ...patch }));
  const say = (ok, text) => setMsg({ ok, text });

  // Regenerate the CSS from the server (debounced) whenever options change.
  useEffect(() => {
    const id = setTimeout(() => {
      api.send('POST', '/css/preview', theme)
        .then((r) => { setCss(r.css); setBytes(r.bytes); setMsg((m) => (m.ok ? m : { ok: true, text: '' })); })
        .catch((e) => say(false, e.message));
    }, 250);
    return () => clearTimeout(id);
  }, [theme]);

  async function download() {
    try {
      const blob = await api.blob('/css/download', { theme, filename });
      const url = URL.createObjectURL(blob);
      const a = Object.assign(document.createElement('a'), { href: url, download: /\.css$/i.test(filename) ? filename : filename + '.css' });
      document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
      say(true, 'CSS file downloaded.');
    } catch (e) { say(false, e.message); }
  }
  async function copy() {
    try { await navigator.clipboard.writeText(css); say(true, 'CSS copied to clipboard.'); }
    catch { say(false, 'Copy failed. Select the code and copy it manually.'); }
  }
  async function apply() {
    try { const r = await api.send('PUT', '/theme', theme); saveToApp(r.theme); say(true, 'Theme applied to the dashboard.'); }
    catch (e) { say(false, e.message); }
  }

  return (
    <div className="grid css-layout">
      <div className="stack">
        <Panel title="Presets">
          <div className="row wrap">
            {Object.entries(presets).map(([id, p]) => (
              <button key={id} className="chip" onClick={() => set({ ...p, comments: theme.comments, minify: theme.minify })}>
                <i className="dot" style={{ background: p.primary }} /> {p.name}
              </button>
            ))}
          </div>
        </Panel>
        <Panel title="Colours">
          <div className="grid fields">{COLORS.map(([k, label]) => <ColorField key={k} label={label} value={theme[k]} onChange={(v) => set({ [k]: v })} />)}</div>
        </Panel>
        <Panel title="Shape & type">
          <div className="grid fields">
            <label className="field"><span>Font</span>
              <select value={theme.fontFamily} onChange={(e) => set({ fontFamily: e.target.value })}>
                {Object.keys(FONTS).map((f) => <option key={f} value={f}>{f}</option>)}
              </select></label>
            <label className="field"><span>Spacing</span>
              <select value={theme.density} onChange={(e) => set({ density: e.target.value })}>
                <option value="compact">Compact</option><option value="comfortable">Comfortable</option><option value="spacious">Spacious</option>
              </select></label>
            <Slider label="Corner radius" unit="px" min={0} max={24} value={theme.radius} onChange={(v) => set({ radius: v })} />
            <Slider label="Font size" unit="px" min={12} max={18} value={theme.fontSize} onChange={(v) => set({ fontSize: v })} />
            <Slider label="Sidebar width" unit="px" min={200} max={320} value={theme.sidebarWidth} onChange={(v) => set({ sidebarWidth: v })} />
            <Slider label="Shadow depth" min={0} max={3} value={theme.shadow} onChange={(v) => set({ shadow: v })} />
          </div>
          <div className="row wrap">
            <label className="inline"><input type="checkbox" checked={theme.comments} onChange={(e) => set({ comments: e.target.checked })} /> Include comments</label>
            <label className="inline"><input type="checkbox" checked={theme.minify} onChange={(e) => set({ minify: e.target.checked })} /> Minify</label>
          </div>
        </Panel>
      </div>

      <div className="stack">
        <Panel title="Live preview">
          <div className="preview" style={themeVars(theme)}>
            <div className="pv-side" style={{ width: Math.min(theme.sidebarWidth, 240) * 0.6 }}><b>Your site</b><span>Home</span><span>Reports</span></div>
            <div className="pv-main">
              <div className="card"><h3>Weekly visitors</h3><p className="muted">12,480 views from 38 countries</p>
                <div className="row"><button className="btn">Primary</button><button className="btn btn-ghost">Secondary</button><span className="badge">/pricing</span></div></div>
              <input placeholder="Text input" aria-label="Preview input" />
              <table className="table"><thead><tr><th>IP</th><th>Country</th></tr></thead><tbody><tr><td>49.36.1.10</td><td>India</td></tr></tbody></table>
            </div>
          </div>
        </Panel>
        <Panel title={`Generated CSS (${bytes.toLocaleString()} bytes)`}
          actions={<button className="btn btn-ghost" onClick={copy}>Copy CSS</button>}>
          <pre className="code" tabIndex={0}>{css}</pre>
          <div className="row wrap">
            <input value={filename} onChange={(e) => setFilename(e.target.value)} aria-label="File name" style={{ width: 180 }} />
            <button className="btn" onClick={download}>Download CSS</button>
            <button className="btn btn-ghost" onClick={apply}>Apply to dashboard</button>
            <button className="btn btn-ghost" onClick={() => set(presets.darkblue)}>Reset to Dark Blue</button>
          </div>
          {msg.text && <p className={msg.ok ? 'ok' : 'error'}>{msg.text}</p>}
        </Panel>
      </div>
    </div>
  );
}
