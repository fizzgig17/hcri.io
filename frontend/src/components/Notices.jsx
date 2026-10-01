// frontend/src/components/Notices.jsx
//
// Reconstructed from assets/app.js (minified loadNotices/useNotices/
// noticeColor/NoticeBar/TopNotices/ReportNotices). Entirely new -- there
// was no notices system at all in the stale frontend/src this replaces.
// A site-wide banner system an admin posts through (api/admin's notices
// endpoints -- see AdminNotices), shown either at the top of the app or
// inline on a report, depending on where the admin targeted it.

import { useState, useEffect } from 'react';
import { basePath } from '../lib/api';

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

// location is 'top' (shown site-wide) or 'report' (shown on report detail
// pages); a notice posted with location 'both' matches either.
function useNotices(location) {
  const [ns, setNs] = useState(notices || []);
  useEffect(() => {
    let live = true;
    loadNotices().then(d => { if (live) setNs(d || []); });
    return () => { live = false; };
  }, []);
  return (ns || []).filter(n => n && (n.location === location || n.location === 'both'));
}

function noticeColor(type, t) {
  return type === 'important' ? t.bad : type === 'issue' ? t.warn : t.good;
}

function NoticeBar({ notice, theme: t, variant }) {
  const c = noticeColor(notice.type, t);
  const label = notice.type === 'important' ? 'Important' : notice.type === 'issue' ? 'Site issue' : 'News';
  const base = {
    background: `${c}22`, border: `1px solid ${c}66`, color: t.text,
    fontFamily: 'system-ui,-apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif',
    fontSize: 13.5, lineHeight: 1.55, display: 'flex', gap: 10, alignItems: 'flex-start',
  };
  const style = variant === 'top'
    ? { ...base, padding: '10px 16px', borderWidth: '0 0 1px', borderRadius: 0, justifyContent: 'center' }
    : { ...base, padding: '11px 14px', borderRadius: 8, margin: '0 22px 12px' };
  return (
    <div style={style}>
      <span style={{ color: t.text, fontWeight: 800, flexShrink: 0, borderBottom: `2px solid ${c}`, paddingBottom: 1 }}>
        {label}
      </span>
      <span style={{ maxWidth: variant === 'top' ? 860 : 'none', whiteSpace: 'pre-line' }}>
        {notice.message}
      </span>
    </div>
  );
}

// Site-wide notice banner(s), stacked at the very top of the page above
// everything else. Renders nothing while there are no 'top'/'both' notices.
export function TopNotices({ theme }) {
  const ns = useNotices('top');
  if (!ns.length) return null;
  return <div>{ns.map(n => <NoticeBar key={n.id} notice={n} theme={theme} variant="top" />)}</div>;
}

// Notice banner(s) shown inline on a report detail page. Renders nothing
// while there are no 'report'/'both' notices.
export function ReportNotices({ theme }) {
  const ns = useNotices('report');
  if (!ns.length) return null;
  return <div>{ns.map(n => <NoticeBar key={n.id} notice={n} theme={theme} variant="report" />)}</div>;
}
