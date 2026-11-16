// Sample GeoIP table: first two octets -> country. Works fully offline.
const COUNTRIES = [
  { code: 'US', name: 'United States', weight: 22, prefixes: ['104.16', '34.102', '52.20'] },
  { code: 'IN', name: 'India', weight: 18, prefixes: ['49.36', '103.21', '117.200'] },
  { code: 'GB', name: 'United Kingdom', weight: 10, prefixes: ['81.2', '86.14'] },
  { code: 'DE', name: 'Germany', weight: 9, prefixes: ['85.214', '91.55'] },
  { code: 'FR', name: 'France', weight: 6, prefixes: ['90.84', '82.64'] },
  { code: 'JP', name: 'Japan', weight: 6, prefixes: ['126.12', '133.20'] },
  { code: 'BR', name: 'Brazil', weight: 6, prefixes: ['177.54', '189.40'] },
  { code: 'AU', name: 'Australia', weight: 5, prefixes: ['1.128', '203.2'] },
  { code: 'CA', name: 'Canada', weight: 6, prefixes: ['24.114', '99.240'] },
  { code: 'SG', name: 'Singapore', weight: 4, prefixes: ['103.252', '116.88'] },
  { code: 'ZA', name: 'South Africa', weight: 3, prefixes: ['41.13', '105.184'] },
  { code: 'AE', name: 'United Arab Emirates', weight: 3, prefixes: ['5.30', '94.200'] },
];
const MAP = new Map();
COUNTRIES.forEach((c) => c.prefixes.forEach((p) => MAP.set(p, c)));
const TOTAL = COUNTRIES.reduce((s, c) => s + c.weight, 0);

const rand = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
const pick = (arr) => arr[rand(0, arr.length - 1)];

function parseIp(ip) {
  if (typeof ip !== 'string') return null;
  const m = ip.trim().match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (!m) return null;
  const o = m.slice(1).map(Number);
  return o.every((n) => n <= 255) ? o : null;
}

function lookup(ip) {
  const o = parseIp(ip);
  if (!o) return null;
  const c = MAP.get(`${o[0]}.${o[1]}`);
  return { ip: o.join('.'), country: c ? c.name : 'Unknown', countryCode: c ? c.code : 'XX' };
}

function randomCountry() {
  let r = Math.random() * TOTAL;
  for (const c of COUNTRIES) if ((r -= c.weight) < 0) return c;
  return COUNTRIES[0];
}
const randomIp = (c) => `${pick(c.prefixes)}.${rand(1, 4)}.${rand(1, 40)}`;

module.exports = { COUNTRIES, lookup, randomCountry, randomIp, parseIp, pick, rand };
