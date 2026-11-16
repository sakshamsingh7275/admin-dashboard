import { useState } from 'react';
import { useFetch } from '../hooks.js';
import { Panel, RequestsTable } from '../components/ui.jsx';

export default function Analytics({ range, tick }) {
  const [q, setQ] = useState('');
  const [country, setCountry] = useState('');
  const countries = useFetch('/countries').data || [];
  const { data, error } = useFetch(`/requests?range=${range}&limit=200&q=${encodeURIComponent(q)}&country=${country}`, [tick]);
  return (
    <Panel
      title={`Requests${data ? ` (${data.total.toLocaleString()} matching, showing latest ${data.rows.length})` : ''}`}
      actions={
        <div className="filters">
          <input placeholder="Search IP, country, browser, page…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search" />
          <select value={country} onChange={(e) => setCountry(e.target.value)} aria-label="Country filter">
            <option value="">All countries</option>
            {countries.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
          </select>
        </div>
      }
    >
      {error && <p className="error">{error}</p>}
      {data && <RequestsTable rows={data.rows} />}
    </Panel>
  );
}
