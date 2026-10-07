// frontend/src/components/FlickerDetail.jsx
//
// The page for one flicker reading on its own: title + notes (click to edit), the numbers, the waveform
// (stock-app scale), where it sits on the risk chart, and which report it belongs to (attach / detach / delete).

import { useEffect, useState, useCallback } from 'react';
import { api } from '../lib/api';
import {
  fmtHz, fmtPct, fmtMs, fmtNum, fmtWhen, readingTitle, flickerRisk, riskColor, RISK_LABEL, dutyEstimate, flickerColor, spanUsable,
} from '../lib/flicker';
import { FlickerWaveChart, FlickerRiskChart, RiskBadge } from './FlickerCharts';

export function Tile({ T, label, value, sub, color }) {
  return (
    <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8, padding: '10px 12px', minWidth: 0 }}>
      <div style={{ fontSize: 11, color: T.dim, fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 800, color: color || T.text, marginTop: 2, wordBreak: 'break-word' }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: T.dim, marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function AttachPicker({ T, btn, reading, onDone, onCancel }) {
  const [reports, setReports] = useState(null);
  const [q, setQ] = useState('');
  const [err, setErr] = useState('');
  useEffect(() => {
    api.get('/reports').then((d) => setReports(Array.isArray(d) ? d : d.reports || [])).catch((e) => setErr(e.message));
  }, []);
  const shown = (reports || []).filter((r) => !q || (r.label || '').toLowerCase().includes(q.toLowerCase())).slice(0, 60);
  const pick = async (rid) => {
    try { await api.patch(`/flicker/${reading.id}`, { reportId: rid }); onDone(); } catch (e) { setErr(e.message); }
  };
  return (
    <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8, padding: 12, marginTop: 10 }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search your reports…" autoFocus
          style={{ flex: 1, minWidth: 0, background: T.bg, color: T.text, border: `1px solid ${T.border}`, borderRadius: 6, padding: '7px 10px', fontFamily: 'monospace', fontSize: 13 }} />
        <button onClick={onCancel} style={btn('dim')}>Cancel</button>
      </div>
      {err && <div style={{ color: T.bad, fontSize: 12, marginBottom: 6 }}>{err}</div>}
      {reports == null && !err && <div style={{ color: T.dim, fontSize: 13 }}>Loading…</div>}
      <div style={{ maxHeight: 260, overflowY: 'auto' }}>
        {shown.map((r) => (
          <div key={r.id} onClick={() => pick(r.id)} role="button" tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter') pick(r.id); }}
            style={{ padding: '8px 6px', borderBottom: `1px solid ${T.border}`, cursor: 'pointer', fontSize: 13, display: 'flex', justifyContent: 'space-between', gap: 10 }}>
            <span style={{ fontWeight: 700, color: T.text, overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.label || 'Untitled'}</span>
            <span style={{ color: T.dim, flexShrink: 0 }}>{r.cct ? Math.round(r.cct) + ' K' : ''}</span>
          </div>
        ))}
        {reports && !shown.length && <div style={{ color: T.dim, fontSize: 13, padding: 6 }}>No matching reports.</div>}
      </div>
    </div>
  );
}

export default function FlickerDetail({ id, T, onBack, onChanged, onDeleted, onOpenReport, canEdit = true, shareToken }) {
  const [r, setR] = useState(null);
  const [err, setErr] = useState('');
  const [editTitle, setEditTitle] = useState(null);
  const [notes, setNotes] = useState(null);
  const [attaching, setAttaching] = useState(false);
  const [busy, setBusy] = useState(false);

  const btn = useCallback((color = 'accent') => ({
    background: `${T[color] || T.accent}20`, border: `1.5px solid ${T[color] || T.accent}`, color: T[color] || T.accent,
    borderRadius: 6, padding: '6px 14px', fontSize: 13, cursor: 'pointer', fontFamily: 'monospace', fontWeight: 700,
  }), [T]);

  const load = useCallback(() => {
    return api.get(`/flicker/${id}` + (shareToken ? `?t=${encodeURIComponent(shareToken)}` : ''))
      .then((d) => { setR(d); setErr(''); })
      .catch((e) => setErr(e.message));
  }, [id, shareToken]);
  useEffect(() => { load(); }, [load]);

  const save = async (patch) => {
    setBusy(true);
    try { await api.patch(`/flicker/${id}`, patch); await load(); onChanged && onChanged(); }
    catch (e) { setErr(e.message); }
    setBusy(false);
  };
  const del = async () => {
    if (!window.confirm('Delete this flicker reading? This can\'t be undone.')) return;
    setBusy(true);
    try { await api.del(`/flicker/${id}`); onDeleted ? onDeleted() : onBack && onBack(); } catch (e) { setErr(e.message); setBusy(false); }
  };

  if (err && !r) return <div style={{ padding: 24, color: T.bad, fontFamily: 'monospace' }}>{err}</div>;
  if (!r) return <div style={{ padding: 24, color: T.dim, fontFamily: 'monospace' }}>Loading…</div>;

  const risk = flickerRisk(r.frequencyHz, r.percentFlicker);
  const duty = dutyEstimate(r.waveform);
  const pts = [{ freq: r.frequencyHz, pct: r.percentFlicker, color: flickerColor(0), label: readingTitle(r) }];
  const inputStyle = { background: T.bg, color: T.text, border: `1px solid ${T.accent}`, borderRadius: 6, padding: '7px 10px', fontFamily: 'monospace', width: '100%', boxSizing: 'border-box' };

  return (
    <div style={{ maxWidth: 980, margin: '0 auto', padding: '16px 16px 40px', fontFamily: 'monospace', color: T.text }}>
      {onBack && <button onClick={onBack} style={{ ...btn('dim'), marginBottom: 14 }}>← Back</button>}

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 220 }}>
          {editTitle != null ? (
            <input autoFocus value={editTitle} style={{ ...inputStyle, fontSize: 18, fontWeight: 800 }}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={() => { const t = editTitle.trim(); setEditTitle(null); if (t && t !== r.label) save({ label: t }); }}
              onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); if (e.key === 'Escape') setEditTitle(null); }} />
          ) : (
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, cursor: canEdit ? 'text' : 'default', wordBreak: 'break-word' }}
              title={canEdit ? 'Click to rename' : undefined} onClick={() => canEdit && setEditTitle(r.label)}>
              {readingTitle(r)}{canEdit && <span style={{ color: T.dim, fontSize: 13, marginLeft: 8 }}>✎</span>}
            </h2>
          )}
          <div style={{ color: T.dim, fontSize: 12, marginTop: 4 }}>
            {fmtWhen(r.capturedAt || r.createdAt)}{r.model ? ` · ${r.model}` : ''}
          </div>
        </div>
        <RiskBadge r={r} T={T} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(130px,1fr))', gap: 10, margin: '16px 0' }}>
        <Tile T={T} label="Frequency" value={fmtHz(r.frequencyHz)} />
        <Tile T={T} label="Flicker" value={fmtPct(r.percentFlicker)} color={risk ? riskColor(T, risk) : undefined} sub={risk ? RISK_LABEL[risk] : undefined} />
        <Tile T={T} label="Flicker index" value={r.flickerIndex == null ? '—' : fmtNum(r.flickerIndex, 3)} />
        <Tile T={T} label="Cycle" value={fmtMs(r.cycleMs)} />
        <Tile T={T} label="Duty ≈" value={duty == null ? '—' : Math.round(duty) + ' %'} sub="estimated from the waveform" />
        {spanUsable(r) && <Tile T={T} label="Recording" value={fmtMs(r.spanMs)} sub={`${r.waveform.length} samples`} />}
      </div>

      <div style={{ fontSize: 12, color: T.dim, fontWeight: 700, margin: '4px 0 8px' }}>WAVEFORM</div>
      <FlickerWaveChart r={r} T={T} />

      <div style={{ fontSize: 12, color: T.dim, fontWeight: 700, margin: '20px 0 8px' }}>RISK</div>
      <FlickerRiskChart points={pts} T={T} />
      <div style={{ fontSize: 11.5, color: T.dim, marginTop: 6 }}>Bands follow IEEE 1789-style limits. Indicative only: these readings aren't from a certified flicker meter.</div>

      <div style={{ fontSize: 12, color: T.dim, fontWeight: 700, margin: '20px 0 8px' }}>NOTES</div>
      {canEdit ? (
        <textarea value={notes != null ? notes : r.notes} rows={3} placeholder="Add notes…" style={{ ...inputStyle, border: `1px solid ${T.border}`, resize: 'vertical' }}
          onChange={(e) => setNotes(e.target.value)}
          onBlur={() => { if (notes != null && notes !== r.notes) save({ notes }); setNotes(null); }} />
      ) : (
        <div style={{ whiteSpace: 'pre-wrap', fontSize: 13 }}>{r.notes || '—'}</div>
      )}

      <div style={{ fontSize: 12, color: T.dim, fontWeight: 700, margin: '20px 0 8px' }}>REPORT</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        {r.reportId ? (
          <>
            <span style={{ fontSize: 13 }}>Attached to <b>{r.reportLabel || `report #${r.reportId}`}</b></span>
            {onOpenReport && <button onClick={() => onOpenReport(r.reportId)} style={btn()}>Open report</button>}
            {canEdit && <button disabled={busy} onClick={() => save({ reportId: null })} style={btn('dim')}>Detach</button>}
            {canEdit && <button disabled={busy} onClick={() => setAttaching(true)} style={btn('dim')}>Move…</button>}
          </>
        ) : (
          <>
            <span style={{ fontSize: 13, color: T.dim }}>Not attached to a report.</span>
            {canEdit && <button onClick={() => setAttaching(true)} style={btn()}>Attach to a report…</button>}
          </>
        )}
      </div>
      {attaching && <AttachPicker T={T} btn={btn} reading={r} onCancel={() => setAttaching(false)} onDone={() => { setAttaching(false); load(); onChanged && onChanged(); }} />}

      {err && <div style={{ color: T.bad, fontSize: 12, marginTop: 12 }}>{err}</div>}
      {canEdit && <div style={{ marginTop: 28 }}><button disabled={busy} onClick={del} style={btn('bad')}>Delete reading</button></div>}
    </div>
  );
}
