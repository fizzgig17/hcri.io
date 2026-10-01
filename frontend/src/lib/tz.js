// frontend/src/lib/tz.js
//
// Reconstructed from assets/app.js (minified vars TZ/setTZ/fmtTZ). This
// whole file is new -- there was no timezone handling at all in the stale
// frontend/src this replaces. Lets the app format dates in a timezone the
// user picked rather than always the browser's local one.

let TZ = localStorage.getItem('hcri_tz') || 'America/New_York';

export function setTZ(tz) {
  TZ = tz || 'America/New_York';
  try { localStorage.setItem('hcri_tz', TZ); } catch {}
}

export function getTZ() {
  return TZ;
}

// Formats a date (Date, timestamp, or "YYYY-MM-DD HH:MM[:SS]" string --
// treated as UTC if it has no explicit offset, matching how the backend
// sends created_at) in the stored timezone. asDateOnly=true uses
// toLocaleDateString instead of toLocaleString.
export function fmtTZ(value, options, asDateOnly) {
  let d;
  if (value === undefined) {
    d = new Date();
  } else if (typeof value === 'string') {
    let s = value.replace(' ', 'T');
    if (/^-?\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/.test(s)) s += 'Z';
    d = new Date(s);
  } else {
    d = new Date(value);
  }
  if (isNaN(d.getTime())) return '';
  const opts = { timeZone: TZ, ...(options || {}) };
  return asDateOnly ? d.toLocaleDateString(undefined, opts) : d.toLocaleString(undefined, opts);
}
