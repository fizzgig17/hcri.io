// frontend/src/components/Notices.jsx
//
// Site banners. An admin posts them (Admin > Notices); they show at the top of the app and/or on report pages.
// Each has a type (colour), an icon, a schedule, and optionally no close button. Closing one is remembered in a cookie as
// "<id>:<rev>"; `rev` goes up every time the admin saves the notice, so saving shows it again to everyone. Colours come from
// the active light/dark theme.

import { useState, useEffect, useRef } from 'react';
import { basePath } from '../lib/api';

export const NOTICE_TYPES = [
  { id: 'info',      label: 'Information', color: 'accent', icon: 'info' },
  { id: 'news',      label: 'News',        color: 'good',   icon: 'megaphone' },
  { id: 'success',   label: 'Success',     color: 'good',   icon: 'check' },
  { id: 'warning',   label: 'Warning',     color: 'warn',   icon: 'warning' },
  { id: 'issue',     label: 'Site issue',  color: 'warn',   icon: 'wrench' },
  { id: 'important', label: 'Important',   color: 'bad',    icon: 'alert' },
  { id: 'alert',     label: 'Alert',       color: 'bad',    icon: 'alert' },
];
export const NOTICE_ICON_IDS = ['info', 'check', 'warning', 'alert', 'megaphone', 'wrench', 'clock', 'star', 'bolt', 'heart'];

const PATHS = {
  info:      <><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 7.5v.01" /></>,
  check:     <><circle cx="12" cy="12" r="9" /><path d="M8 12.5l3 3 5-6" /></>,
  warning:   <><path d="M12 3.5l9.5 16.5h-19z" /><path d="M12 10v4.5M12 17.2v.01" /></>,
  alert:     <><path d="M8 3h8l5 5v8l-5 5H8l-5-5V8z" /><path d="M12 8v5M12 16v.01" /></>,
  megaphone: <><path d="M3 10v4h3l7 4V6L6 10z" /><path d="M16.5 9a4 4 0 010 6" /></>,
  wrench:    <path d="M14.5 6.5a4 4 0 005 5l-9 9a2.1 2.1 0 01-3-3l9-9a4 4 0 01-2-2z" />,
  clock:     <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  star:      <path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.9-5.2-2.8-5.2 2.8 1-5.9-4.3-4.1 5.9-.8z" />,
  bolt:      <path d="M13 3L5 13.5h6L10 21l8-10.5h-6z" />,
  heart:     <path d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0112 7.6 4.3 4.3 0 0119.5 10c0 5.4-7.5 10-7.5 10z" />,
};

export function NoticeIcon({ name, color, size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      style={{ flexShrink: 0, marginTop: 1 }} aria-hidden="true">{PATHS[name] || PATHS.info}</svg>
  );
}

const typeInfo = (type) => NOTICE_TYPES.find(x => x.id === type) || NOTICE_TYPES[1];
export const noticeColor = (type, t) => t[typeInfo(type).color] || t.accent;
export const noticeIconName = (n) => (n && n.icon) || typeInfo(n && n.type).icon;

// ---- dismissal cookie -------------------------------------------------------------------------------------------------
const COOKIE = 'hcri_notices_dismissed';
const key = (n) => `${n.id}:${n.rev || 0}`;
function readDismissed() {
  try {
    const m = document.cookie.split('; ').find(c => c.startsWith(COOKIE + '='));
    return m ? decodeURIComponent(m.slice(COOKIE.length + 1)).split(',').filter(Boolean) : [];
  } catch { return []; }
}
function writeDismissed(list) {
  try {
    document.cookie = `${COOKIE}=${encodeURIComponent(list.slice(-50).join(','))}; max-age=31536000; path=/; SameSite=Lax`;
  } catch {}
}

let notices = null;
let noticesPromise = null;
function loadNotices() {
  if (noticesPromise) return noticesPromise;
  noticesPromise = fetch(`${basePath()}index.php/api/notices`)
    .then(r => r.json())
    .then(d => { notices = Array.isArray(d) ? d : []; return notices; })
    .catch(() => { notices = []; return notices; });
  return noticesPromise;
}

// location is 'top' or 'report'; a notice posted for 'both' matches either. Dismissed ones (same id AND rev) are left out.
function useNotices(location) {
  const [ns, setNs] = useState(notices || []);
  const [gone, setGone] = useState(readDismissed);
  useEffect(() => {
    let live = true;
    loadNotices().then(d => { if (live) setNs(d || []); });
    return () => { live = false; };
  }, []);
  const dismiss = (n) => {
    const next = [...readDismissed().filter(k => k.split(':')[0] !== String(n.id)), key(n)];
    writeDismissed(next);
    setGone(next);
  };
  const shown = (ns || []).filter(n => n && (n.location === location || n.location === 'both') && !gone.includes(key(n)));
  return [shown, dismiss];
}

export function NoticeBar({ notice, theme: t, variant, onDismiss }) {
  const c = noticeColor(notice.type, t);
  const base = {
    background: `${c}22`, border: `1px solid ${c}66`, color: t.text,
    fontFamily: 'system-ui,-apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif',
    fontSize: 13.5, lineHeight: 1.55, display: 'flex', gap: 10, alignItems: 'flex-start',
  };
  const style = variant === 'top'
    ? { ...base, padding: '10px 16px', borderWidth: '0 0 1px', borderRadius: 0, justifyContent: 'center' }
    : { ...base, padding: '11px 14px', borderRadius: 8, margin: variant === 'preview' ? 0 : '0 22px 12px' };
  const canClose = notice.dismissible !== false && notice.dismissible !== 0 && onDismiss;
  return (
    <div style={style} role="status">
      <NoticeIcon name={noticeIconName(notice)} color={c} />
      <span style={{ maxWidth: variant === 'top' ? 860 : 'none', whiteSpace: 'pre-line', flex: variant === 'top' ? '0 1 auto' : 1 }}>
        {notice.message}
      </span>
      {canClose && (
        <button onClick={() => onDismiss(notice)} aria-label="Dismiss this message" title="Dismiss"
          style={{ background: 'none', border: 'none', color: t.dim, cursor: 'pointer', fontSize: 20, lineHeight: 1, padding: '0 2px', marginLeft: 6, flexShrink: 0 }}>×</button>
      )}
    </div>
  );
}

// Site-wide notice banner(s), stacked at the very top of the page. Renders nothing when there is nothing to show.
export function TopNotices({ theme }) {
  const [ns, dismiss] = useNotices('top');
  const ref = useRef(null);
  // The app's screens are sized to the window (100vh). Publish the banner's height so they can subtract it and still scroll to the bottom.
  useEffect(() => {
    const root = document.documentElement;
    const set = () => root.style.setProperty('--notice-h', ((ref.current && ref.current.offsetHeight) || 0) + 'px');
    set();
    let ro;
    if (ref.current && typeof ResizeObserver !== 'undefined') { ro = new ResizeObserver(set); ro.observe(ref.current); }
    return () => { if (ro) ro.disconnect(); root.style.setProperty('--notice-h', '0px'); };
  }, [ns.length]);
  if (!ns.length) return null;
  return <div ref={ref}>{ns.map(n => <NoticeBar key={n.id} notice={n} theme={theme} variant="top" onDismiss={dismiss} />)}</div>;
}

// Notice banner(s) shown inline on a report detail page.
export function ReportNotices({ theme }) {
  const [ns, dismiss] = useNotices('report');
  if (!ns.length) return null;
  return <div>{ns.map(n => <NoticeBar key={n.id} notice={n} theme={theme} variant="report" onDismiss={dismiss} />)}</div>;
}
