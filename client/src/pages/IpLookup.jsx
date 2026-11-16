import { useState } from 'react';
import { api } from '../api.js';
import { useFetch } from '../hooks.js';
import { Flag, Panel, flagOf } from '../components/ui.jsx';

export default function IpLookup() {
  const [ip, setIp] = useState('49.36.1.10');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const countries = useFetch('/countries').data || [];

  async function submit(e, value = ip) {
    e?.preventDefault();
    setError('');
    try { setResult(await api.get(`/geo/${encodeURIComponent(value.trim())}`)); }
    catch (err) { setResult(null); setError(err.message); }
  }

  return (
    <>
      <Panel title="Look up an IP address">
        <form className="row" onSubmit={submit}>
          <input value={ip} onChange={(e) => setIp(e.target.value)} placeholder="e.g. 104.16.4.20" aria-label="IP address" />
          <button className="btn">Look up</button>
        </form>
        {error && <p className="error">{error}</p>}
        {result && (
          <div className="lookup-result">
            <span className="big-flag">{flagOf(result.countryCode)}</span>
            <div><strong>{result.country}</strong><div className="muted">{result.ip} · {result.countryCode}</div></div>
          </div>
        )}
      </Panel>
      <Panel title="Sample GeoIP mappings (click a range to try it)">
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Country</th><th>IP ranges</th></tr></thead>
            <tbody>
              {countries.map((c) => (
                <tr key={c.code}>
                  <td><Flag code={c.code} name={c.name} /></td>
                  <td>{c.prefixes.map((p) => (
                    <button key={p} className="chip" onClick={() => { const v = `${p}.1.1`; setIp(v); submit(null, v); }}>{p}.x.x</button>
                  ))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </>
  );
}
