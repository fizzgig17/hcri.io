// frontend/src/components/AdminNotices.jsx
//
// Reconstructed from the deployed assets/app.js (minified function
// AdminNotices({theme:o})). Admin-only CRUD UI for the site-wide
// notices/banner system shown to everyone via Notices.jsx (noticeColor/
// NoticeBar/TopNotices/ReportNotices). A notice is { id, type, location,
// message, startsAt, endsAt, enabled }:
//   - type: 'news' (green) | 'important' (red) | 'issue' (yellow)
//   - location: 'top' | 'report' | 'both'
// Backend: api/admin.php --
//   GET    /api/admin/notices
//   POST   /api/admin/notices
//   PATCH  /api/admin/notices/:id
//   DELETE /api/admin/notices/:id

import { createPortal } from 'react-dom';
import { useState, useEffect } from 'react';
import { basePath, getToken } from '../lib/api';
import usePanelBackClose from '../hooks/usePanelBackClose';
import { useIsMobile } from '../hooks/useIsMobile';
import { NoticeBar, NoticeIcon, NOTICE_TYPES, NOTICE_ICON_IDS, noticeColor, noticeIconName } from './Notices.jsx';


export default function AdminNotices({ theme: o }) {
  const [open, setOpen] = useState(false);
  usePanelBackClose(open, () => setOpen(false));
  const isMobile = useIsMobile(768);
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [saving, setSaving] = useState(false);
  const [eid, setEid] = useState(null);
  const [ntype, setType] = useState('news');
  const [nloc, setLoc] = useState('top');
  const [nmsg, setMsg] = useState('');
  const [nstart, setStart] = useState('');
  const [nend, setEnd] = useState('');
  const [ndur, setDur] = useState('');
  const [nunit, setUnit] = useState('days');
  const [nen, setEn] = useState(true);
  const [nicon, setIcon] = useState('');
  const [ndis, setDis] = useState(true);

  const auth = () => ({ Authorization: `Bearer ${getToken()}` });

  const load = () => {
    setLoading(true);
    setErr('');
    fetch(`${basePath()}index.php/api/admin/notices`, { headers: auth() })
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d)) setList(d);
        else setErr((d && d.error) || 'Failed to load');
        setLoading(false);
      })
      .catch(() => {
        setErr('Failed to load notices');
        setLoading(false);
      });
  };

  useEffect(() => {
    if (open) load();
  }, [open]);

  const pad = (n) => String(n).padStart(2, '0');
  const toLocal = (d) =>
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  // hours = v*36e5ms, weeks = v*6048e5ms (7 days), days = v*864e5ms
  const computeEnd = (start, dur, unit) => {
    const v = Number(dur);
    if (!start || !v || v <= 0) return '';
    const d = new Date(start);
    if (isNaN(d.getTime())) return '';
    const ms = unit === 'hours' ? v * 36e5 : unit === 'weeks' ? v * 6048e5 : v * 864e5;
    return toLocal(new Date(d.getTime() + ms));
  };

  const onStart = (v) => {
    setStart(v);
    if (ndur) setEnd(computeEnd(v, ndur, nunit));
  };
  const onDur = (v) => {
    setDur(v);
    setEnd(computeEnd(nstart, v, nunit));
  };
  const onUnit = (v) => {
    setUnit(v);
    if (ndur) setEnd(computeEnd(nstart, ndur, v));
  };
  const reset = () => {
    setEid(null);
    setType('news');
    setLoc('top');
    setMsg('');
    setStart('');
    setEnd('');
    setDur('');
    setUnit('days');
    setEn(true);
    setIcon('');
    setDis(true);
    setErr('');
  };
  const edit = (no) => {
    setEid(no.id);
    setType(no.type);
    setLoc(no.location);
    setMsg(no.message);
    setStart((no.startsAt || '').replace(' ', 'T').slice(0, 16));
    setEnd((no.endsAt || '').startsWith('2099') ? '' : (no.endsAt || '').replace(' ', 'T').slice(0, 16));
    setDur('');
    setUnit('days');
    setEn(no.enabled !== false);
    setIcon(no.icon || '');
    setDis(no.dismissible !== false && no.dismissible !== 0);
    setErr('');
  };
  const save = async () => {
    if (!nmsg.trim()) return setErr('Message is required');
    setSaving(true);
    setErr('');
    try {
      const r = await fetch(`${basePath()}index.php/api/admin/notices` + (eid ? `/${eid}` : ''), {
        method: eid ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json', ...auth() },
        body: JSON.stringify({
          type: ntype,
          location: nloc,
          message: nmsg,
          startsAt: nstart,
          endsAt: nend,
          enabled: nen,
          icon: nicon,
          dismissible: ndis,
        }),
      });
      const d = await r.json();
      if (!r.ok || (d && d.error)) throw new Error((d && d.error) || 'Save failed');
      reset();
      load();
    } catch (x) {
      setErr((x && x.message) || 'Save failed');
    }
    setSaving(false);
  };
  const del = async (no) => {
    if (window.confirm('Delete this notice?')) {
      try {
        await fetch(`${basePath()}index.php/api/admin/notices/${no.id}`, { method: 'DELETE', headers: auth() });
        load();
      } catch (x) {
        setErr('Delete failed');
      }
    }
  };

  const inp = {
    width: '100%',
    background: o.bg,
    border: `1px solid ${o.border}`,
    borderRadius: 6,
    padding: '8px 10px',
    color: o.text,
    fontSize: 13,
    fontFamily: 'monospace',
    outline: 'none',
    boxSizing: 'border-box',
  };
  const lbl = {
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: o.dim,
    fontWeight: 700,
    display: 'block',
    marginBottom: 4,
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          background: `${o.accent}18`,
          border: `1px solid ${o.accent}50`,
          color: o.accent,
          borderRadius: 5,
          padding: '5px 12px',
          fontSize: 12,
          cursor: 'pointer',
          fontFamily: 'monospace',
          fontWeight: 600,
          marginRight: 8,
        }}
      >
        🔔 Notices
      </button>
      {open && createPortal(
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: isMobile ? o.bg : 'rgba(0,0,0,0.8)',
            zIndex: 4000,
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            padding: isMobile ? 0 : 16,
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch',
          }}
          onClick={(e) => {
            if (!isMobile && e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div
            style={{
              background: o.surface,
              border: isMobile ? 'none' : `1px solid ${o.border}`,
              borderRadius: isMobile ? 0 : 12,
              width: '100%',
              maxWidth: isMobile ? '100%' : 720,
              minHeight: isMobile ? '100%' : 'auto',
              margin: isMobile ? 0 : '24px 0',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '14px 18px',
                borderBottom: `1px solid ${o.border}`,
                position: isMobile ? 'sticky' : 'static',
                top: 0,
                background: o.surface,
              }}
            >
              <div style={{ fontWeight: 800, fontSize: 15, color: o.text, fontFamily: 'monospace' }}>Notices</div>
              <button
                onClick={() => setOpen(false)}
                style={{ background: 'none', border: 'none', color: o.dim, fontSize: 20, cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>
            <div style={{ padding: 18, borderBottom: `1px solid ${o.border}` }}>
              <div
                style={{
                  fontSize: 11,
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                  color: o.accent,
                  fontWeight: 700,
                  marginBottom: 12,
                }}
              >
                {eid ? 'Edit notice' : 'New notice'}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={lbl}>Type (sets the color)</label>
                  <select value={ntype} onChange={(e) => setType(e.target.value)} style={inp}>
                    {NOTICE_TYPES.map((x) => <option key={x.id} value={x.id}>{x.label}</option>)}
                  </select>
                </div>
                <div>
                  <label style={lbl}>Location</label>
                  <select value={nloc} onChange={(e) => setLoc(e.target.value)} style={inp}>
                    <option value="top">Top of screen</option>
                    <option value="report">Report view</option>
                    <option value="both">Both</option>
                  </select>
                </div>
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={lbl}>Message (links: [text](https://example.com) or [text](/help/))</label>
                <textarea value={nmsg} onChange={(e) => setMsg(e.target.value)} rows={2} style={{ ...inp, resize: 'vertical' }} />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={lbl}>Icon</label>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {[''].concat(NOTICE_ICON_IDS).map((id) => {
                    const on = nicon === id;
                    const shown = id || noticeIconName({ type: ntype });
                    return (
                      <button key={id || 'default'} type="button" onClick={() => setIcon(id)} title={id ? id : 'Default for this type'}
                        style={{ display: 'flex', alignItems: 'center', gap: 5, background: on ? `${o.accent}22` : 'none', border: `1px solid ${on ? o.accent : o.border}`,
                          color: on ? o.accent : o.dim, borderRadius: 6, padding: '5px 8px', cursor: 'pointer', fontSize: 11, fontFamily: 'monospace' }}>
                        <NoticeIcon name={shown} color={on ? o.accent : o.dim} size={16} />{id ? '' : 'Default'}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={lbl}>Preview</label>
                <NoticeBar notice={{ type: ntype, icon: nicon, message: nmsg || 'Your message appears here.', dismissible: ndis }} theme={o} variant="preview" onDismiss={() => {}} />
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr auto auto',
                  gap: 8,
                  alignItems: 'end',
                  marginBottom: 12,
                }}
              >
                <div>
                  <label style={lbl}>Start date (blank = now)</label>
                  <input type="datetime-local" value={nstart} onChange={(e) => onStart(e.target.value)} style={inp} />
                </div>
                <div style={{ width: 84 }}>
                  <label style={lbl}>Duration</label>
                  <input
                    type="number"
                    min={0}
                    value={ndur}
                    onChange={(e) => onDur(e.target.value)}
                    placeholder="—"
                    style={inp}
                  />
                </div>
                <div style={{ width: 88 }}>
                  <label style={lbl}>Unit</label>
                  <select value={nunit} onChange={(e) => onUnit(e.target.value)} style={inp}>
                    <option value="hours">Hours</option>
                    <option value="days">Days</option>
                    <option value="weeks">Weeks</option>
                  </select>
                </div>
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={lbl}>Stop date (blank = until you disable it)</label>
                <input type="datetime-local" value={nend} onChange={(e) => setEnd(e.target.value)} style={inp} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 7,
                    cursor: 'pointer',
                    fontSize: 13,
                    color: o.text,
                    fontFamily: 'monospace',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={nen}
                    onChange={(e) => setEn(e.target.checked)}
                    style={{ accentColor: o.accent, width: 15, height: 15 }}
                  />
                  Enabled
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer', fontSize: 13, color: o.text, fontFamily: 'monospace' }}>
                  <input type="checkbox" checked={ndis} onChange={(e) => setDis(e.target.checked)} style={{ accentColor: o.accent, width: 15, height: 15 }} />
                  Can be dismissed
                </label>
                <button
                  onClick={save}
                  disabled={saving}
                  style={{
                    background: `${o.accent}22`,
                    border: `1px solid ${o.accent}`,
                    color: o.accent,
                    borderRadius: 6,
                    padding: '8px 18px',
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: saving ? 'default' : 'pointer',
                    fontFamily: 'monospace',
                    opacity: saving ? 0.6 : 1,
                  }}
                >
                  {saving ? 'Saving…' : eid ? 'Update notice' : 'Create notice'}
                </button>
                {eid && (
                  <button
                    onClick={reset}
                    style={{
                      background: 'none',
                      border: `1px solid ${o.border}`,
                      color: o.dim,
                      borderRadius: 6,
                      padding: '8px 14px',
                      fontSize: 13,
                      cursor: 'pointer',
                      fontFamily: 'monospace',
                    }}
                  >
                    Cancel
                  </button>
                )}
                {eid && !err && <span style={{ fontSize: 11, color: o.dim, fontFamily: 'monospace' }}>Saving shows this message again to everyone who dismissed it.</span>}
                {err && <span style={{ fontSize: 12, color: o.bad, fontFamily: 'monospace' }}>{err}</span>}
              </div>
            </div>
            <div style={{ padding: 18 }}>
              {loading ? (
                <div style={{ color: o.dim, fontSize: 13, fontFamily: 'monospace' }}>Loading…</div>
              ) : list.length ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {list.map((no) => {
                    const c = noticeColor(no.type, o);
                    const tl = (NOTICE_TYPES.find((x) => x.id === no.type) || NOTICE_TYPES[1]).label;
                    const d0 = new Date(), p2 = (x) => String(x).padStart(2, '0');
                    const nowS = `${d0.getFullYear()}-${p2(d0.getMonth() + 1)}-${p2(d0.getDate())}T${p2(d0.getHours())}:${p2(d0.getMinutes())}`;
                    const sS = (no.startsAt || '').replace(' ', 'T').slice(0, 16), eS = (no.endsAt || '').replace(' ', 'T').slice(0, 16);
                    const status = no.enabled === false ? 'disabled' : no.liveNow ? 'live' : (no.dbNow ? (String(no.dbNow).replace(' ', 'T').slice(0, 16) < sS ? 'scheduled' : 'ended') : (nowS < sS ? 'scheduled' : nowS > eS ? 'ended' : 'live'));
                    return (
                      <div
                        key={no.id}
                        style={{
                          border: `1px solid ${o.border}`,
                          borderLeft: `3px solid ${c}`,
                          borderRadius: 6,
                          padding: '10px 12px',
                          opacity: no.enabled === false ? 0.55 : 1,
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'flex-start' }}>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: 11, fontFamily: 'monospace', marginBottom: 3 }}>
                              <span style={{ color: c, fontWeight: 700 }}>{tl}</span>
                              <span style={{ color: o.dim }}>
                                {' · ' +
                                  (no.location === 'both' ? 'Top + Report' : no.location === 'top' ? 'Top' : 'Report') +
                                  ' · ' + status + (no.dismissible === false ? ' · not dismissible' : '')}
                              </span>
                            </div>
                            <div
                              style={{
                                fontSize: 13,
                                color: o.text,
                                fontFamily: 'system-ui,sans-serif',
                                whiteSpace: 'pre-line',
                                wordBreak: 'break-word',
                              }}
                            >
                              {no.message}
                            </div>
                            <div style={{ fontSize: 11, color: o.dim, fontFamily: 'monospace', marginTop: 3 }}>
                              {no.dbNow ? 'server time ' + String(no.dbNow).slice(0, 16) + ' · ' : ''}{(no.startsAt || '').slice(0, 16).replace('T', ' ') +
                                '  →  ' +
                                ((no.endsAt || '').startsWith('2099') ? 'until disabled' : (no.endsAt || '').slice(0, 16).replace('T', ' '))}
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                            <button
                              onClick={() => edit(no)}
                              style={{
                                background: 'none',
                                border: `1px solid ${o.border}`,
                                color: o.text,
                                borderRadius: 5,
                                padding: '4px 10px',
                                fontSize: 12,
                                cursor: 'pointer',
                                fontFamily: 'monospace',
                              }}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => del(no)}
                              style={{
                                background: 'none',
                                border: `1px solid ${o.bad}55`,
                                color: o.bad,
                                borderRadius: 5,
                                padding: '4px 10px',
                                fontSize: 12,
                                cursor: 'pointer',
                                fontFamily: 'monospace',
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ color: o.dim, fontSize: 13, fontFamily: 'monospace' }}>No notices yet.</div>
              )}
            </div>
          </div>
        </div>
      , document.body)}
    </>
  );
}
