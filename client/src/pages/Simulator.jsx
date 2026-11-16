import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { useFetch } from '../hooks.js';
import { Panel, RequestsTable } from '../components/ui.jsx';

export default function Simulator({ tick, refresh }) {
  const [count, setCount] = useState(10);
  const [live, setLive] = useState(false);
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const { data } = useFetch('/requests?range=today&limit=15', [tick]);

  async function simulate(n = count) {
    setBusy(true);
    try {
      const r = await api.send('POST', '/simulate', { count: Number(n) });
      setMsg(`Added ${r.created} simulated requests.`);
      refresh();
    } catch (e) { setMsg(e.message); setLive(false); }
    setBusy(false);
  }

  useEffect(() => {
    if (!live) return;
    const id = setInterval(() => simulate(2), 3000);
    return () => clearInterval(id);
  }, [live]);

  return (
    <>
      <Panel title="Simulate traffic">
        <p className="muted">Generates fake visits from sample IP addresses. Nothing is sent over the network and no real IPs are spoofed.</p>
        <div className="row">
          <label className="inline">Requests
            <input type="number" min="1" max="100" value={count} onChange={(e) => setCount(e.target.value)} style={{ width: 90 }} />
          </label>
          <button className="btn" disabled={busy} onClick={() => simulate()}>Simulate Traffic</button>
          <button className={'btn btn-ghost' + (live ? ' on' : '')} onClick={() => setLive((v) => !v)}>{live ? 'Stop live stream' : 'Start live stream'}</button>
        </div>
        {msg && <p className={msg.startsWith('Added') ? 'ok' : 'error'}>{msg}</p>}
      </Panel>
      <Panel title="Incoming requests (latest 15 today)">{data ? <RequestsTable rows={data.rows} /> : <p className="muted">Loading…</p>}</Panel>
    </>
  );
}
