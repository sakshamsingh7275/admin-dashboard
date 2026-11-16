const express = require('express');
const cors = require('cors');
const { COUNTRIES, lookup, randomCountry, randomIp, pick } = require('./geo');
const { build, validate, PRESETS } = require('./css');
const store = require('./store');

const app = express();
app.use(cors());
app.use(express.json({ limit: '100kb' }));

const BROWSERS = ['Chrome', 'Firefox', 'Safari', 'Edge', 'Opera'];
const OSES = ['Windows', 'macOS', 'Linux', 'Android', 'iOS'];
const PAGES = ['/', '/pricing', '/blog', '/docs', '/login', '/signup', '/contact', '/products'];
const RANGES = { today: 1, '7d': 7, '30d': 30 };
const MAX_ROWS = 5000;

const bad = (msg) => Object.assign(new Error(msg), { status: 400 });
const h = (fn) => (req, res, next) => { try { fn(req, res, next); } catch (e) { next(e); } };

function getRange(r = '7d') {
  if (!RANGES[r]) throw bad('range must be today, 7d or 30d');
  return r;
}
function since(range) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime() - (RANGES[range] - 1) * 864e5;
}
function makeRequest(ts) {
  const c = randomCountry();
  const db = store.db();
  return {
    id: ++db.seq, ip: randomIp(c), country: c.name, countryCode: c.code,
    timestamp: new Date(ts).toISOString(), browser: pick(BROWSERS), os: pick(OSES), page: pick(PAGES),
  };
}
function seed(n = 400) {
  const db = store.db();
  const now = Date.now();
  for (let i = 0; i < n; i++) db.requests.push(makeRequest(now - Math.pow(Math.random(), 1.6) * 30 * 864e5));
  db.requests.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  store.save();
}
if (store.db().requests.length === 0) seed();

function inRange(range, q = '', country = '') {
  const from = since(range);
  const needle = String(q).trim().toLowerCase();
  return store.db().requests.filter((r) => {
    if (Date.parse(r.timestamp) < from) return false;
    if (country && r.countryCode !== country) return false;
    return !needle || [r.ip, r.country, r.browser, r.os, r.page].some((v) => v.toLowerCase().includes(needle));
  });
}
const tally = (rows, key) => {
  const m = {};
  rows.forEach((r) => (m[r[key]] = (m[r[key]] || 0) + 1));
  return Object.entries(m).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
};

// ---------- Settings & theme ----------
app.get('/api/settings', h((req, res) => res.json(store.db().settings)));
app.put('/api/settings', h((req, res) => {
  const { siteName, refreshSeconds, defaultRange } = req.body || {};
  if (typeof siteName !== 'string' || !siteName.trim() || siteName.length > 40) throw bad('siteName is required (max 40 characters)');
  if (!Number.isInteger(refreshSeconds) || refreshSeconds < 2 || refreshSeconds > 60) throw bad('refreshSeconds must be 2 to 60');
  getRange(defaultRange);
  store.db().settings = { siteName: siteName.trim(), refreshSeconds, defaultRange };
  store.save();
  res.json(store.db().settings);
}));
app.get('/api/theme', h((req, res) => res.json({ theme: store.db().theme, presets: PRESETS })));
app.put('/api/theme', h((req, res) => {
  store.db().theme = validate(req.body);
  store.save();
  res.json({ theme: store.db().theme });
}));

// ---------- CSS generator ----------
app.post('/api/css/preview', h((req, res) => {
  const css = build(req.body);
  res.json({ css, bytes: Buffer.byteLength(css) });
}));
app.post('/api/css/download', h((req, res) => {
  const { theme, filename } = req.body || {};
  const css = build(theme);
  let name = String(filename || 'theme.css').replace(/[^\w.-]/g, '_').slice(0, 60);
  if (!/\.css$/i.test(name)) name += '.css';
  res.set({ 'Content-Type': 'text/css; charset=utf-8', 'Content-Disposition': `attachment; filename="${name}"` });
  res.send(css);
}));

// ---------- Traffic ----------
app.get('/api/countries', h((req, res) => res.json(COUNTRIES.map(({ code, name, prefixes }) => ({ code, name, prefixes })))));
app.get('/api/geo/:ip', h((req, res) => {
  const r = lookup(req.params.ip);
  if (!r) throw bad('Enter a valid IPv4 address, e.g. 49.36.1.10');
  res.json(r);
}));
app.get('/api/requests', h((req, res) => {
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 50, 1), 500);
  const rows = inRange(getRange(req.query.range), req.query.q, String(req.query.country || '').toUpperCase());
  res.json({ total: rows.length, rows: rows.slice(-limit).reverse() });
}));
app.post('/api/simulate', h((req, res) => {
  const count = req.body && req.body.count;
  if (!Number.isInteger(count) || count < 1 || count > 100) throw bad('count must be a whole number from 1 to 100');
  const db = store.db();
  const now = Date.now();
  const created = Array.from({ length: count }, (_, i) => makeRequest(now - (count - i) * 400));
  db.requests.push(...created);
  if (db.requests.length > MAX_ROWS) db.requests.splice(0, db.requests.length - MAX_ROWS);
  store.save();
  res.status(201).json({ created: created.length, rows: created.reverse() });
}));
app.delete('/api/requests', h((req, res) => { store.db().requests = []; store.save(); res.json({ ok: true }); }));
app.post('/api/seed', h((req, res) => { seed(400); res.json({ ok: true }); }));

app.get('/api/stats', h((req, res) => {
  const range = getRange(req.query.range);
  const rows = inRange(range);
  const hourly = range === 'today';
  const n = hourly ? new Date().getHours() + 1 : RANGES[range];
  const start = hourly ? (() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d.getTime(); })() : since(range);
  const buckets = Array.from({ length: n }, (_, i) => {
    const d = new Date(start + (hourly ? i * 36e5 : i * 864e5));
    return { label: hourly ? `${String(d.getHours()).padStart(2, '0')}:00` : d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }), views: 0, set: new Set() };
  });
  rows.forEach((r) => {
    const i = Math.min(n - 1, Math.max(0, Math.floor((Date.parse(r.timestamp) - start) / (hourly ? 36e5 : 864e5))));
    buckets[i].views++;
    buckets[i].set.add(`${r.ip}|${r.browser}|${r.os}`);
  });
  const countries = {};
  rows.forEach((r) => { (countries[r.country] ||= { name: r.country, code: r.countryCode, value: 0 }).value++; });
  res.json({
    totals: {
      visitors: new Set(rows.map((r) => `${r.ip}|${r.browser}|${r.os}`)).size,
      uniqueIps: new Set(rows.map((r) => r.ip)).size,
      countries: Object.keys(countries).length,
      pageViews: rows.length,
    },
    series: buckets.map(({ label, views, set }) => ({ label, views, visitors: set.size })),
    byCountry: Object.values(countries).sort((a, b) => b.value - a.value).slice(0, 8),
    byPage: tally(rows, 'page'),
    byBrowser: tally(rows, 'browser'),
    recent: rows.slice(-8).reverse(),
  });
}));

app.use('/api', (req, res) => res.status(404).json({ error: 'Not found' }));
app.use((err, req, res, next) => {
  const status = err.status || 500;
  if (status === 500) console.error(err);
  res.status(status).json({ error: status === 500 ? 'Internal server error' : err.message });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
