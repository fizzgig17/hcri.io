let _token = localStorage.getItem('spd_token') || '';

export function setToken(t) {
  _token = t;
  t ? localStorage.setItem('spd_token', t) : localStorage.removeItem('spd_token');
}
export function getToken() { return _token; }

// Derive base path from the page URL so this works at any subdirectory
function getBase() {
  // e.g. http://localhost/spd2/index.php -> /spd2/
  const path = window.location.pathname;
  const base = path.substring(0, path.lastIndexOf('/') + 1);
  return base;
}

async function req(method, path, body, isForm) {
  const url = getBase() + 'index.php/api' + path;
  const opts = { method, headers: { Authorization: `Bearer ${_token}` } };
  if (isForm) { opts.body = body; }
  else if (body) { opts.headers['Content-Type'] = 'application/json'; opts.body = JSON.stringify(body); }
  const r = await fetch(url, opts);
  const json = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(json.error || r.statusText);
  return json;
}

export const api = {
  get:    p      => req('GET',    p),
  post:   (p, b) => req('POST',  p, b),
  patch:  (p, b) => req('PATCH', p, b),
  del:    p      => req('DELETE', p),
  upload: (p, f) => req('POST',  p, f, true),
};
