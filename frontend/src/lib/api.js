// frontend/src/lib/api.js
//
// Reconstructed from the deployed assets/app.js (minified vars g/h/_/v/y) --
// see /docs or the reconstruction notes in this repo for why this file had
// to be rebuilt from the compiled bundle instead of edited in place.

let token = localStorage.getItem('spd_token') || '';

// Stores the bearer token used by every request() call below, persisting it
// to localStorage so a page reload stays logged in. Pass '' (or any falsy
// value) to clear it on logout.
export function setToken(t) {
  token = t;
  if (t) localStorage.setItem('spd_token', t);
  else localStorage.removeItem('spd_token');
}

// Current in-memory bearer token (mirrors localStorage's "spd_token").
export function getToken() {
  return token;
}

// The directory the app is actually served from (e.g. "/" or "/spd/"),
// derived from the current URL rather than hardcoded, so API calls work
// whatever depth this is deployed at. Exported because a few features
// (Notices, Explore) build their own fetch URLs directly off this instead
// of going through the api.* helpers.
export function basePath() {
  const p = window.location.pathname;
  return p.substring(0, p.lastIndexOf('/') + 1);
}

// Core fetch wrapper used by every api.* helper below. Builds the URL from
// basePath() + the PHP backend's /index.php/api prefix, attaches the bearer
// token, JSON-encodes a plain body (or sends it as-is for an upload's
// FormData), and throws an Error with the server's `error` field (falling
// back to the HTTP status text) on a non-OK response.
async function request(method, path, body, isUpload) {
  const url = basePath() + 'index.php/api' + path;
  const opts = { method, headers: { Authorization: `Bearer ${token}` } };
  if (isUpload) {
    opts.body = body;
  } else if (body) {
    opts.headers['Content-Type'] = 'application/json';
    opts.body = JSON.stringify(body);
  }
  const res = await fetch(url, opts);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || res.statusText);
  return data;
}

// Thin REST client for the backend's /index.php/api/* endpoints. Every
// method returns the parsed JSON response, or throws on a non-2xx status.
export const api = {
  get:    (path)       => request('GET', path),
  post:   (path, body)  => request('POST', path, body),
  patch:  (path, body)  => request('PATCH', path, body),
  del:    (path)        => request('DELETE', path),
  upload: (path, body)  => request('POST', path, body, true),
};
