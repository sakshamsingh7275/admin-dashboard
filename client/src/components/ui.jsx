export const flagOf = (code) =>
  !code || code === 'XX' ? '🌐' : code.toUpperCase().replace(/./g, (c) => String.fromCodePoint(127397 + c.charCodeAt(0)));

export const Flag = ({ code, name }) => <span className="flag-cell"><span className="flag" aria-hidden>{flagOf(code)}</span>{name}</span>;

export const Panel = ({ title, children, actions }) => (
  <section className="card panel">
    <div className="panel-head"><h2>{title}</h2>{actions}</div>
    {children}
  </section>
);

export const StatCard = ({ label, value }) => (
  <div className="card stat"><span className="muted">{label}</span><strong>{Number(value).toLocaleString()}</strong></div>
);

export function RequestsTable({ rows }) {
  if (!rows.length) return <p className="muted empty">No requests in this range yet. Open Traffic Simulator and press Simulate Traffic.</p>;
  return (
    <div className="table-wrap">
      <table className="table">
        <thead><tr><th>IP address</th><th>Country</th><th>Time</th><th>Browser</th><th>OS</th><th>Page</th></tr></thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <td><code>{r.ip}</code></td>
              <td><Flag code={r.countryCode} name={r.country} /></td>
              <td>{new Date(r.timestamp).toLocaleString()}</td>
              <td>{r.browser}</td><td>{r.os}</td><td><span className="badge">{r.page}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
