// frontend/src/components/LedGroupsEditor.jsx
//
// A report's LEDs. Each LED is its own card with a brand, an LED (the model) and a CCT, so a light with two
// different LEDs keeps each one's values together. Owners edit (changes save as they are made, via
// POST /api/categories/leds); everyone else sees a read-only summary.
//
// The LED list for a chosen brand shows the models already seen with that brand first (the "suggested pairings"
// from GET /api/v1/led_lists -> modelsByBrand), then every other LED. They are suggestions only: any LED can be
// picked with any brand.

import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { useTheme } from '../lib/ThemeContext.jsx';

const blank = () => ({ brand: '', led: '', cct: '' });

/** The report's LEDs as editable rows (falls back to the flat category values if the server has no groups yet). */
export function ledsFromReport(report) {
  if (report && Array.isArray(report.leds) && report.leds.length) {
    return report.leds.map((l) => ({ brand: l.brand || '', led: l.led || l.model || '', cct: l.cct || '' }));
  }
  const cv = (k) => ((report && report.categories && report.categories[k]) || []).map((c) => c && c.value).filter(Boolean);
  const b = cv('led_brand'), m = cv('led_model'), c = cv('led_cct');
  const n = Math.max(b.length, m.length, c.length);
  return Array.from({ length: n }, (_, i) => ({ brand: b[i] || '', led: m[i] || '', cct: c[i] || '' }));
}

/** "Nichia 519A · 3000K" */
export function ledText(l) {
  const name = [l.brand, l.led || l.model].filter(Boolean).join(' ');
  return name + (l.cct ? `${name ? ' · ' : ''}${l.cct}` : '');
}

export default function LedGroupsEditor({ report, isGuest, onSaved, saveFn }) {
  const { theme: o } = useTheme();
  const [leds, setLeds] = useState(() => { const l = ledsFromReport(report); return l.length ? l : [blank()]; });
  const [lists, setLists] = useState(null);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState('');

  useEffect(() => { const l = ledsFromReport(report); setLeds(l.length ? l : [blank()]); }, [report && report.id]);
  useEffect(() => {
    if (isGuest) return;
    api.get('/v1/led_lists').then(setLists).catch(() => {});
  }, [isGuest]);

  // ── Read-only ────────────────────────────────────────────────────────
  if (isGuest) {
    const rows = ledsFromReport(report).filter((l) => l.brand || l.led || l.cct);
    if (!rows.length) return null;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span style={{ fontSize: 10, color: o.dim, textTransform: 'uppercase', letterSpacing: 0.8, fontWeight: 700 }}>{rows.length > 1 ? 'LEDs' : 'LED'}</span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {rows.map((l, i) => (
            <span key={i} style={{ fontSize: 13, color: o.text, fontWeight: 600, background: o.surface2 || o.surface, border: `1px solid ${o.border}`, borderRadius: 12, padding: '2px 10px' }}>
              {ledText(l)}
            </span>
          ))}
        </div>
      </div>
    );
  }

  // ── Owner ────────────────────────────────────────────────────────────
  const persist = async (next) => {
    setBusy(true); setNote('');
    try {
      // saveFn lets another screen (the admin editor) save through its own endpoint; it returns { leds, requested }.
      const res = saveFn ? await saveFn(next) : await api.post('/categories/leds', { reportId: report.id, leds: next });
      const saved = (res && res.leds) || [];
      const rows = saved.map((l) => ({ brand: l.brand || '', led: l.led || l.model || '', cct: l.cct || '' }));
      // Keep the report object (and its flat category chips elsewhere on the page) in step.
      report.leds = saved;
      if (report.categories) {
        const uniq = (f) => [...new Set(saved.map((l) => l[f]).filter(Boolean))].map((value) => ({ value }));
        report.categories.led_brand = uniq('brand');
        report.categories.led_model = uniq('led');
        report.categories.led_cct = uniq('cct');
      }
      setLeds(rows.length ? rows : [blank()]);
      const rq = res && res.requested ? Object.values(res.requested).flat() : [];
      if (rq.length) setNote(`Not in the lists yet, sent for review: ${rq.join(', ')}`);
      if (onSaved) onSaved(saved);
    } catch (e) { setNote((e && e.message) || 'Could not save'); }
    setBusy(false);
  };

  const change = (i, f, v) => {
    const next = leds.map((l, j) => (j === i ? { ...l, [f]: v } : l));
    setLeds(next);
    persist(next.filter((l) => l.brand || l.led || l.cct));
  };
  const removeAt = (i) => {
    const next = leds.filter((_, j) => j !== i);
    setLeds(next.length ? next : [blank()]);
    persist(next.filter((l) => l.brand || l.led || l.cct));
  };
  const add = () => setLeds((s) => [...s, blank()]);

  const L = (lists && lists.lists) || {};
  const byBrand = (lists && lists.modelsByBrand) || {};
  const sel = { width: '100%', boxSizing: 'border-box', background: o.surface2 || o.surface, border: `1px solid ${busy ? o.accent : o.border}`, borderRadius: 6, padding: '7px 8px', color: o.text, fontSize: 13, fontFamily: 'monospace', outline: 'none' };
  const lab = { fontSize: 10, color: o.dim, textTransform: 'uppercase', letterSpacing: 0.8, fontWeight: 700, marginBottom: 4, display: 'block' };
  const opt = (list, cur) => (cur && !list.includes(cur) ? [cur, ...list] : list);

  const ledSelect = (l, i) => {
    const all = opt(L.led_model || [], l.led);
    const seen = (l.brand && byBrand[l.brand]) || [];
    if (!seen.length) {
      return (
        <select value={l.led} onChange={(e) => change(i, 'led', e.target.value)} style={sel}>
          <option value="">—</option>
          {all.map((v) => <option key={v} value={v}>{v}</option>)}
        </select>
      );
    }
    const rest = all.filter((v) => !seen.includes(v));
    return (
      <select value={l.led} onChange={(e) => change(i, 'led', e.target.value)} style={sel}>
        <option value="">—</option>
        <optgroup label={`Seen with ${l.brand}`}>{seen.map((v) => <option key={'s' + v} value={v}>{v}</option>)}</optgroup>
        <optgroup label="All LEDs">{rest.map((v) => <option key={v} value={v}>{v}</option>)}</optgroup>
      </select>
    );
  };

  const last = leds[leds.length - 1] || blank();
  return (
    <div style={{ gridColumn: '1/-1' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {leds.map((l, i) => (
          <div key={i} style={{ border: `1px solid ${o.border}`, borderRadius: 8, padding: 10, background: o.surface }}>
            {(leds.length > 1 || l.brand || l.led || l.cct) && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: o.accent, textTransform: 'uppercase', letterSpacing: 0.8 }}>{leds.length > 1 ? `LED ${i + 1}` : 'LED'}</span>
                <button type="button" onClick={() => removeAt(i)} disabled={busy} style={{ background: 'none', border: 'none', color: o.dim, cursor: 'pointer', fontSize: 12, fontFamily: 'monospace' }}>
                  {leds.length > 1 ? 'Remove' : 'Clear'}
                </button>
              </div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(150px,100%),1fr))', gap: 10 }}>
              <div>
                <label style={lab}>Brand</label>
                <select value={l.brand} onChange={(e) => change(i, 'brand', e.target.value)} style={sel}>
                  <option value="">—</option>
                  {opt(L.led_brand || [], l.brand).map((v) => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
              <div>
                <label style={lab}>LED</label>
                {ledSelect(l, i)}
              </div>
              <div>
                <label style={lab}>CCT</label>
                <select value={l.cct} onChange={(e) => change(i, 'cct', e.target.value)} style={sel}>
                  <option value="">—</option>
                  {opt(L.led_cct || [], l.cct).map((v) => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8, flexWrap: 'wrap' }}>
        <button type="button" onClick={add} disabled={busy || !(last.brand || last.led || last.cct) || leds.length >= 8}
          style={{ background: 'none', border: `1px solid ${o.border}`, color: o.accent, borderRadius: 6, padding: '6px 12px', fontFamily: 'monospace', fontWeight: 700, fontSize: 12, cursor: 'pointer', opacity: (busy || !(last.brand || last.led || last.cct)) ? 0.5 : 1 }}>
          + Add another LED
        </button>
        {note && <span style={{ fontSize: 12, color: o.dim }}>{note}</span>}
      </div>
    </div>
  );
}
