// frontend/src/components/FlickerSection.jsx
//
// Near the bottom of a report: every flicker reading attached to it, compared (numbers, overlaid waveforms,
// risk chart). Click a reading's title for its own page. The report's owner can attach more of their
// not-yet-attached readings from here.

import { useEffect, useState, useCallback } from 'react';
import { api } from '../lib/api';
import { fmtHz, fmtPct, fmtWhen, readingTitle } from '../lib/flicker';
import { FlickerComparison, RiskBadge } from './FlickerCharts';
import FlickerDetail from './FlickerDetail';

function shareTokenFromUrl() {
  try { const sp = new URLSearchParams(window.location.search); return sp.get('share') || sp.get('t') || ''; } catch { return ''; }
}

function AttachFlicker({ T, reportId, onDone, onCancel, btn }) {
  const [rows, setRows] = useState(null);
  const [err, setErr] = useState('');
  useEffect(() => {
    api.get('/flicker?unattached=1').then((d) => setRows(d.readings || [])).catch((e) => setErr(e.message));
  }, []);
  const pick = async (id) => {
    try { await api.patch(`/flicker/${id}`, { reportId }); onDone(); } catch (e) { setErr(e.message); }
  };
  return (
    <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8, padding: 12, margin: '8px 0 14px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 700 }}>Attach a flicker reading to this report</span>
        <button onClick={onCancel} style={btn('dim')}>Cancel</button>
      </div>
      {err && <div style={{ color: T.bad, fontSize: 12 }}>{err}</div>}
      {rows == null && !err && <div style={{ color: T.dim, fontSize: 13 }}>Loading…</div>}
      {rows && !rows.length && <div style={{ color: T.dim, fontSize: 13 }}>You have no unattached flicker readings. Upload one from the hCRI Companion app first.</div>}
      <div style={{ maxHeight: 280, overflowY: 'auto' }}>
        {(rows || []).map((r) => (
          <div key={r.id} role="button" tabIndex={0} onClick={() => pick(r.id)} onKeyDown={(e) => { if (e.key === 'Enter') pick(r.id); }}
            style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 6px', borderBottom: `1px solid ${T.border}`, cursor: 'pointer' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{readingTitle(r)}</div>
              <div style={{ fontSize: 11.5, color: T.dim }}>{fmtHz(r.frequencyHz)} · {fmtPct(r.percentFlicker)} · {fmtWhen(r.capturedAt || r.createdAt)}</div>
            </div>
            <RiskBadge r={r} T={T} small />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function FlickerSection({ report, T, canEdit = false, pad = '0 22px 32px' }) {
  const [rows, setRows] = useState(null);
  const [open, setOpen] = useState(null);   // id of the reading shown in the overlay
  const [attaching, setAttaching] = useState(false);
  const rid = report && report.id;

  const load = useCallback(() => {
    if (!rid) return Promise.resolve();
    const t = shareTokenFromUrl();
    return api.get(`/reports/${rid}/flicker` + (t ? `?t=${encodeURIComponent(t)}` : ''))
      .then((d) => setRows(d.readings || []))
      .catch(() => setRows([]));
  }, [rid]);
  useEffect(() => { load(); }, [load]);

  const btn = (color = 'accent') => ({
    background: `${T[color] || T.accent}20`, border: `1.5px solid ${T[color] || T.accent}`, color: T[color] || T.accent,
    borderRadius: 6, padding: '5px 12px', fontSize: 12, cursor: 'pointer', fontFamily: 'monospace', fontWeight: 700,
  });

  if (rows == null) return null;
  if (!rows.length && !canEdit) return null;

  return (
    <div style={{ padding: pad, fontFamily: 'monospace', color: T.text }} data-testid="flicker-section">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', borderTop: `1px solid ${T.border}`, paddingTop: 18, marginBottom: 10 }}>
        <span style={{ fontSize: 12, color: T.dim, fontWeight: 700, letterSpacing: 0.5, flex: 1 }}>
          FLICKER{rows.length ? <span style={{ fontWeight: 400 }}> · {rows.length} reading{rows.length > 1 ? 's' : ''}</span> : null}
        </span>
        {canEdit && !attaching && <button onClick={() => setAttaching(true)} style={btn()}>＋ Attach flicker</button>}
      </div>
      {attaching && <AttachFlicker T={T} reportId={rid} btn={btn} onCancel={() => setAttaching(false)} onDone={() => { setAttaching(false); load(); }} />}
      {rows.length > 0
        ? <FlickerComparison readings={rows} T={T} onOpen={(r) => setOpen(r.id)} />
        : !attaching && <div style={{ color: T.dim, fontSize: 13 }}>No flicker readings on this report yet.</div>}
      {open != null && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: T.bg, overflowY: 'auto' }} role="dialog" aria-label="Flicker reading">
          <FlickerDetail key={open} id={open} T={T} canEdit={canEdit} shareToken={shareTokenFromUrl()}
            onBack={() => { setOpen(null); load(); }} onChanged={load} onDeleted={() => { setOpen(null); load(); }} />
        </div>
      )}
    </div>
  );
}
