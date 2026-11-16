async function parse(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}
const opts = (method, body) => ({ method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

export const api = {
  get: (url) => fetch('/api' + url).then(parse),
  send: (method, url, body) => fetch('/api' + url, opts(method, body)).then(parse),
  async blob(url, body) {
    const res = await fetch('/api' + url, opts('POST', body));
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || 'Download failed');
    return res.blob();
  },
};
