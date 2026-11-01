// frontend/src/components/LiveStation.jsx
//
// Live station: the run that is going on now (TKLamp), seen from anywhere.
//   <LiveView T token />       public page for a ?live=<token> link; polls api/live_shared and draws the run as it grows.
//   <LiveStationPanel T />     the owner's switch, link and email alerts (Runtime tab).
// Backend: api/live_shared.php (public), api/v1_live.php (owner, served at /api/live for the website).

import { useEffect, useRef, useState, useCallback } from 'react';
import { api } from '../lib/api';
import { RuntimeChart } from './RuntimeTab';

const POLL_MS = 5000;

function fmtDur(s) {
  s = Math.max(0, Math.round(s));
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), x = s % 60;
  return h > 0 ? `${h} h ${String(m).padStart(2, '0')} min` : m > 0 ? `${m} min ${String(x).padStart(2, '0')} s` : `${x} s`;
}
function fmtAgo(s) {
  if (s == null) return '';
  if (s < 10) return 'just now';
  if (s < 90) return `${Math.round(s)} s ago`;
  if (s < 5400) return `${Math.round(s / 60)} min ago`;
  return `${(s / 3600).toFixed(1)} h ago`;
}
const num = (v) => (v == null ? '–' : Math.abs(v) >= 100 ? String(Math.round(v)) : v.toFixed(1));

/** Polls a station and keeps its readings. */
function useLiveRun(token, pollMs = POLL_MS) {
  const [state, setState] = useState({ loading: true, err: '', live: true, run: null, values: [], info: null });
  const vals = useRef([]);
  const whole = useRef(false);   // true while the server sends every reading (not averaged down), so only new ones need fetching
  const [now, setNow] = useState(() => Date.now());

  const load = useCallback(async () => {
    try {
      const since = whole.current ? vals.current.length : -1;
      const r = await fetch(`./index.php/api/live_shared?t=${encodeURIComponent(token)}${since >= 0 ? `&since=${since}` : ''}`);
      const d = await r.json();
      if (!r.ok) { setState((s) => ({ ...s, loading: false, err: d.error || 'Could not load this live link.' })); return; }
      if (d.run) {
        if (d.from === 0 || d.from !== vals.current.length) vals.current = d.values || [];
        else vals.current = vals.current.concat(d.values || []);
        whole.current = d.run.points === vals.current.length;
      } else vals.current = [];
      setState({ loading: false, err: '', live: d.live, run: d.run, values: vals.current, info: d.info || null, got: Date.now() });
    } catch {
      setState((s) => ({ ...s, loading: false, err: 'Could not reach hCRI.io. Trying again…' }));
    }
  }, [token]);

  useEffect(() => {
    vals.current = []; whole.current = false;
    load();
    const id = setInterval(() => { if (!document.hidden) load(); }, pollMs);
    const tick = setInterval(() => setNow(Date.now()), 1000);
    const vis = () => { if (!document.hidden) load(); };
    document.addEventListener('visibilitychange', vis);
    return () => { clearInterval(id); clearInterval(tick); document.removeEventListener('visibilitychange', vis); };
  }, [load, pollMs]);
  return { ...state, now };
}

export function LiveView({ T, token, embedded = false }) {
  const { loading, err, live, run, values, got, now, info } = useLiveRun(token);
  const wrap = embedded ? { fontFamily: 'monospace', color: T.text } : { maxWidth: 980, margin: '0 auto', padding: '16px 16px 60px', fontFamily: 'monospace', color: T.text };
  if (loading) return <div style={wrap}><p style={{ color: T.dim }}>Loading…</p></div>;
  if (!run && err) return <div style={wrap}><p style={{ color: T.bad }}>{err}</p></div>;
  if (!live) return <div style={wrap}><p style={{ color: T.dim }}>This live station is switched off by its owner.</p></div>;
  if (!run || run.status === 'idle' || !run.runId) return <div style={wrap}><h2 style={{ margin: '0 0 6px', fontSize: 18 }}>Live station</h2><p style={{ color: T.dim }}>Nothing is live right now. This page updates by itself when a tester starts sending.</p></div>;

  const behind = got ? Math.max(0, (now - got) / 1000) : 0;
  const age = run.ageSeconds == null ? null : run.ageSeconds + behind;
  const isRun = run.kind !== 'monitor';
  let chip, color;
  if (run.status === 'finished') { chip = isRun ? 'Finished' : 'Stopped'; color = T.dim; }
  else if (run.status === 'error') { chip = 'Problem'; color = T.bad; }
  else if (run.stale) { chip = `No data for ${fmtDur(age || 0)}`; color = T.warn || '#f0a020'; }
  else { chip = isRun ? 'Live run' : 'Live'; color = isRun ? (T.accent || '#4aa3ff') : (T.good || '#3dd68c'); }
  const last = values.length ? values[values.length - 1] : run.last;
  const interval = run.intervalSeconds || 1;
  const elapsed = run.status === 'running' && run.startedAt && !run.stale
    ? (now - new Date(run.startedAt).getTime()) / 1000
    : values.length * interval;
  const curve = { id: 'live', label: (info && info.title) || (isRun ? (run.label || 'Run') : 'Live reading'), values, intervalSeconds: interval, unit: run.unit || 'lm' };
  return (
    <div style={wrap}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
        <h2 style={{ margin: 0, fontSize: 18, flex: 1 }}>{(info && info.title) || (isRun ? (run.label || 'TKLamp run') : 'Live reading')}</h2>
        <span style={{ border: `1.5px solid ${color}`, color, borderRadius: 14, padding: '3px 12px', fontSize: 13, fontWeight: 800 }}>
          {run.status === 'running' && !run.stale && <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 4, background: color, marginRight: 7 }} />}{chip}
        </span>
      </div>
      {info && info.details && <div style={{ color: T.text, fontSize: 14, lineHeight: 1.5, whiteSpace: 'pre-wrap', margin: '4px 0 8px' }}>{info.details}</div>}
      {run.status === 'error' && run.message && <div style={{ color: T.bad, marginBottom: 8 }}>{run.message}</div>}
      <div style={{ display: 'flex', gap: 22, flexWrap: 'wrap', alignItems: 'baseline', margin: '8px 0 12px' }}>
        <div><span style={{ fontSize: 38, fontWeight: 900 }}>{num(last)}</span> <span style={{ color: T.dim }}>{run.unit || 'lm'}</span></div>
        {isRun && <div style={{ color: T.dim, fontSize: 13 }}>Running for {fmtDur(elapsed)}</div>}
        <div style={{ color: T.dim, fontSize: 13 }}>Last reading {fmtAgo(age)}</div>
      </div>
      <RuntimeChart curves={[curve]} T={T} mode="abs" />
      {!embedded && <p style={{ color: T.dim, fontSize: 12, marginTop: 18 }}>Shared live from hCRI.io by its owner. This page refreshes every few seconds.</p>}
    </div>
  );
}

export function LiveStationPanel({ T }) {
  const [st, setSt] = useState(null);
  const [open, setOpen] = useState(false);
  const [err, setErr] = useState('');
  const [copied, setCopied] = useState(false);
  const [noteSaved, setNoteSaved] = useState(false);
  const titleRef = useRef(null);
  const detailsRef = useRef(null);
  const load = useCallback(() => api.get('/live').then((d) => { setSt(d); setErr(''); }).catch((e) => setErr(e.message)), []);
  useEffect(() => { load(); }, [load]);
  // A note saved elsewhere (web logger, app, script) shows up here within seconds, unless the boxes are being edited.
  useEffect(() => {
    const id = setInterval(() => {
      if (document.hidden) return;
      const t = titleRef.current, d = detailsRef.current;
      if (t && d && (t === document.activeElement || d === document.activeElement || t.value !== t.defaultValue || d.value !== d.defaultValue)) return;
      load();
    }, 5000);
    return () => clearInterval(id);
  }, [load]);
  const act = (body) => api.post('/live', body).then((d) => { setSt(d); setErr(''); }).catch((e) => setErr(e.message));
  const setting = (k, v) => act({ action: 'settings', settings: { [k]: v } });
  const run = st && st.run;
  const status = !st ? '' : !st.enabled ? 'Off' : !run || run.status === 'idle' ? 'On, nothing running' : run.status === 'running' ? (run.stale ? 'No data' : run.kind === 'monitor' ? 'Live reading' : 'Live run') : run.status === 'finished' ? (run.kind === 'monitor' ? 'Tester stopped' : 'Last run finished') : 'Problem';
  const btn = (c = 'accent') => ({ background: `${T[c]}20`, border: `1.5px solid ${T[c]}`, color: T[c], borderRadius: 6, padding: '6px 14px', fontSize: 13, cursor: 'pointer', fontFamily: 'monospace', fontWeight: 700 });
  const input = { background: T.surface, border: `1px solid ${T.border}`, color: T.text, borderRadius: 6, padding: '6px 10px', fontSize: 13, fontFamily: 'monospace' };
  const chk = (k, label) => (
    <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 13, cursor: 'pointer' }}>
      <input type="checkbox" checked={!!st.settings[k]} onChange={(e) => setting(k, e.target.checked)} /> {label}
    </label>
  );
  return (
    <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8, marginBottom: 14, fontFamily: 'monospace' }}>
      <div onClick={() => setOpen((v) => !v)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', cursor: 'pointer' }}>
        <span style={{ fontWeight: 800, flex: 1 }}>Live station <span style={{ color: T.dim, fontWeight: 400, fontSize: 12 }}>watch a TKLamp run from anywhere</span></span>
        <span style={{ color: st && st.enabled ? T.accent : T.dim, fontSize: 12, fontWeight: 700 }}>{status}</span>
        <span style={{ color: T.dim }}>{open ? '▾' : '▸'}</span>
      </div>
      {open && st && (
        <div style={{ padding: '4px 12px 14px', borderTop: `1px solid ${T.border}` }}>
          {err && <p style={{ color: T.bad }}>{err}</p>}
          <p style={{ color: T.dim, fontSize: 12, lineHeight: 1.6 }}>Turn this on and the Companion app sends every TKLamp run here as it records. The link below always shows what is running now (or the last run). Anyone with the link can watch; nobody needs an account.</p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
            {st.enabled ? <button style={btn('dim')} onClick={() => act({ action: 'disable' })}>Turn off</button> : <button style={btn('accent')} onClick={() => act({ action: 'enable' })}>Turn on</button>}
            {st.token && <button style={btn('dim')} onClick={() => { if (window.confirm('Make a new link? The old link will stop working.')) act({ action: 'rotate' }); }}>New link</button>}
          </div>
          {st.enabled && st.url && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginBottom: 12 }}>
              <input readOnly style={{ ...input, flex: 1, minWidth: 220 }} value={st.url} onFocus={(e) => e.target.select()} />
              <button style={btn('accent')} onClick={() => { try { navigator.clipboard.writeText(st.url); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { /* copy by hand */ } }}>{copied ? 'Copied' : 'Copy'}</button>
              <a style={{ ...btn('accent'), textDecoration: 'none' }} href={st.url} target="_blank" rel="noreferrer">Open</a>
            </div>
          )}
          {st.enabled && (() => {
            const online = run && run.status === 'running' && !run.stale && (run.ageSeconds == null || run.ageSeconds < 30);
            const running = online && run.kind === 'run';
            const pending = st.command ? ({ start: 'Start', stop: 'Stop', clear: 'Clear' })[st.command.action] : '';
            const send = (c) => act({ action: 'command', command: c });
            return (
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 12, color: T.dim, fontWeight: 800, textTransform: 'uppercase', margin: '4px 0 8px' }}>Control the run</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                  <button style={{ ...btn('accent'), opacity: online && !running && !pending ? 1 : 0.4 }} disabled={!online || running || !!pending} onClick={() => send('start')}>Start run</button>
                  <button style={{ ...btn('bad'), opacity: running && !pending ? 1 : 0.4 }} disabled={!running || !!pending} onClick={() => send('stop')}>Stop run</button>
                  <button style={{ ...btn('dim'), opacity: !running && !pending ? 1 : 0.4 }} disabled={running || !!pending} onClick={() => send('clear')}>Clear</button>
                  <span style={{ color: T.dim, fontSize: 12 }}>
                    {pending ? `${pending} sent: waiting for the logger or app (up to 5 seconds)…` : online ? 'Carried out by the web logger or the app that is connected to the tester.' : 'Needs the web logger or the app connected to the tester, with Live on.'}
                  </span>
                </div>
              </div>
            );
          })()}
          {st.enabled && (
            <>
              <div style={{ fontSize: 12, color: T.dim, fontWeight: 800, textTransform: 'uppercase', margin: '4px 0 8px' }}>What you are testing (shown on the live page)</div>
              <input ref={titleRef} style={{ ...input, width: '100%', boxSizing: 'border-box', marginBottom: 8 }} maxLength={160} placeholder="Name, e.g. Olight Warrior 3, turbo" defaultValue={st.info.title} key={'t' + st.info.title} onChange={() => setNoteSaved(false)} />
              <textarea ref={detailsRef} style={{ ...input, width: '100%', boxSizing: 'border-box', minHeight: 64, marginBottom: 8 }} maxLength={2000} placeholder="Details: cell, driver mode, notes… (shows on the live page within seconds of saving)" defaultValue={st.info.details} key={'d' + st.info.details} onChange={() => setNoteSaved(false)} />
              <div style={{ marginBottom: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
                <button style={btn('accent')} onClick={() => act({ action: 'info', title: titleRef.current.value.trim(), details: detailsRef.current.value.trim() }).then(() => setNoteSaved(true))}>Save</button>
                <button style={btn('dim')} onClick={() => act({ action: 'info', title: '', details: '' }).then(() => setNoteSaved(false))}>Clear</button>
                {noteSaved && <span style={{ color: T.good || T.accent, fontSize: 13 }}>Saved</span>}
              </div>
            </>
          )}
          <div style={{ fontSize: 12, color: T.dim, fontWeight: 800, textTransform: 'uppercase', margin: '4px 0 8px' }}>Email me when</div>
          <div style={{ display: 'grid', gap: 8, marginBottom: 10 }}>
            {chk('emailDone', 'a run finishes')}
            {chk('emailError', 'there is a problem (the tester or bridge stops working)')}
            {chk('emailStale', 'no data arrives for a while')}
            {chk('emailLow', 'the output falls below a limit')}
          </div>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', fontSize: 13, alignItems: 'center' }}>
            <label>No data for <input type="number" min="2" max="240" style={{ ...input, width: 70 }} defaultValue={st.settings.staleMin} key={'s' + st.settings.staleMin} onBlur={(e) => setting('staleMin', Number(e.target.value) || 5)} /> minutes</label>
            <label>Output limit <input type="number" min="0" style={{ ...input, width: 90 }} defaultValue={st.settings.lowLm || ''} key={'l' + st.settings.lowLm} placeholder="lm" onBlur={(e) => setting('lowLm', Number(e.target.value) || 0)} /> lm</label>
          </div>
          <p style={{ color: T.dim, fontSize: 12 }}>Emails go to your account address, at most one of each kind per run.</p>
          {st.enabled && st.token && <div style={{ marginTop: 10 }}><LiveView T={T} token={st.token} embedded /></div>}
        </div>
      )}
    </div>
  );
}
