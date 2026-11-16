// Tiny JSON-file persistence (no native modules, zero setup).
const fs = require('fs');
const path = require('path');
const { PRESETS } = require('./css');

const FILE = path.join(__dirname, 'data', 'db.json');
const defaults = () => ({
  seq: 0,
  requests: [],
  settings: { siteName: 'Admin Dashboard', refreshSeconds: 5, defaultRange: '7d' },
  theme: { ...PRESETS.darkblue },
});

let db;
try { db = { ...defaults(), ...JSON.parse(fs.readFileSync(FILE, 'utf8')) }; } catch { db = defaults(); }

function save() {
  fs.mkdirSync(path.dirname(FILE), { recursive: true });
  fs.writeFileSync(FILE, JSON.stringify(db));
}
module.exports = { db: () => db, save };
