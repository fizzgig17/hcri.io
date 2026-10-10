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

import { useState, useEffect, useRef } from 'react';
import { flushSync, createPortal } from 'react-dom';
import { api } from '../lib/api';
import { useTheme } from '../lib/ThemeContext.jsx';
import { FeedbackModal as RequestValueModal } from './AuthScreen';
import usePanelBackClose from '../hooks/usePanelBackClose';

const ALL_KINDS = [
  ['light_brand', 'Light Brand'],
  ['light_model', 'Light Model'],
  ['led_cct', 'LED CCT'],
  ['led_brand', 'LED Brand'],
  ['led_model', 'LED Model'],
  ['optic', 'Optic'],
  ['lumens', 'Lumens'],
  ['current', 'Current (A)'],
];

export default function CategoryEditor({ report, isGuest, kinds }) {
  const { theme: o } = useTheme();
  // `kinds` (optional list of kind ids) limits the editor to those fields, e.g. the quick-edit dialog on report cards.
  const KINDS = kinds ? ALL_KINDS.filter(([k]) => kinds.includes(k)) : ALL_KINDS;

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
  // Where the open suggestion list floats. The list is position:fixed and placed
  // from the VISUAL viewport, so on phones it flips above the field / shrinks when
  // the on-screen keyboard would otherwise cover it, instead of being clipped by
  // (or scrolled under) the keyboard and the page header.
  const anchorRefs = useRef({});
  // Phones: editing a category opens a full-width sheet pinned to the top of the screen
  // (search box + list) instead of a dropdown under the field. The field being edited is
  // then never behind the on-screen keyboard, so the browser has nothing to pan/zoom and
  // the page underneath can stay perfectly still.
  const isTouch = typeof window !== 'undefined' && !!(window.matchMedia && window.matchMedia('(pointer: coarse)').matches);
  const isIOS = typeof navigator !== 'undefined' && (/iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));
  const sheetInputRef = useRef(null);
  // iOS pans the visual viewport when the keyboard opens, and `position: fixed` follows the
  // LAYOUT viewport, so a plain top:0 sheet can end up offset. Pin the sheet to the visual
  // viewport's own top edge and height instead.
  const [sheetBox, setSheetBox] = useState({ kb: 0 });
  useEffect(() => {
    if (!isTouch || !openK) return undefined;
    const vv = window.visualViewport;
    const upd = () => {
      const ih = window.innerHeight;
      const vh = vv ? vv.height : ih;
      const ot = vv ? vv.offsetTop : 0;
      const kb = Math.max(0, Math.round(ih - (vh + ot)));
      setSheetBox({ kb });
    };
    upd();
    const timers = [100, 300, 600, 1000].map((ms) => setTimeout(upd, ms));
    if (vv) { vv.addEventListener('resize', upd); vv.addEventListener('scroll', upd); }
    return () => {
      timers.forEach(clearTimeout);
      if (vv) { vv.removeEventListener('resize', upd); vv.removeEventListener('scroll', upd); }
    };
  }, [isTouch, openK]);
  const [listPos, setListPos] = useState(null);
  useEffect(() => {
    if (!openK || isTouch) { setListPos(null); return undefined; }
    const place = () => {
      const el = anchorRefs.current[openK];
      if (!el) return;
      const r = el.getBoundingClientRect();
      const vv = window.visualViewport;
      const vTop = vv ? vv.offsetTop : 0;
      const vH = vv ? vv.height : window.innerHeight;
      const vLeft = vv ? vv.offsetLeft : 0;
      const vW = vv ? vv.width : window.innerWidth;
      const gap = 6, margin = 8;
      // The usable band is the visible viewport clipped to the page's own scroll area:
      // mobile browsers draw their (translucent) URL bar over the top of the visual
      // viewport, but the app header always sits below it, so the scroll area's top
      // edge is a reliable "below the browser chrome" line.
      let bandTop = vTop, bandBottom = vTop + vH;
      for (let n = el.parentElement; n && n !== document.body; n = n.parentElement) {
        const oy = getComputedStyle(n).overflowY;
        if (oy === 'auto' || oy === 'scroll') {
          const nr = n.getBoundingClientRect();
          bandTop = Math.max(bandTop, nr.top);
          bandBottom = Math.min(bandBottom, nr.bottom);
          break;
        }
      }
      const below = bandBottom - r.bottom - gap - margin;
      const above = r.top - bandTop - gap - margin;
      const up = below < 150 && above > below;
      const maxHeight = Math.max(90, Math.min(260, up ? above : below));
      const width = Math.max(170, r.width);
      const left = Math.max(vLeft + margin, Math.min(r.left, vLeft + vW - width - margin));
      setListPos(up ? { left, width, maxHeight, bottom: window.innerHeight - r.top + gap } : { left, width, maxHeight, top: r.bottom + gap });
    };
    // On touch devices the keyboard slides in and the field is scrolled into view a few
    // hundred ms after focus; placing the list during that animation made it jump. Wait
    // for the layout to settle, then show it, and coalesce later updates into one per frame.
    const coarse = !!(window.matchMedia && window.matchMedia('(pointer: coarse)').matches);
    let ready = !coarse;
    let raf = 0;
    const schedule = () => {
      if (!ready || raf) return;
      raf = requestAnimationFrame(() => { raf = 0; place(); });
    };
    if (ready) place();
    const t = coarse ? setTimeout(() => { ready = true; place(); }, 500) : 0;
    const vv = window.visualViewport;
    window.addEventListener('scroll', schedule, true);
    window.addEventListener('resize', schedule);
    if (vv) { vv.addEventListener('resize', schedule); vv.addEventListener('scroll', schedule); }
    return () => {
      clearTimeout(t);
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener('scroll', schedule, true);
      window.removeEventListener('resize', schedule);
      if (vv) { vv.removeEventListener('resize', schedule); vv.removeEventListener('scroll', schedule); }
    };
  }, [openK, vals]);
  const [reqOpen, setReqOpen] = useState(false);
  usePanelBackClose(reqOpen, () => setReqOpen(false));

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
          <div ref={(el) => { anchorRefs.current[k] = el; }} style={{ flex: 1, minWidth: 90, position: 'relative' }}>
            <input
              value={draft[k] || ''}
              placeholder={chips.length ? '+ add…' : 'select…'}
              autoComplete="off"
              onFocus={(ev) => {
                if (isTouch) {
                  // Hand the keyboard to the sheet's own search box (same tap, so iOS allows it).
                  ev.currentTarget.blur();
                  flushSync(() => { setOpenK(k); setHi(0); });
                  if (sheetInputRef.current) sheetInputRef.current.focus();
                  return;
                }
                setOpenK(k); setHi(0);
              }}
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
            {!isTouch && openK === k && (
              <div onClick={() => { setOpenK(null); setDraft((s) => ({ ...s, [k]: '' })); }} style={{ position: 'fixed', inset: 0, zIndex: 60 }} />
            )}
            {!isTouch && openK === k && listPos && (
              <div
                style={{
                  position: 'fixed',
                  top: listPos.top,
                  bottom: listPos.bottom,
                  left: listPos.left,
                  minWidth: listPos.width,
                  maxHeight: listPos.maxHeight,
                  overflowY: 'auto',
                  overscrollBehavior: 'contain',
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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(180px,100%),1fr))', gap: 12 }}>
        {KINDS.map(field)}
      </div>
      {isTouch && openK && (() => {
        const k = openK;
        const lab = (KINDS.find((x) => x[0] === k) || [k, k])[1];
        const list = (opts && opts[k]) || [];
        const chips = vals[k] || [];
        const avail = list.filter((it) => !chips.includes(it.value));
        const q = (draft[k] || '').toLowerCase();
        const flt = avail.filter((it) => it.value.toLowerCase().includes(q));
        const close = () => { setOpenK(null); setDraft((st) => ({ ...st, [k]: '' })); };
        return createPortal(
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 3500, touchAction: 'none', background: o.bg || o.surface, display: 'flex', flexDirection: 'column', paddingTop: 8, paddingBottom: sheetBox.kb, boxSizing: 'border-box', overflow: 'hidden' }}>
            <div onTouchMove={(ev) => ev.preventDefault()} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderBottom: `1px solid ${o.border}`, flexShrink: 0 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: o.accent, textTransform: 'uppercase', letterSpacing: 0.8, whiteSpace: 'nowrap' }}>{lab}</div>
              <input
                ref={sheetInputRef}
                value={draft[k] || ''}
                placeholder="search…"
                autoComplete="off"
                autoCapitalize="off"
                onChange={(ev) => setDraft((st) => ({ ...st, [k]: ev.target.value }))}
                onKeyDown={(ev) => {
                  if (ev.key === 'Enter') {
                    ev.preventDefault();
                    const pick = flt[0];
                    if (pick) { add(k, pick.value); close(); }
                  }
                }}
                style={{ flex: 1, minWidth: 0, background: o.surface2 || o.surface, border: `1px solid ${o.border}`, borderRadius: 6, color: o.text, fontFamily: 'monospace', padding: '7px 8px', outline: 'none' }}
              />
              <button type="button" onClick={close} style={{ background: 'none', border: `1px solid ${o.border}`, color: o.accent, borderRadius: 6, padding: '7px 12px', fontFamily: 'monospace', fontWeight: 700, cursor: 'pointer' }}>Done</button>
            </div>
            <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', overscrollBehavior: 'contain', padding: 6, WebkitOverflowScrolling: 'touch', touchAction: 'pan-y' }}>
              {flt.length ? flt.map((it) => (
                <div
                  key={it.id}
                  onClick={() => { add(k, it.value); close(); }}
                  style={{ padding: '11px 12px', fontSize: 15, fontFamily: 'monospace', color: o.text, borderRadius: 6, borderBottom: `1px solid ${o.border}33`, cursor: 'pointer' }}
                >
                  {it.value}
                </div>
              )) : (
                <div style={{ padding: '12px', fontSize: 13, color: o.dim, fontFamily: 'monospace' }}>{avail.length ? 'No matches' : 'No more options'}</div>
              )}
            </div>
          </div>,
          document.body
        );
      })()}
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
