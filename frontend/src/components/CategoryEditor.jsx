// frontend/src/components/CategoryEditor.jsx
//
// Reconstructed from the deployed assets/app.js (minified function Cat).
// Replaces the earlier read-only placeholder in this file. Shows/edits a
// report's categorization across the 8 fixed kinds the backend knows
// about (api/_core/categories.php: category_kinds()): light_brand,
// light_model, led_cct, led_brand, led_model, optic, lumens, current.
//
// For a guest viewer (isGuest=true) it renders a compact read-only summary
// of whatever values are already on the report; for the owner it renders a
// full editor -- a multi-select "chip" combobox per kind (backed by the
// admin-curated value list from GET /api/categories), plus a plain
// free-text numeric input for the two "owner can create on the fly" kinds,
// lumens and current (see api/categories.php: $allowCreate).
//
// Persists via POST /api/categories/assign { reportId, kind, values: [...] }.
//
// NOTE: renders a "Don't see your light, LED, or optic? Request it" link
// that opens a modal (minified `E`, app.js ~line 13827) -- the same generic
// contact/feedback modal used elsewhere in the app, reconstructed as
// FeedbackModal (named export of AuthScreen.jsx).

import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { useTheme } from '../lib/ThemeContext.jsx';
import { FeedbackModal as RequestValueModal } from './AuthScreen';

const KINDS = [
  ['light_brand', 'Light Brand'],
  ['light_model', 'Light Model'],
  ['led_cct', 'LED CCT'],
  ['led_brand', 'LED Brand'],
  ['led_model', 'LED Model'],
  ['optic', 'Optic'],
  ['lumens', 'Lumens'],
  ['current', 'Current (A)'],
];

export default function CategoryEditor({ report, isGuest }) {
  const { theme: o } = useTheme();

  const curValues = (k) =>
    ((report && report.categories && report.categories[k]) || [])
      .map((c) => c && c.value)
      .filter(Boolean);

  const initVals = () => {
    const r = {};
    for (const [k] of KINDS) r[k] = curValues(k);
    return r;
  };

  const [vals, setVals] = useState(initVals);
  const [opts, setOpts] = useState({});
  const [draft, setDraft] = useState({});
  const [busy, setBusy] = useState('');
  const [openK, setOpenK] = useState(null);
  const [hi, setHi] = useState(0);
  const [reqOpen, setReqOpen] = useState(false);

  useEffect(() => { setVals(initVals()); }, [report && report.id]);

  useEffect(() => {
    if (isGuest) return;
    api.get('/categories').then(setOpts).catch(() => {});
  }, [isGuest]);

  const persist = async (k, list) => {
    setBusy(k);
    try {
      const res = await api.post('/categories/assign', { reportId: report.id, kind: k, values: list });
      const saved = res && res.categories ? res.categories : list.map((v) => ({ value: v }));
      if (report.categories) report.categories[k] = saved;
      setVals((v) => ({ ...v, [k]: saved.map((c) => c.value) }));
      const r = await api.get('/categories');
      setOpts(r);
    } catch (x) {}
    setBusy('');
  };

  const add = (k, val) => {
    val = (val || '').trim();
    if (!val) return;
    const list = vals[k] || [];
    if (list.some((x) => x.toLowerCase() === val.toLowerCase())) return;
    persist(k, [...list, val]);
  };

  const remove = (k, val) => persist(k, (vals[k] || []).filter((x) => x !== val));

  // ── Guest: compact read-only summary of whatever values exist ───────────
  if (isGuest) {
    const blocks = KINDS.map(([k, lab]) => {
      const cv = curValues(k);
      if (!cv.length) return null;
      return (
        <div key={k} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: 10, color: o.dim, textTransform: 'uppercase', letterSpacing: 0.8, fontWeight: 700 }}>
            {lab}
          </span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {cv.map((v) => (
              <span
                key={v}
                style={{
                  fontSize: 13,
                  color: o.text,
                  fontWeight: 600,
                  background: o.surface2 || o.surface,
                  border: `1px solid ${o.border}`,
                  borderRadius: 12,
                  padding: '2px 10px',
                }}
              >
                {v}
              </span>
            ))}
          </div>
        </div>
      );
    }).filter(Boolean);

    if (!blocks.length) return null;
    return (
      <div style={{ gridColumn: '1/-1', marginTop: 4 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: o.accent, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }}>
          Categories
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 18 }}>{blocks}</div>
      </div>
    );
  }

  // ── Owner: editable fields ────────────────────────────────────────────
  const field = ([k, lab]) => {
    // Free-text numeric kinds (owner may type any value -- the backend
    // auto-creates these two kinds on save, see api/categories.php).
    if (k === 'lumens' || k === 'current') {
      const v0 = (vals[k] || [])[0] || '';
      return (
        <div key={k} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={{ fontSize: 10, color: o.dim, textTransform: 'uppercase', letterSpacing: 0.8, fontWeight: 700 }}>
            {lab}
          </label>
          <input
            value={v0}
            placeholder={k === 'lumens' ? 'e.g. 450' : 'e.g. 0.35'}
            inputMode="decimal"
            autoComplete="off"
            disabled={busy === k}
            onChange={(ev) => {
              let val = ev.target.value.replace(/[^\d.]/g, '');
              const i = val.indexOf('.');
              if (i >= 0) val = val.slice(0, i + 1) + val.slice(i + 1).replace(/\./g, '');
              setVals((s) => ({ ...s, [k]: val ? [val] : [] }));
            }}
            onBlur={(ev) => {
              const val = (ev.target.value || '').trim();
              persist(k, val ? [val] : []);
            }}
            onKeyDown={(ev) => {
              if (ev.key === 'Enter') { ev.preventDefault(); ev.target.blur(); }
            }}
            style={{
              background: o.surface2 || o.surface,
              border: `1px solid ${busy === k ? o.accent : o.border}`,
              borderRadius: 6,
              padding: '7px 8px',
              color: o.text,
              fontSize: 13,
              fontFamily: 'monospace',
              outline: 'none',
              width: '100%',
              boxSizing: 'border-box',
            }}
          />
        </div>
      );
    }

    // Multi-select chip combobox backed by the admin-curated value list.
    const list = (opts && opts[k]) || [];
    const chips = vals[k] || [];
    const avail = list.filter((it) => !chips.includes(it.value));
    const flt = avail.filter((it) => it.value.toLowerCase().includes((draft[k] || '').toLowerCase()));

    return (
      <div key={k} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <label style={{ fontSize: 10, color: o.dim, textTransform: 'uppercase', letterSpacing: 0.8, fontWeight: 700 }}>
          {lab}
        </label>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 5,
            alignItems: 'center',
            background: o.surface2 || o.surface,
            border: `1px solid ${busy === k ? o.accent : o.border}`,
            borderRadius: 6,
            padding: '5px 6px',
            minHeight: 34,
            boxSizing: 'border-box',
          }}
        >
          {chips.map((v) => (
            <span
              key={v}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                background: `${o.accent}1f`,
                border: `1px solid ${o.accent}55`,
                color: o.text,
                borderRadius: 12,
                padding: '2px 4px 2px 9px',
                fontSize: 12,
                fontFamily: 'monospace',
              }}
            >
              {v}
              <button
                onClick={() => remove(k, v)}
                title="Remove"
                style={{ background: 'none', border: 'none', color: o.dim, cursor: 'pointer', fontSize: 14, lineHeight: 1, padding: '0 3px' }}
              >
                ×
              </button>
            </span>
          ))}
          <div style={{ flex: 1, minWidth: 90, position: 'relative' }}>
            <input
              value={draft[k] || ''}
              placeholder={chips.length ? '+ add…' : 'select…'}
              autoComplete="off"
              onFocus={() => { setOpenK(k); setHi(0); }}
              onChange={(ev) => { setDraft((s) => ({ ...s, [k]: ev.target.value })); setOpenK(k); setHi(0); }}
              onKeyDown={(ev) => {
                if (ev.key === 'ArrowDown') {
                  ev.preventDefault();
                  setOpenK(k);
                  setHi((h) => Math.min(h + 1, flt.length - 1));
                } else if (ev.key === 'ArrowUp') {
                  ev.preventDefault();
                  setHi((h) => Math.max(h - 1, 0));
                } else if (ev.key === 'Enter') {
                  ev.preventDefault();
                  if ((draft[k] || '').trim() && flt.length) {
                    const pick = flt[Math.min(hi, flt.length - 1)];
                    if (pick) { add(k, pick.value); setDraft((s) => ({ ...s, [k]: '' })); setOpenK(null); setHi(0); }
                  }
                } else if (ev.key === 'Tab') {
                  if ((draft[k] || '').trim() && flt.length) {
                    const pick = flt[Math.min(hi, flt.length - 1)];
                    if (pick) { add(k, pick.value); setDraft((s) => ({ ...s, [k]: '' })); setOpenK(null); setHi(0); }
                  }
                } else if (ev.key === 'Escape') {
                  setOpenK(null);
                }
              }}
              style={{
                flex: 1,
                width: '100%',
                background: 'none',
                border: 'none',
                color: o.text,
                fontSize: 13,
                fontFamily: 'monospace',
                outline: 'none',
                padding: 2,
              }}
            />
            {openK === k && (
              <div onClick={() => { setOpenK(null); setDraft((s) => ({ ...s, [k]: '' })); }} style={{ position: 'fixed', inset: 0, zIndex: 60 }} />
            )}
            {openK === k && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 6px)',
                  left: 0,
                  minWidth: 170,
                  maxHeight: 260,
                  overflowY: 'auto',
                  background: o.surface2 || o.surface,
                  border: `1px solid ${o.border}`,
                  borderRadius: 8,
                  boxShadow: '0 8px 24px rgba(0,0,0,.35)',
                  zIndex: 61,
                  padding: 4,
                }}
              >
                {flt.length
                  ? flt.map((it, idx) => (
                      <div
                        key={it.id}
                        onMouseDown={(ev) => {
                          ev.preventDefault();
                          add(k, it.value);
                          setDraft((s) => ({ ...s, [k]: '' }));
                          setOpenK(null);
                          setHi(0);
                        }}
                        onMouseEnter={() => setHi(idx)}
                        style={{
                          padding: '7px 12px',
                          fontSize: 13,
                          fontFamily: 'monospace',
                          color: o.text,
                          cursor: 'pointer',
                          borderRadius: 5,
                          whiteSpace: 'nowrap',
                          background: idx === hi ? `${o.accent}33` : 'transparent',
                        }}
                      >
                        {it.value}
                      </div>
                    ))
                  : (
                    <div style={{ padding: '8px 12px', fontSize: 12, color: o.dim, fontFamily: 'monospace' }}>
                      {avail.length ? 'No matches' : 'No more options'}
                    </div>
                  )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ gridColumn: '1/-1', marginTop: 4 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: o.accent, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }}>
        Categories
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 12 }}>
        {KINDS.map(field)}
      </div>
      <button
        type="button"
        onClick={() => setReqOpen(true)}
        style={{
          display: 'inline-block',
          marginTop: 10,
          fontSize: 11,
          color: o.accent,
          textDecoration: 'none',
          fontFamily: 'monospace',
          opacity: 0.85,
          background: 'none',
          border: 'none',
          padding: 0,
          cursor: 'pointer',
        }}
      >
        Don't see your light, LED, or optic? Request it →
      </button>
      {reqOpen && <RequestValueModal onClose={() => setReqOpen(false)} />}
    </div>
  );
}
