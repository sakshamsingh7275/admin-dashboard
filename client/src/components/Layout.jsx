const RANGES = [['today', 'Today'], ['7d', 'Last 7 Days'], ['30d', 'Last 30 Days']];

export function Sidebar({ nav, page, setPage, siteName }) {
  return (
    <aside className="sidebar">
      <div className="brand">{siteName}</div>
      <nav>
        {nav.map(([id, label]) => (
          <button key={id} className={'nav-item' + (page === id ? ' active' : '')} onClick={() => setPage(id)}>{label}</button>
        ))}
      </nav>
    </aside>
  );
}

export function Topbar({ title, range, setRange, refresh }) {
  return (
    <header className="topbar">
      <h1>{title}</h1>
      <div className="topbar-actions">
        <div className="segmented" role="group" aria-label="Date range">
          {RANGES.map(([id, label]) => (
            <button key={id} className={range === id ? 'on' : ''} onClick={() => setRange(id)}>{label}</button>
          ))}
        </div>
        <button className="btn btn-ghost" onClick={refresh}>Refresh</button>
        <span className="live"><i /> Live</span>
      </div>
    </header>
  );
}
