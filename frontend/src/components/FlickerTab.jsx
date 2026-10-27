// frontend/src/components/FlickerTab.jsx
//
// Explore > Flicker: all of your uploaded flicker readings. Tick two or more and press Compare for the
// overlaid waveforms / risk chart / table; click a title for its own page. History: a reading's page is
// `?explore=flicker&fid=<id>`, so Back and refresh work like the rest of the app.

import { useEffect, useLayoutEffect, useRef, useState, useCallback } from 'react';
import { api } from '../lib/api';
import usePanelBackClose from '../hooks/usePanelBackClose';
import { fmtHz, fmtPct, fmtWhen, readingTitle } from '../lib/flicker';
import { RiskBadge, FlickerComparison } from './FlickerCharts';
import FlickerDetail from './FlickerDetail';

const fidFromUrl = () => {
  try { const v = new URLSearchParams(window.location.search).get('fid'); return v ? parseInt(v, 10) || null : null; } catch { return null; }
};

export default function FlickerTab({ T, onOpenReport, isAdmin }) {
  const [users, setUsers] = useState([]);
  const [forUser, setForUser] = useState('');
  const [list, setList] = useState(null);
  const [err, setErr] = useState('');
  const [sel, setSel] = useState([]);
  const [filter, setFilter] = useState('all'); // all | attached | standalone
  const [fid, setFid] = useState(fidFromUrl);
  const [comparing, setComparing] = useState(false);
  const [cmpData, setCmpData] = useState(null);

  const load = useCallback(() => api.get('/flicker' + (forUser ? `?for_user=${forUser}` : '')).then((d) => { setList(d.readings || []); setErr(''); }).catch((e) => setErr(e.message)), [forUser]);
  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    if (!isAdmin) return;
    api.get('/admin/users').then((d) => setUsers(Array.isArray(d) ? d : d.users || [])).catch(() => {});
  }, [isAdmin]);

  // A reading's page and the comparison are "panels": the browser Back button closes them (same mechanism as the report
  // pages in Explore), so Back never reloads the screen, and the list keeps its scroll position underneath.
  const rootRef = useRef(null);
  const savedTop = useRef(0);
  const scroller = () => {
    let el = rootRef.current && rootRef.current.parentElement;
    while (el) { const o = getComputedStyle(el).overflowY; if (o === 'auto' || o === 'scroll') return el; el = el.parentElement; }
    return null;
  };
  const remember = () => { const sc = scroller(); savedTop.current = sc ? sc.scrollTop : 0; };
  const base = () => window.location.pathname + '?explore=flicker';
  usePanelBackClose(!!fid, () => setFid(null), () => ({
    state: { hcri: 1, view: 'explore', etab: 'flicker', fid }, url: `${base()}&fid=${fid}`,
    closedState: { hcri: 1, view: 'explore', etab: 'flicker' }, closedUrl: base(),
  }));
  usePanelBackClose(comparing, () => setComparing(false));
  useLayoutEffect(() => {
    const sc = scroller();
    if (!sc) return;
    sc.scrollTop = fid || comparing ? 0 : savedTop.current;
  }, [fid, comparing]);
  const open = (id) => { remember(); setFid(id); };
  const back = () => { setFid(null); setComparing(false); };

  const btn = (color = 'accent', off) => ({
    background: `${T[color] || T.accent}20`, border: `1.5px solid ${T[color] || T.accent}`, color: T[color] || T.accent,
    borderRadius: 6, padding: '6px 14px', fontSize: 13, cursor: off ? 'default' : 'pointer', fontFamily: 'monospace', fontWeight: 700, opacity: off ? 0.45 : 1,
  });

  const startCompare = async () => {
    remember();
    setComparing(true); setCmpData(null);
    try {
      const rows = await Promise.all(sel.map((id) => api.get(`/flicker/${id}`)));
      setCmpData(rows);
    } catch (e) { setErr(e.message); setComparing(false); }
  };

  if (fid) {
    return <div ref={rootRef}><FlickerDetail key={fid} id={fid} T={T} onBack={back} onChanged={load} onDeleted={() => { load(); back(); }} onOpenReport={onOpenReport} /></div>;
  }

  if (comparing) {
    return (
      <div ref={rootRef} style={{ maxWidth: 980, margin: '0 auto', padding: '16px 16px 40px', fontFamily: 'monospace', color: T.text }}>
        <button onClick={() => setComparing(false)} style={{ ...btn('dim'), marginBottom: 14 }}>← Back to flicker readings</button>
        <h2 style={{ margin: '0 0 14px', fontSize: 18 }}>Compare flicker <span style={{ color: T.dim, fontWeight: 400 }}>({sel.length})</span></h2>
        {!cmpData ? <div style={{ color: T.dim }}>Loading…</div> : <FlickerComparison readings={cmpData} T={T} onOpen={(r) => open(r.id)} />}
      </div>
    );
  }

  const shown = (list || []).filter((r) => filter === 'all' || (filter === 'attached' ? r.reportId : !r.reportId));
  const toggle = (id) => setSel((s) => (s.includes(id) ? s.filter((x) => x !== id) : s.length >= 12 ? s : [...s, id]));
  const pill = (id, label) => (
    <button key={id} onClick={() => setFilter(id)} style={{ background: filter === id ? `${T.accent}30` : 'none', border: `1px solid ${filter === id ? T.accent : T.border}`,
      color: filter === id ? T.accent : T.dim, borderRadius: 999, padding: '3px 12px', fontSize: 12, fontFamily: 'monospace', fontWeight: 700, cursor: 'pointer' }}>{label}</button>
  );

  return (
    <div ref={rootRef} style={{ maxWidth: 980, margin: '0 auto', padding: '16px 16px 90px', fontFamily: 'monospace', color: T.text }}>
      {isAdmin && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, fontSize: 13 }}>
          <span style={{ color: T.dim }}>Admin: working on</span>
          <select style={{ background: T.surface, border: `1px solid ${T.border}`, color: T.text, borderRadius: 6, padding: '6px 10px', fontSize: 13, fontFamily: 'monospace', maxWidth: 320 }} value={forUser}
            onChange={(e) => { setForUser(e.target.value); setList(null); setSel([]); }}>
            <option value="">My own readings</option>
            {users.map((u) => <option key={u.id} value={u.id}>{u.name || u.email} ({u.email})</option>)}
          </select>
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
        <h2 style={{ margin: 0, fontSize: 18, flex: 1 }}>Flicker readings</h2>
        {pill('all', 'All')}{pill('attached', 'On a report')}{pill('standalone', 'Standalone')}
      </div>
      {err && <div style={{ color: T.bad, fontSize: 13, marginBottom: 10 }}>{err}</div>}
      {list == null && !err && <div style={{ color: T.dim }}>Loading…</div>}
      {list && !list.length && (
        <div style={{ color: T.dim, fontSize: 14, lineHeight: 1.6, padding: '30px 0' }}>
          No flicker readings yet. Take one with the hCRI Companion app on a flicker-capable meter and upload it; it will show up here.
        </div>
      )}
      {shown.map((r) => {
        const on = sel.includes(r.id);
        return (
          <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', marginBottom: 8, background: T.surface,
            border: `1px solid ${on ? T.accent : T.border}`, borderRadius: 8 }}>
            <input type="checkbox" checked={on} onChange={() => toggle(r.id)} title="Select to compare" style={{ width: 18, height: 18, flexShrink: 0, accentColor: T.accent }} />
            <div style={{ flex: 1, minWidth: 0, cursor: 'pointer' }} onClick={() => open(r.id)}>
              <div style={{ fontWeight: 800, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{readingTitle(r)}</div>
              <div style={{ fontSize: 12, color: T.dim, marginTop: 3 }}>
                {fmtHz(r.frequencyHz)} · {fmtPct(r.percentFlicker)} · {fmtWhen(r.capturedAt || r.createdAt)}
                {r.reportId ? ` · on “${r.reportLabel || 'report #' + r.reportId}”` : ''}
              </div>
            </div>
            <RiskBadge r={r} T={T} small />
          </div>
        );
      })}
      {sel.length > 0 && (
        <div style={{ position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 20, display: 'flex', justifyContent: 'center', gap: 10, alignItems: 'center',
          padding: '10px 14px calc(10px + env(safe-area-inset-bottom))', background: T.surface2, borderTop: `1px solid ${T.border}` }}>
          <span style={{ fontSize: 13, color: T.dim }}>{sel.length} selected</span>
          <button style={btn('dim')} onClick={() => setSel([])}>Clear</button>
          <button style={btn('accent', sel.length < 2)} disabled={sel.length < 2} onClick={startCompare}>Compare →</button>
        </div>
      )}
    </div>
  );
}
