import { useFetch } from '../hooks.js';
import { Panel, RequestsTable, StatCard } from '../components/ui.jsx';
import { CountryChart, PieBlock, VisitsChart } from '../components/Charts.jsx';

export default function Overview({ range, tick, theme }) {
  const { data, error } = useFetch(`/stats?range=${range}`, [tick]);
  if (!data) return error ? <p className="error">{error}</p> : <p className="muted">Loading…</p>;
  const t = data.totals;
  return (
    <>
      <div className="grid cards">
        <StatCard label="Total visitors" value={t.visitors} />
        <StatCard label="Unique IP addresses" value={t.uniqueIps} />
        <StatCard label="Countries" value={t.countries} />
        <StatCard label="Page views" value={t.pageViews} />
      </div>
      <div className="grid two">
        <Panel title="Visitors over time"><VisitsChart data={data.series} theme={theme} /></Panel>
        <Panel title="Visitors by country"><CountryChart data={data.byCountry} theme={theme} /></Panel>
      </div>
      <div className="grid two">
        <Panel title="Traffic by page"><PieBlock data={data.byPage} theme={theme} /></Panel>
        <Panel title="Traffic by browser"><PieBlock data={data.byBrowser} theme={theme} /></Panel>
      </div>
      <Panel title="Recent visitors"><RequestsTable rows={data.recent} /></Panel>
    </>
  );
}
