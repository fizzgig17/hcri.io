// frontend/src/components/Explore.jsx
//
// Reconstructed from the deployed assets/app.js (minified function
// Ue({onBack,onSignIn,user,onHome,onLogout,onHardReset})). This is the
// single largest component in the app -- the public "Explore" experience,
// and it also doubles as the signed-in user's "My Reports" library and the
// site-wide "Insights" dashboards, all driven by one `tab` state value
// (`browse` | `myreports` | `insights` | `finsights` | `myinsights`).
// There was no Explore feature at all in the stale frontend/src this
// replaces -- folders, pinning results while viewing a report, bulk
// categorize/delete, drag-and-drop folder assignment, the Compare
// cards/overlay/photo views and their shareable PNG export, and the guest
// "quick analysis" dropzone are all new.
//
// Responsibilities:
//  - `browse`   : public reports, filterable/sortable/paginated grid.
//  - `myreports`: the signed-in user's own reports (public + private),
//                 same filter UI, plus folders, upload, bulk select,
//                 categorize and delete.
//  - `insights` / `finsights` / `myinsights`: three flavors of the same
//    aggregate-statistics dashboard -- sitewide (ExploreStats, a separate
//    reconstruction batch), the current Explore filter set, and the user's
//    own reports (both via the local FilteredInsights below).
//  - Opening a report (`ee`/setOpenReport) shows it full-screen on mobile,
//    or -- on desktop, once the viewer pins the results list open with the
//    📌 button -- as a results-sidebar + report-pane split view. Both
//    layouts share the same filter panel and results grid (factored below
//    into <FilterPanel> / <ResultsPanel> rather than duplicated inline, as
//    the bundle does both times: the two were always printing byte-for-byte
//    identical rows except for which container wraps them).
//  - Selecting 2-12 reports (checkbox on each card, `cmpSel`) opens a
//    full-screen Compare view: side-by-side cards, an SPD overlay chart
//    (OverlaySPD, a separate batch), a "photo" mode driven by a global
//    window.HCRIPhoto hook this batch doesn't own, drag-to-reorder, a
//    shareable link (minting a share token for any private report in the
//    set), and a downloadable PNG "share card" rendered to a <canvas>
//    (compareShareCard, below).
//
// Backend: GET  /api/explore                 -> paginated + filtered list,
//            also accepts ?summary=1 (aggregate stats for the current
//            filters), ?summary=1&build=1 (a shareable id-list for those
//            filters), and ?summary=1&r=id.token,... (stats for an
//            explicit report set -- used by the "Filtered Set Summary"
//            iframe button).
//          POST /api/explore   {id, public}  -> toggle a report's visibility
//          GET  /api/explore/{id}            -> single report detail
//          GET/POST /api/folders, PATCH/DELETE /api/folders/{id},
//          POST /api/folders/reorder          -> "My Reports" folders
//          POST /api/categories/bulk_assign    -> the Categorize modal
//          POST /api/reports (+ /guest_analyze), DELETE /api/reports/{id},
//          PATCH /api/reports/{id}            -> upload / delete / share
//
// Components reused from parallel reconstruction batches (all now landed
// and wired up directly -- no local stand-ins remain):
//   Votes, CatFilter   -- components/Votes.jsx, CatFilter.jsx
//   RangeSlider        -- components/RangeSlider.jsx, the CCT/Duv/Ra/Rg/R9
//     dual-thumb filter slider (previously duplicated locally here -- now
//     imported, like everything else below)
//   CompareCard, OverlaySPD -- the Compare view's per-report card and SPD
//     overlay chart (components/CompareCard.jsx, OverlaySPD.jsx)
//   ExploreStats       -- sitewide aggregate dashboard (`insights` tab)
//   HelpModal          -- components/HelpModal.jsx
//   PasteSPDModal      -- components/PasteSPDModal.jsx, the bundle's `Le`
//     ("📋 Paste" button in the My Reports uploader)
//   ReportDetail       -- components/ReportDetail.jsx, the bundle's `_e`:
//     the public-facing report pane used for both the normal report-detail
//     view and the Compare view's full-report modal. This is a different
//     component from (and not interchangeable with) ReportView.jsx, which
//     is the signed-in app's main dashboard report pane -- see the header
//     comments on both files.
//   AdminPanel         -- components/AdminPanel.jsx, the bundle's `Ae`
//     (⚙ admin modal), opened with `{ onClose, me: user }`.
//   FeedbackModal      -- named export of components/AuthScreen.jsx (the
//     bundle's `__fbModal`), opened with `{ user, onClose }`.
//   AccountSettings    -- components/AccountSettings.jsx, the bundle's
//     `__profileModal` (profile/settings modal), opened with
//     `{ user, onClose, onUserUpdate }`.
//   SERIES_COLORS, tintInfo, compareShareCard -- lib/compareExport.js;
//     compareShareCard in particular was also duplicated locally here in
//     the first pass (it's defined just above `Ue` in the bundle, not
//     inside it) -- now imported instead, so the Compare view's share-card
//     rendering can't drift from CompareCard/OverlaySPD's copy.
// Left as optional, best-effort no-op-if-absent integrations (as in the
// original, always guarded with `window.X &&`), since they belong to no
// reconstructed component: window.HCRIPhoto / window.HCRIPlayground /
// window.HCRIAnalysis (photo-mode compare, the CRI 3D playground button,
// and the Compare view's "Analysis" expander).

import { useState, useEffect, useRef, useCallback, Fragment } from 'react';
import { useTheme } from '../lib/ThemeContext.jsx';
import { useIsMobile } from '../hooks/useIsMobile';
import { getToken } from '../lib/api';
import { fmtTZ } from '../lib/tz';
import Votes from './Votes';
import CatFilter from './CatFilter';
import HelpModal from './HelpModal';
import PasteSPDModal from './PasteSPDModal';
import RangeSlider from './RangeSlider';
import ReportDetail from './ReportDetail';
import CompareCard from './CompareCard';
import OverlaySPD from './OverlaySPD';
import ExploreStats from './ExploreStats';
import AdminPanel from './AdminPanel';
import { FeedbackModal } from './AuthScreen';
import AccountSettings from './AccountSettings';
import { SERIES_COLORS, tintInfo, compareShareCard } from '../lib/compareExport';
import usePanelBackClose from '../hooks/usePanelBackClose';
import { useVisualViewportBottomInset } from '../hooks/useVisualViewportBottomInset';

// ── Shared constants ─────────────────────────────────────────────────────────

const EXPLORE_API = './index.php/api/explore';

// Voting (thumbs up/down on a report) is paused for now -- not being used.
// The Votes widget/API and ReportDetail/ExploreStats' own uses of it are
// left in place behind this flag rather than ripped out, so it's a
// one-line change to bring back.
const VOTING_ENABLED = false;

// Duv tint classification, series palette, and canvas helpers are shared
// with CompareCard/OverlaySPD -- imported from lib/compareExport rather
// than duplicated here (see the import list above).
const TINT = {
  rosy: { label: 'Rosy', color: '#e0719b' },
  neutral: { label: 'Neutral', color: '#8a96a3' },
  green: { label: 'Green', color: '#9bbf3a' },
};

const CATEGORY_FIELDS = [
  ['light_brand', 'Light Brand'],
  ['light_model', 'Light Model'],
  ['led_cct', 'LED CCT'],
  ['led_brand', 'LED Brand'],
  ['led_model', 'LED Model'],
  ['optic', 'Optic'],
];

function authHeaders(json) {
  const h = { Authorization: 'Bearer ' + (localStorage.getItem('spd_token') || '') };
  if (json) h['Content-Type'] = 'application/json';
  return h;
}

// Whether the viewport is desktop-width right now. Used once, synchronously,
// to decide the *initial* grid column estimate below -- not reactive, unlike
// useIsMobile (which the rest of this file uses for render-time branching).
function isDesktopViewport() {
  try {
    if (typeof window === 'undefined') return false;
    return window.matchMedia ? window.matchMedia('(min-width: 769px)').matches : window.innerWidth > 768;
  } catch {
    return false;
  }
}

// A first-paint guess at how many report cards fit on screen at once (grid
// of ~294px-wide tiles), before the real measurement effect (below, in
// Explore) corrects it against the actual rendered grid.
function computeInitialPerPage() {
  const W = window.innerWidth > 900 ? window.innerWidth - 360 : window.innerWidth - 24;
  const gap = 14;
  const cols = Math.max(1, Math.floor((W + gap) / 294));
  const rows = Math.max(2, Math.floor((window.innerHeight - 200) / 314));
  return Math.max(cols, Math.min(cols * rows, 120));
}

// ── Small shared pieces ──────────────────────────────────────────────────────

function FilterLabel({ children, T: t }) {
  return (
    <div style={{
      fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1,
      color: t.text, fontFamily: 'monospace', marginBottom: 4,
    }}>
      {children}
    </div>
  );
}

function MetricBadge({ label, value, color }) {
  if (value == null) return null;
  return (
    <span style={{
      background: `${color}18`, border: `1px solid ${color}40`, color, borderRadius: 4,
      padding: '2px 7px', fontSize: 12, fontFamily: 'monospace', fontWeight: 700,
    }}>
      {label}:{value}
    </span>
  );
}

// The grid card for a single report, used by both Explore and My Reports.
function ReportCard({ r: e, onClick, T: n, selected, onToggle, mine, onDelete, full, onDragStart }) {
  const dark = n.name === 'dark';
  const gradeColor = (v) => (v == null ? n.dim : v >= 90 ? n.good : v >= 80 ? n.warn : n.bad);
  const rgColor = (v) => (Math.abs((v || 100) - 100) <= 8 ? n.good : n.warn);
  const duvColor = (v) => (Math.abs(v || 0) < 0.006 ? n.good : n.warn);
  const tint = tintInfo(e.duv);

  return (
    <div
      onClick={onClick}
      draggable={!!onDragStart}
      onDragStart={onDragStart ? (ev) => onDragStart(ev, e) : undefined}
      style={{
        background: mine ? (dark ? '#11294a' : '#e8f1fd') : e.private ? (dark ? '#3a1620' : '#fbe1e6') : n.surface,
        border: `1px solid ${n.border}`, borderRadius: 10, padding: '14px 16px', cursor: 'pointer',
        display: 'flex', flexDirection: 'column', gap: 10, minWidth: 0, maxWidth: '100%', transition: 'all .15s',
        boxShadow: dark ? 'none' : '0 1px 4px rgba(0,0,0,0.08)',
      }}
      onMouseEnter={(ev) => { ev.currentTarget.style.borderColor = n.accent; ev.currentTarget.style.boxShadow = `0 2px 12px ${n.accent}25`; }}
      onMouseLeave={(ev) => { ev.currentTarget.style.borderColor = n.border; ev.currentTarget.style.boxShadow = dark ? 'none' : '0 1px 4px rgba(0,0,0,0.08)'; }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
          {onToggle && (
            <input
              type="checkbox"
              checked={!!selected}
              title="Select to compare"
              onClick={(ev) => ev.stopPropagation()}
              onChange={(ev) => { ev.stopPropagation(); onToggle(); }}
              style={{ cursor: 'pointer', accentColor: n.accent, width: 15, height: 15, margin: 0, flexShrink: 0 }}
            />
          )}
          <div style={{
            fontWeight: 700, fontSize: 14, color: n.text, fontFamily: 'monospace', minWidth: 0,
            // Wrap the full title instead of truncating with an ellipsis --
            // the card is a flex column with auto height, so a longer
            // title just grows the card rather than clipping.
            overflow: 'visible', textOverflow: 'clip', whiteSpace: 'normal', wordBreak: 'break-word',
          }}>
            {e.label || 'Unnamed'}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
          {mine && onDelete && (
            <button
              onClick={(ev) => { ev.stopPropagation(); onDelete(); }}
              title="Delete this report"
              style={{
                background: `${n.bad}15`, border: `1px solid ${n.bad}40`, color: n.bad, cursor: 'pointer',
                fontSize: 13, lineHeight: 1, padding: '3px 6px', alignSelf: 'center', borderRadius: 5,
              }}
              onMouseEnter={(ev) => { ev.currentTarget.style.background = `${n.bad}28`; ev.currentTarget.style.borderColor = n.bad; }}
              onMouseLeave={(ev) => { ev.currentTarget.style.background = `${n.bad}15`; ev.currentTarget.style.borderColor = `${n.bad}40`; }}
            >
              🗑
            </button>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {tint && (
          <span style={{ background: `${tint.color}22`, border: `1px solid ${tint.color}`, color: tint.color, borderRadius: 4, padding: '2px 7px', fontSize: 12, fontFamily: 'monospace', fontWeight: 700 }}>
            {tint.label}
          </span>
        )}
        {e.cct != null && (
          <span style={{ background: `${n.accent}15`, border: `1px solid ${n.accent}40`, color: n.accent, borderRadius: 4, padding: '2px 7px', fontSize: 12, fontFamily: 'monospace', fontWeight: 700 }}>
            {e.cct}K
          </span>
        )}
        {e.duv != null && (
          <span style={{ background: `${duvColor(e.duv)}15`, border: `1px solid ${duvColor(e.duv)}40`, color: duvColor(e.duv), borderRadius: 4, padding: '2px 7px', fontSize: 12, fontFamily: 'monospace', fontWeight: 700 }}>
            Duv:{e.duv >= 0 ? '+' : ''}{e.duv.toFixed(4)}
          </span>
        )}
        {e.ra != null && <MetricBadge label="Ra" value={Math.round(e.ra)} color={gradeColor(e.ra)} />}
        {e.r9 != null && <MetricBadge label="R9" value={Math.round(e.r9)} color={e.r9 >= 50 ? n.good : e.r9 >= 0 ? n.warn : n.bad} />}
        <MetricBadge label="Rf" value={e.Rf} color={gradeColor(e.Rf)} />
        <MetricBadge label="Rg" value={e.Rg} color={rgColor(e.Rg)} />
      </div>

      {e.userName && (
        <div style={{ fontSize: 11, color: n.dim, fontFamily: 'monospace', borderTop: `1px solid ${n.border}`, paddingTop: 6, marginTop: 2 }}>
          by <span style={{ color: n.text, fontWeight: 700 }}>{e.userName}</span> · {fmtTZ(e.createdAt.replace(' ', 'T'), undefined, true)}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {e.private && <span title="Private — only you can see this" style={{ fontSize: 14, lineHeight: 1, opacity: 0.75 }}>🔒</span>}
          <span title="Report ID" style={{ fontSize: 10, color: n.dim, opacity: 0.5, fontFamily: 'monospace', lineHeight: 1 }}>#{e.id}</span>
        </div>
        {VOTING_ENABLED && <Votes reportId={e.id} theme={n} initialUp={e.up} initialDown={e.down} />}
      </div>
    </div>
  );
}

// A small floating "N / total" pill shown over the results grid in "View
// All" mode, draggable to scroll through the whole (unpaginated) list.
function ScrollPositionIndicator({ total, count, T }) {
  const [st, setSt] = useState(null);
  const [awake, setAwake] = useState(false);
  const scRef = useRef(null);
  const dgRef = useRef(null);
  const tmRef = useRef(0);

  useEffect(() => {
    let scroller = null, raf = 0, dead = false;
    const findScroller = (el) => {
      let p = el && el.parentElement;
      while (p && p !== document.body) {
        const cs = getComputedStyle(p);
        if (/(auto|scroll)/.test(cs.overflowY) && p.scrollHeight > p.clientHeight + 4) return p;
        p = p.parentElement;
      }
      return null;
    };
    const calc = () => {
      raf = 0;
      if (dead) return;
      const grid = document.querySelector('[data-expgrid]');
      if (!grid || !grid.children.length) { setSt(null); return; }
      const kids = grid.children, n = kids.length;
      if (!scroller) scroller = findScroller(grid);
      scRef.current = scroller;
      const top0 = kids[0].offsetTop;
      let cols = 1;
      while (cols < n && kids[cols].offsetTop === top0) cols++;
      const rowH = n > cols ? kids[cols].offsetTop - top0 : kids[0].offsetHeight || 1;
      const gr = grid.getBoundingClientRect();
      const vTop = scroller ? scroller.getBoundingClientRect().top : 0;
      const vH = scroller ? scroller.clientHeight : window.innerHeight;
      const vRight = scroller ? window.innerWidth - scroller.getBoundingClientRect().right : 0;
      const row = Math.max(0, Math.floor((vTop - gr.top + 8) / Math.max(1, rowH)));
      const first = Math.min(n, row * cols + 1);
      const rowsVis = Math.max(1, Math.ceil(vH / Math.max(1, rowH)));
      const last = Math.min(n, row * cols + rowsVis * cols);
      const sT = scroller ? scroller.scrollTop : window.scrollY || document.documentElement.scrollTop || 0;
      const sMax = Math.max(1, scroller ? scroller.scrollHeight - scroller.clientHeight : document.documentElement.scrollHeight - window.innerHeight);
      const trackTop = vTop + 10;
      setSt({ first, last, frac: Math.max(0, Math.min(1, sT / sMax)), trackTop, trackBot: vTop + vH - 10, vRight, n, scrollable: sMax > 24 });
    };
    const wake = () => {
      setAwake(true);
      clearTimeout(tmRef.current);
      tmRef.current = setTimeout(() => { if (!dgRef.current) setAwake(false); }, 1200);
    };
    const on = () => { wake(); if (!raf) raf = requestAnimationFrame(calc); };
    calc();
    const t1 = setTimeout(calc, 250), t2 = setTimeout(calc, 900);
    window.addEventListener('scroll', on, true);
    window.addEventListener('resize', on);
    return () => {
      dead = true;
      clearTimeout(t1); clearTimeout(t2); clearTimeout(tmRef.current);
      window.removeEventListener('scroll', on, true);
      window.removeEventListener('resize', on);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [total, count]);

  const pillH = 24;
  const trackLen = st ? Math.max(1, st.trackBot - st.trackTop - pillH) : 1;
  const scrollTo = (frac) => {
    const sc = scRef.current;
    if (sc) {
      const m = Math.max(1, sc.scrollHeight - sc.clientHeight);
      sc.scrollTop = frac * m;
    } else {
      const m = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      window.scrollTo(0, frac * m);
    }
  };
  const onDown = (e) => {
    if (!st) return;
    e.preventDefault();
    dgRef.current = { y0: e.clientY, f0: st.frac, track: trackLen };
    setAwake(true);
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch {}
  };
  const onMove = (e) => {
    const d = dgRef.current;
    if (!d) return;
    e.preventDefault();
    scrollTo(Math.max(0, Math.min(1, d.f0 + (e.clientY - d.y0) / d.track)));
  };
  const onUp = (e) => {
    if (!dgRef.current) return;
    dgRef.current = null;
    try { e.currentTarget.releasePointerCapture(e.pointerId); } catch {}
  };

  if (!st || st.n <= 1 || !st.scrollable) return null;
  const dragging = !!dgRef.current;
  const top = st.trackTop + st.frac * trackLen;

  return (
    <div
      title="Drag to scroll through the list"
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
      style={{
        position: 'fixed', top, right: st.vRight + 10, zIndex: 60, height: pillH, display: 'flex', alignItems: 'center',
        gap: 3, pointerEvents: 'auto', cursor: dragging ? 'grabbing' : 'grab', touchAction: 'none', userSelect: 'none',
        WebkitUserSelect: 'none', background: T.surface2 || T.surface, border: `1px solid ${dragging ? T.accent || T.border : T.border}`,
        color: T.text, borderRadius: 999, padding: '0 9px', fontSize: 10.5, fontFamily: 'monospace', fontWeight: 700,
        fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap', opacity: dragging || awake ? 1 : 0.28, transition: 'opacity .28s ease',
      }}
    >
      <span>{st.first}</span>
      <span style={{ color: T.dim, fontWeight: 600 }}>/{total || st.n}</span>
    </div>
  );
}

// "Filtered Insights" / "My Insights" tabs: aggregate stats for an arbitrary
// Explore query string (as opposed to ExploreStats, which is the fixed
// sitewide dashboard). Self-contained -- fetches GET /api/explore?summary=1
// with whatever query it's given.
function FilteredInsights({ q, T, heading, note }) {
  const [d, setD] = useState(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    let dead = false;
    setD(null);
    setErr('');
    const tk = (() => { try { return localStorage.getItem('spd_token') || ''; } catch { return ''; } })();
    fetch(`./index.php/api/explore?summary=1&${q || ''}`, { headers: { Authorization: 'Bearer ' + tk } })
      .then((r) => r.json())
      .then((x) => { if (dead) return; x && !x.error ? setD(x) : setErr((x && x.error) || 'Failed to load'); })
      .catch(() => { if (!dead) setErr('Failed to load'); });
    return () => { dead = true; };
  }, [q]);

  const pad = { padding: 40, color: T.dim, fontFamily: 'monospace', textAlign: 'center' };
  if (err) return <div style={pad}>{err}</div>;
  if (!d) return <div style={pad}>Loading insights…</div>;
  if (!d.count) return <div style={pad}>No reports match — nothing to summarise.</div>;

  const M = d.metrics || {};
  const fmt = (v, dg) => (v == null ? '—' : (Math.round(v * 10 ** dg) / 10 ** dg).toFixed(dg));

  const tile = (label, val) => (
    <div key={label} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, padding: '12px 14px' }}>
      <div style={{ fontSize: 11, color: T.dim, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 800, color: T.text, fontFamily: 'monospace', marginTop: 4 }}>{val}</div>
    </div>
  );

  const hist = (m, dg) => {
    if (!m || !m.hist || !m.hist.bins || !m.hist.bins.length) return null;
    const bins = m.hist.bins;
    const mx = Math.max(1, ...bins.map((b) => b.count));
    return (
      <div key={m.label} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, padding: '12px 14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: T.text, fontFamily: 'monospace' }}>{m.label}</div>
          <div style={{ fontSize: 10.5, color: T.dim, fontFamily: 'monospace' }}>n={m.stats ? m.stats.n : 0}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 1, height: 64 }}>
          {bins.map((b, i) => (
            <div
              key={i}
              title={`${fmt(b.x0, dg)}–${fmt(b.x1, dg)}: ${b.count}`}
              style={{
                flex: 1, height: `${Math.max(b.count ? 6 : 0, (b.count / mx) * 100)}%`,
                background: b.count ? T.accent || '#4a9eff' : 'transparent', opacity: b.count ? 0.75 : 1,
                borderRadius: '2px 2px 0 0', minWidth: 2,
              }}
            />
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: T.dim, fontFamily: 'monospace', marginTop: 4 }}>
          <span>{fmt(m.hist.lo, dg)}</span>
          <span>{fmt(m.hist.hi, dg)}</span>
        </div>
        {m.stats && m.stats.n ? (
          <div style={{ fontSize: 10.5, color: T.dim, fontFamily: 'monospace', marginTop: 6, lineHeight: 1.5 }}>
            mean <b style={{ color: T.text }}>{fmt(m.stats.mean, dg)}</b> · median {fmt(m.stats.median, dg)}
            <br />
            p25–p75 {fmt(m.stats.p25, dg)}–{fmt(m.stats.p75, dg)} · range {fmt(m.stats.min, dg)}–{fmt(m.stats.max, dg)}
          </div>
        ) : null}
      </div>
    );
  };

  const tint = d.tint || {};
  const tTot = Math.max(1, (tint.rosy || 0) + (tint.neutral || 0) + (tint.green || 0));
  const tintBar = (lab, v, col) => (
    <div key={lab} style={{ marginBottom: 6 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: T.dim, fontFamily: 'monospace' }}>
        <span>{lab}</span>
        <span>{v || 0} · {Math.round(((v || 0) / tTot) * 100)}%</span>
      </div>
      <div style={{ height: 8, background: T.border, borderRadius: 4, overflow: 'hidden', marginTop: 3 }}>
        <div style={{ width: `${((v || 0) / tTot) * 100}%`, height: '100%', background: col }} />
      </div>
    </div>
  );

  return (
    <div style={{ padding: '18px 16px 60px', maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: T.text, fontFamily: 'monospace' }}>{heading}</div>
        {note && <div style={{ fontSize: 11.5, color: T.dim, fontFamily: 'monospace', marginTop: 3 }}>{note}</div>}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(120px,1fr))', gap: 12, marginBottom: 16 }}>
        {tile('Reports', d.count)}
        {tile('Mean CCT', M.cct && M.cct.stats.mean != null ? Math.round(M.cct.stats.mean) + 'K' : '—')}
        {tile('Mean CRI', M.ra && M.ra.stats.mean != null ? fmt(M.ra.stats.mean, 1) : '—')}
        {tile('Mean R9', M.r9 && M.r9.stats.mean != null ? fmt(M.r9.stats.mean, 1) : '—')}
        {tile('Mean Rf', M.Rf && M.Rf.stats.mean != null ? fmt(M.Rf.stats.mean, 1) : '—')}
        {tile('Mean Rg', M.Rg && M.Rg.stats.mean != null ? fmt(M.Rg.stats.mean, 1) : '—')}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 12, marginBottom: 16 }}>
        {hist(M.cct, 0)}
        {hist(M.ra, 1)}
        {hist(M.r9, 0)}
        {hist(M.Rf, 1)}
        {hist(M.Rg, 1)}
        {hist(M.duv, 4)}
      </div>
      <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, padding: '14px 16px' }}>
        <div style={{ fontSize: 12.5, fontWeight: 700, color: T.text, fontFamily: 'monospace', marginBottom: 10 }}>Tint distribution (Duv)</div>
        {tintBar('Rosy (Duv < -0.002)', tint.rosy, '#e06c9f')}
        {tintBar('Neutral', tint.neutral, T.dim)}
        {tintBar('Green (Duv > +0.002)', tint.green, '#5fbf6a')}
      </div>
    </div>
  );
}

// ── Shared filter panel + results grid ──────────────────────────────────────
// Used at two call sites (see <Explore> below), which are almost but not
// quite identical:
//  - the desktop split view (viewing a report, results pinned/opened in a
//    270px-fixed outer column) renders FilterPanel at width 100% -- it
//    already fills that fixed column -- and with NO header pin button,
//    since that view has its own pin toggle (📌) in its own tab bar.
//  - the normal full-page listing (no report open) has no such wrapping
//    column, so FilterPanel itself must be a fixed 270px desktop sidebar
//    (100% on mobile) and needs its OWN header pin button, because that
//    call site also offers a collapse-to-arrow affordance (see
//    `eFiltCol`/the toggle button in <Explore>'s `listingBody`) that the
//    pin button overrides ("pinned" = stays open even if collapsed).
// `width` and `showPinInHeader`/`ePin`/`onTogglePin` are how the two call
// sites customize this otherwise-shared component. `btn` is the small
// `ne()` button-style helper from <Explore>.

function FilterPanel({
  T: r, isMobile: o, isMyReportsTab, btn,
  width, showPinInHeader, ePin, onTogglePin,
  search, onSearch,
  userOpts, userSel, onUserSel,
  catOpts, catSel, onCatSel,
  rng, cct, onCct, duv, onDuv, ra, onRa,
  tintSel, onToggleTint,
  minRf, onMinRf, rg, onRg, r9, onR9,
  onReset, resultCount, onShowResults,
}) {
  const inputStyle = {
    width: '100%', background: r.name === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
    border: `1.5px solid ${r.border}`, borderRadius: 6, padding: '9px 12px', color: r.text,
    fontSize: o ? 16 : 14, fontFamily: 'monospace', outline: 'none', boxSizing: 'border-box',
  };

  return (
    <div style={{
      width: width ?? '100%', flexShrink: 0, borderRight: o ? 'none' : `1px solid ${r.border}`,
      borderBottom: o ? `1px solid ${r.border}` : 'none', padding: '20px 16px', display: 'flex',
      flexDirection: 'column', gap: 20, background: r.surface,
      boxShadow: r.name === 'dark' ? 'none' : '2px 0 8px rgba(0,0,0,0.04)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5, color: r.accent }}>⚙ Filters</span>
        {showPinInHeader && !o && (
          <button
            onClick={() => onTogglePin((p) => !p)}
            title={ePin ? 'Filters pinned - click to unpin' : 'Pin filters open'}
            style={{
              background: 'none', border: 'none', padding: 2, lineHeight: 1, cursor: 'pointer',
              fontSize: 14, color: ePin ? r.accent : r.dim, opacity: ePin ? 1 : 0.45,
              transform: ePin ? 'none' : 'rotate(40deg)', transition: 'all .15s',
            }}
          >
            📌
          </button>
        )}
      </div>

      <div>
        <FilterLabel T={r}>Search</FilterLabel>
        <input value={search} onChange={(e) => onSearch(e.target.value)} placeholder="Search by name…" style={inputStyle} />
      </div>

      {!isMyReportsTab && (
        <div style={{ marginBottom: 10 }}>
          <FilterLabel T={r}>User</FilterLabel>
          <CatFilter
            options={(userOpts || []).map((u) => ({ id: u.id, value: u.name }))}
            selected={userSel || []}
            theme={r}
            onChange={onUserSel}
          />
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 10, alignItems: 'start' }}>
        {CATEGORY_FIELDS.filter(([k]) => (catOpts[k] || []).length > 0).map(([k, lab]) => (
          <div key={k}>
            <FilterLabel T={r}>{lab}</FilterLabel>
            <CatFilter options={catOpts[k] || []} selected={catSel[k] || []} theme={r} onChange={(a) => onCatSel(k, a)} />
          </div>
        ))}
      </div>

      <div>
        <FilterLabel T={r}>CCT Range</FilterLabel>
        <RangeSlider label="" min={rng ? rng.cct[0] : 1000} max={rng ? rng.cct[1] : 10000} step={100} value={cct} onChange={onCct} fmt={(e) => e + 'K'} T={r} />
      </div>
      <div>
        <FilterLabel T={r}>Duv Range</FilterLabel>
        <RangeSlider label="" min={rng ? rng.duv[0] : -0.05} max={rng ? rng.duv[1] : 0.05} step={0.0005} value={duv} onChange={onDuv} fmt={(e) => e.toFixed(4)} T={r} />
      </div>
      <div>
        <FilterLabel T={r}>CRI (Ra) Range</FilterLabel>
        <RangeSlider label="" min={rng && rng.ra ? rng.ra[0] : 0} max={rng && rng.ra ? rng.ra[1] : 100} step={1} value={ra} onChange={onRa} T={r} />
      </div>

      <div>
        <FilterLabel T={r}>Tint</FilterLabel>
        <div style={{ display: 'flex', gap: 6 }}>
          {[['rosy', 'Rosy'], ['neutral', 'Neutral'], ['green', 'Green']].map(([k, lab]) => {
            const on = tintSel.includes(k), col = TINT[k].color;
            return (
              <button
                key={k}
                onClick={() => onToggleTint(k)}
                style={{
                  flex: 1, background: on ? `${col}22` : 'transparent', border: `1.5px solid ${on ? col : r.border}`,
                  color: on ? col : r.dim, borderRadius: 6, padding: '6px 4px', fontSize: 12, fontFamily: 'monospace',
                  fontWeight: 700, cursor: 'pointer',
                }}
              >
                {lab}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <FilterLabel T={r}>Min Rf</FilterLabel>
          <span style={{ fontSize: 12, color: r.accent, fontWeight: 700, fontFamily: 'monospace' }}>{minRf}+</span>
        </div>
        <input
          type="range" min={rng ? rng.rf[0] : 0} max={rng ? rng.rf[1] : 100} value={minRf}
          onChange={(e) => onMinRf(+e.target.value)}
          style={{ width: '100%', accentColor: r.accent }}
        />
      </div>

      <div>
        <FilterLabel T={r}>Rg Range</FilterLabel>
        <RangeSlider label="" min={rng ? rng.rg[0] : 60} max={rng ? rng.rg[1] : 140} step={1} value={rg} onChange={onRg} T={r} />
      </div>
      <div>
        <FilterLabel T={r}>R9 Range</FilterLabel>
        <RangeSlider label="" min={rng ? rng.r9[0] : -100} max={rng ? rng.r9[1] : 100} step={1} value={r9} onChange={onR9} T={r} />
      </div>

      <button onClick={onReset} style={{ ...btn(), width: '100%', textAlign: 'center', opacity: 0.8 }}>↺ Reset Filters</button>

      {o && (
        <button onClick={onShowResults} style={{ ...btn('good'), width: '100%', textAlign: 'center' }}>
          Show {resultCount} Result{resultCount === 1 ? '' : 's'} →
        </button>
      )}
    </div>
  );
}

function ResultsPanel({
  T: r, isMobile: o, btn,
  vAll, setVAll, total: D, unfilteredTotal: unfTotal, loading: N,
  isMyReportsTab, items: w, currentUserId,
  cmpSel, onSelectAllVisible, onClearSel, onToggleSel,
  sortBy, onSortBy, sortOrder, onToggleSortOrder,
  page: k, pages: j, onPage,
  onOpenReport, onDeleteReport, onDragStartReport,
}) {
  return (
    <div style={{
      flex: 1, minWidth: 0,
      // Extra bottom padding on mobile so the last card never sits flush
      // against the true bottom of the screen -- Safari/Firefox's bottom
      // toolbar is translucent, so content directly behind it (e.g. a
      // card's title/delete icon) stays visible and reads as a glitch
      // while scrolling or as the toolbar collapses.
      padding: o ? `14px 14px calc(env(safe-area-inset-bottom) + 28px)` : '20px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
        <div style={{ display: 'inline-flex', border: `1px solid ${r.border}`, borderRadius: 8, overflow: 'hidden' }}>
          <button
            onClick={() => setVAll(false)}
            title="Show one page of reports at a time"
            style={{ background: !vAll ? `${r.accent}20` : 'transparent', color: !vAll ? r.accent : r.dim, border: 'none', padding: '6px 18px', fontSize: 12, fontFamily: 'monospace', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}
          >
            Paginate
          </button>
          <div style={{ width: 1, background: r.border }} />
          <button
            onClick={() => setVAll(true)}
            title="Show every matching report, no paging"
            style={{ background: vAll ? `${r.accent}20` : 'transparent', color: vAll ? r.accent : r.dim, border: 'none', padding: '6px 18px', fontSize: 12, fontFamily: 'monospace', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}
          >
            View All
          </button>
        </div>
      </div>

      {vAll && <ScrollPositionIndicator total={D} count={w.length} T={r} />}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
        <div style={{ fontSize: 13, color: r.text, fontFamily: 'monospace', fontWeight: 600 }}>
          {N ? '⏳ Loading…' : D === 0 ? 'No reports found' : D < unfTotal ? `${D} of ${unfTotal} report${unfTotal === 1 ? '' : 's'}` : `${D} report${D === 1 ? '' : 's'}`}
        </div>

        {isMyReportsTab && w.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <button
              onClick={onSelectAllVisible}
              title={`Select up to ${Math.min(w.length, 12)} of the reports currently shown`}
              style={{ background: 'none', border: `1px solid ${r.border}`, color: r.dim, borderRadius: 6, padding: '4px 10px', fontSize: 11, fontFamily: 'monospace', cursor: 'pointer', fontWeight: 600 }}
            >
              Select all (up to {Math.min(w.length, 12)})
            </button>
            {cmpSel.length > 0 && (
              <button onClick={onClearSel} style={{ background: 'none', border: `1px solid ${r.border}`, color: r.dim, borderRadius: 6, padding: '4px 10px', fontSize: 11, fontFamily: 'monospace', cursor: 'pointer', fontWeight: 600 }}>
                Clear
              </button>
            )}
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 11, color: r.dim, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: 0.5 }}>Sort</span>
          <select
            value={sortBy}
            onChange={(e) => onSortBy(e.target.value)}
            style={{ background: r.surface2 || r.surface, color: r.text, border: `1px solid ${r.border}`, borderRadius: 6, padding: '5px 8px', fontSize: 12, fontFamily: 'monospace', cursor: 'pointer' }}
          >
            <option value="date" style={{ background: r.surface, color: r.text }}>Date</option>
            <option value="title" style={{ background: r.surface, color: r.text }}>Title</option>
          </select>
          <button
            onClick={onToggleSortOrder}
            title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
            style={{ background: r.surface2 || r.surface, color: r.text, border: `1px solid ${r.border}`, borderRadius: 6, padding: '5px 9px', fontSize: 13, fontFamily: 'monospace', cursor: 'pointer', fontWeight: 700 }}
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>

        {j > 1 && (
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <button disabled={k <= 1} onClick={() => onPage(k - 1)} style={{ ...btn(), opacity: k <= 1 ? 0.4 : 1 }}>← Prev</button>
            <span style={{ fontSize: 12, color: r.dim, fontFamily: 'monospace', padding: '0 4px' }}>{k}/{j}</span>
            <button disabled={k >= j} onClick={() => onPage(k + 1)} style={{ ...btn(), opacity: k >= j ? 0.4 : 1 }}>Next →</button>
          </div>
        )}
      </div>

      {!N && w.length === 0 && (
        <div style={{ textAlign: 'center', padding: '80px 20px', display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
          <div style={{ fontSize: 48, opacity: 0.2 }}>🔍</div>
          <div style={{ fontSize: 16, color: r.text, fontWeight: 600 }}>
            {isMyReportsTab ? 'None of your reports match your filters.' : 'No public reports match your filters'}
          </div>
          <div style={{ fontSize: 13, color: r.dim }}>Try adjusting the filters or check back later</div>
        </div>
      )}

      <div data-expgrid={1} style={{ display: 'grid', gridTemplateColumns: o ? '1fr' : 'repeat(auto-fill,minmax(280px,1fr))', gap: 14 }}>
        {w.map((e) => (
          <ReportCard
            key={e.id}
            r={e}
            T={r}
            full={false}
            mine={!!(currentUserId && e.userId == currentUserId)}
            onDelete={isMyReportsTab ? () => onDeleteReport(e) : undefined}
            selected={cmpSel.some((x) => x.id === e.id)}
            onToggle={() => onToggleSel(e)}
            onDragStart={isMyReportsTab && currentUserId && e.userId == currentUserId ? (ev, rep) => onDragStartReport(ev, rep) : undefined}
            onClick={() => onOpenReport(e)}
          />
        ))}
      </div>

      {j > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 24, paddingBottom: 20 }}>
          <button disabled={k <= 1} onClick={() => onPage(k - 1)} style={{ ...btn(), opacity: k <= 1 ? 0.4 : 1 }}>← Prev</button>
          <span style={{ fontSize: 13, color: r.dim, fontFamily: 'monospace', padding: '7px 12px' }}>{k} of {j}</span>
          <button disabled={k >= j} onClick={() => onPage(k + 1)} style={{ ...btn(), opacity: k >= j ? 0.4 : 1 }}>Next →</button>
        </div>
      )}
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────

export default function Explore({ onBack, onSignIn, user: n, onHome: onHomeFn, onLogout: onLogoutFn, onHardReset: onHardResetFn }) {
  const { theme: r, themeName: i, toggleTheme: a } = useTheme();
  const o = useIsMobile(768);
  const s = i === 'dark';
  // How much of the bottom of the screen Safari's own chrome (bottom
  // toolbar) is currently covering -- see the hook's own comment. Only
  // matters for the fixed/docked compare-selection bar below; 0 on
  // browsers without a chrome-overlap problem, so this is a no-op there.
  const vvBottomInset = useVisualViewportBottomInset();

  // Filters
  const [c, u] = useState('');                       // search text
  const [d, m] = useState([1000, 10000]);             // CCT range
  const [h, _setDuv] = useState([-0.02, 0.02]);       // Duv range
  const [v, y] = useState(0);                         // min Rf
  const [b, x] = useState([80, 130]);                 // Rg range
  const [lumR] = useState([0, 20000]);                // lumens range (not exposed in UI; kept for query parity)
  const [curR] = useState([0, 30]);                   // current range (ditto)
  const [userSel, setUserSel] = useState([]);
  const [userOpts, setUserOpts] = useState([]);
  const [S, C] = useState([-100, 100]);                // R9 range
  const [raR, setRaR] = useState([0, 100]);            // Ra range
  const [catSel, setCatSel] = useState({});
  const [catOpts, setCatOpts] = useState({});
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [tintSel, setTintSel] = useState([]);
  const [filtersTouched, setFiltersTouched] = useState(false);
  const [folderSel, setFolderSel] = useState(() => {
    try {
      const fp = new URLSearchParams(window.location.search).get('folder');
      return fp ? parseInt(fp, 10) : null;
    } catch { return null; }
  });

  // Tab
  // App.jsx remounts this whole component (bumps exploreKey) on every
  // popstate that lands back on an "explore" view, so this initializer is
  // what actually determines which tab the back/forward buttons land you
  // on -- not just the initial mount. A back press to the implicit
  // "browse" entry created when Explore first auto-opens after login has
  // no `?explore` URL of its own (bare `/`), so for that case this must
  // consult the entry's own history.state.etab (tagged by
  // __hcriClearFolderUrl/the tab-bar click handler) -- NOT the
  // last-viewed-tab localStorage fallback below, which is for a genuinely
  // fresh navigation with no history of its own and would otherwise just
  // re-show whatever tab was last visited, defeating back/forward.
  // The `?explore=<val>` <-> tab id mapping, both directions -- shared by
  // the tab useState initializer below, the popstate listener, the tab
  // bar, the logo click, and anything else that tags a history entry with
  // a specific tab (folder select, report open) so refreshing or sharing
  // that URL lands back in the same place. 'mine' (not 'myreports') for
  // My Reports is the pre-existing convention; kept as-is.
  const exploreTabUrl = (id) => {
    const val = id === 'myreports' ? 'mine' : id === 'browse' ? '' : id; // insights/finsights/myinsights pass through as-is
    return window.location.pathname + '?explore' + (val ? '=' + val : '');
  };
  const tabFromExploreVal = (val, loggedIn) => {
    if (val === 'mine') return loggedIn ? 'myreports' : 'browse';
    if (val === 'insights' || val === 'finsights') return val;
    if (val === 'myinsights') return loggedIn ? 'myinsights' : 'browse';
    return 'browse';
  };

  const [tab, setTab] = useState(() => {
    try {
      const sp = typeof window < 'u' ? new URLSearchParams(window.location.search) : null;
      const explore = sp && sp.get('explore');
      if (explore != null) return tabFromExploreVal(explore, !!n);
      const st = typeof window < 'u' ? window.history.state : null;
      if (st && st.view === 'explore' && st.etab) {
        return tabFromExploreVal(st.etab === 'myreports' ? 'mine' : st.etab, !!n);
      }
      if (n && localStorage.getItem('hcri_last_list') === 'myreports') return 'myreports';
    } catch {}
    return 'browse';
  });

  // Results
  const [w, E] = useState([]);           // reports on screen
  const [D, O] = useState(0);            // total matching
  const [unfTotal, setUnfTotal] = useState(0);
  const [k, A] = useState(1);            // page
  const [j, M] = useState(1);            // pages
  const [N, P] = useState(false);        // loading
  const [rng, setRng] = useState(null);  // data-aware slider ranges
  const rngInit = useRef(false);
  const rngScope = useRef(null);
  const [vAll, setVAll] = useState(false);
  const [perPage, setPerPage] = useState(computeInitialPerPage());
  const perPageRef = useRef(computeInitialPerPage());
  const lDebounceRef = useRef(null);

  // Open report / split view
  const [ee, F] = useState(null);         // currently open report
  const [I, te] = useState(!o);           // mobile: showing filters vs results in the sidebar
  const [ePin, setEPin] = useState(() => { try { return localStorage.getItem('explore_pinned') === 'true'; } catch { return false; } });
  // Desktop-only: collapses the full-page listing's filter sidebar to a
  // thin arrow tab. Overridden by `ePin` (pinning always keeps it open).
  const [eFiltCol, setEFiltCol] = useState(false);
  const [eOpen, setEOpen] = useState(false);

  // Compare
  const [cmpSel, setCmpSel] = useState([]);
  const [comparing, setComparing] = useState(false);
  const [cmpData, setCmpData] = useState([]);
  const [cmpBusy, setCmpBusy] = useState(false);
  const [dragIdx, setDragIdx] = useState(-1);
  const [cmpView, setCmpView] = useState('cards');
  const [cmpCopied, setCmpCopied] = useState(false);
  const [cmpCardUrl, setCmpCardUrl] = useState(null);
  const [cmpPick, setCmpPick] = useState([]);
  const [cmpCardW, setCmpCardW] = useState(440);
  const [cmpFull, setCmpFull] = useState(null);
  const [cmpFullCopied, setCmpFullCopied] = useState(false);
  const [anaOpen, setAnaOpen] = useState(false);

  // My Reports: folders
  const [folders, setFolders] = useState([]);
  const [folderMenuOpen, setFolderMenuOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [folderBusy, setFolderBusy] = useState(false);
  const [dragOverFolder, setDragOverFolder] = useState(null);
  const dragRepRef = useRef(null);
  const dragFolderRef = useRef(null);

  // My Reports: uploads
  const [mrPasteOpen, setMrPasteOpen] = useState(false);
  const [mrBusy, setMrBusy] = useState(false);
  const [mrDrag, setMrDrag] = useState(false);
  const [mrStatus, setMrStatus] = useState(null);
  const mrFileRef = useRef(null);

  // Browse (guest): quick analysis
  const [qBusy, setQBusy] = useState(false);
  const [qDrag, setQDrag] = useState(false);
  const qFileRef = useRef(null);

  // Categorize modal
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [catModalSel, setCatModalSel] = useState({});
  const [catOverwrite, setCatOverwrite] = useState(false);
  const [catBusy, setCatBusy] = useState(false);
  const [allCatOpts, setAllCatOpts] = useState({});

  // Misc chrome
  const [adminOpen, setAdminOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [fbOpen, setFbOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [__relOpen, __setRelOpen] = useState(false);
  const __hcriRelated = (typeof window !== 'undefined' && window.__hcriRelated) || [];

  // Back-button support (see ../hooks/usePanelBackClose.js) for the real
  // "screens" above -- panels a user would expect the back button to
  // step out of, as opposed to inline toggles like the quick-analysis
  // accordion (anaOpen) or the folder-menu dropdown (folderMenuOpen).
  // The open report also tags its history entry with its id (`rid`) in
  // the URL, not just the generic marker usePanelBackClose pushes by
  // default -- so refreshing (or sharing the URL) while a report is open
  // lands back on that same report instead of the bare tab underneath it.
  // See the mount effect below that restores `ee` from `?rid=`, and
  // claimPanel's comment in panelHistory.js for why closing a RESTORED
  // report (one the page loaded with already, not one opened by a click
  // in this session) rewrites the URL instead of calling history.back().
  usePanelBackClose(!!ee, () => F(null), () => {
    const base = exploreTabUrl(tab);
    const rid = ee && ee.id;
    return {
      state: { hcri: 1, view: 'explore', etab: tab, rid },
      url: base + '&rid=' + rid,
      closedState: { hcri: 1, view: 'explore', etab: tab },
      closedUrl: base,
    };
  });
  usePanelBackClose(comparing, () => setComparing(false));
  usePanelBackClose(catModalOpen, () => setCatModalOpen(false));
  usePanelBackClose(mrPasteOpen, () => setMrPasteOpen(false));
  usePanelBackClose(adminOpen, () => setAdminOpen(false));
  usePanelBackClose(helpOpen, () => setHelpOpen(false));
  usePanelBackClose(fbOpen, () => setFbOpen(false));
  usePanelBackClose(profileOpen, () => setProfileOpen(false));

  const setDuv = _setDuv;

  // ── Data fetch ───────────────────────────────────────────────────────────
  const L = useCallback(async (page = 1, _rt = 0) => {
    P(true);
    const _my = tab === 'myreports' && !filtersTouched;
    const t = new URLSearchParams({
      q: c,
      page,
      perPage: vAll ? 5000 : perPageRef.current,
      all: vAll ? '1' : '',
      cctMin: _my ? 0 : d[0],
      cctMax: _my ? 999999 : d[1],
      duvMin: _my ? -1 : h[0],
      duvMax: _my ? 1 : h[1],
      rfMin: _my ? -100 : v,
      rgMin: _my ? 0 : b[0],
      rgMax: _my ? 999 : b[1],
      r9Min: _my ? -1000 : S[0],
      r9Max: _my ? 1000 : S[1],
      raMin: _my ? 0 : raR[0],
      raMax: _my ? 1000 : raR[1],
      lumMin: _my ? 0 : lumR[0],
      lumMax: _my ? 999999 : lumR[1],
      curMin: _my ? 0 : curR[0],
      curMax: _my ? 999999 : curR[1],
      userId: tab === 'myreports' ? (n && n.id) || '' : (userSel || []).join(','),
      folderId: tab === 'myreports' ? (folderSel == null ? 'none' : folderSel) : '',
      sort: sortBy,
      order: sortOrder,
      tint: _my ? '' : tintSel.join(','),
    });
    if (!_my) {
      Object.keys(catSel).forEach((key) => {
        const vals = catSel[key];
        if (vals && vals.length) t.append(key, vals.join(','));
      });
    }
    window.__exploreQ = `${t}`;
    try {
      const res = await fetch(`${EXPLORE_API}?${t}`, { cache: 'no-store', headers: authHeaders() });
      const j = await res.json();
      E(j.reports || []);
      O(j.total || 0);
      A(j.page || 1);
      M(j.pages || 1);
      if ((j.page || 1) === 1) {
        setTimeout(() => {
          try {
            const g = isDesktopViewport() ? null : document.querySelector('[data-expgrid]');
            g ? g.scrollIntoView({ behavior: 'smooth', block: 'start' }) : window.scrollTo({ top: 0, behavior: 'smooth' });
          } catch {}
        }, 0);
      }
      setCatOpts(j.categoryOptions || {});
      setUserOpts(j.userOptions || []);
      if (j.ranges) {
        const scopeKey = tab === 'myreports'
          ? 'u' + ((n && n.id) || '') + ':f' + (folderSel == null ? '-' : folderSel)
          : 'e' + (userSel || []).join(',');
        if (rngScope.current !== scopeKey) {
          rngScope.current = scopeKey;
          rngInit.current = false;
          setRng(j.ranges);
          fetch(`${EXPLORE_API}?` + new URLSearchParams({
            page: 1, perPage: 1, cctMin: 0, cctMax: 999999, duvMin: -1, duvMax: 1, rfMin: -100,
            rgMin: 0, rgMax: 999, r9Min: -1000, r9Max: 1000, raMin: 0, raMax: 1000, lumMin: 0,
            lumMax: 999999, curMin: 0, curMax: 999999,
            userId: tab === 'myreports' ? (n && n.id) || '' : (userSel || []).join(','),
            folderId: tab === 'myreports' ? (folderSel == null ? 'none' : folderSel) : '',
            sort: 'date', order: 'desc', tint: '',
          }), { cache: 'no-store', headers: authHeaders() })
            .then((r0) => r0.json())
            .then((jj) => setUnfTotal(jj.total || 0))
            .catch(() => {});
        }
      }
      P(false);
    } catch (err) {
      if (_rt < 2) { setTimeout(() => L(page, _rt + 1), 900); return; }
      console.error(err);
      P(false);
    }
  }, [c, d, h, v, b, S, raR, catSel, sortBy, sortOrder, tintSel, lumR, curR, userSel, tab, n, vAll, folderSel, filtersTouched]);

  useEffect(() => { perPageRef.current = perPage; }, [perPage]);

  // Mint share tokens lazily for private reports pulled into a comparison.
  useEffect(() => {
    let dead = false;
    const pending = (cmpData || []).filter((x) => x && x.private && !x.shareToken);
    if (!pending.length) return;
    Promise.all((cmpData || []).map(async (x) => {
      if (!x || !x.private || x.shareToken) return x;
      try {
        const rr = await (await fetch(`./index.php/api/reports/${x.id}`, {
          method: 'PATCH', headers: authHeaders(true), body: JSON.stringify({ shareAction: 'enable' }),
        })).json();
        if (rr && rr.shareToken) return { ...x, shareToken: rr.shareToken };
      } catch {}
      return x;
    })).then((next) => {
      if (dead) return;
      if (next.some((x, idx) => x !== (cmpData || [])[idx])) setCmpData(next);
    }).catch(() => {});
    return () => { dead = true; };
  }, [cmpData]);

  // Debounced re-fetch whenever L's identity changes (i.e. any filter/sort/tab/page input changed).
  useEffect(() => {
    if (lDebounceRef.current) clearTimeout(lDebounceRef.current);
    lDebounceRef.current = setTimeout(() => L(1), 300);
    return () => clearTimeout(lDebounceRef.current);
  }, [L]);

  // Remember the signed-in user's last "view all" preference per tab.
  useEffect(() => {
    try {
      const pv = tab === 'myreports' ? n && n.viewMyReports : n && n.viewExplore;
      setVAll(pv === 'all');
    } catch {}
  }, [tab, n]);

  useEffect(() => {
    try { if (tab === 'browse' || tab === 'myreports') localStorage.setItem('hcri_last_list', tab); } catch {}
  }, [tab]);

  // Back/forward support for the ?explore / ?explore=mine / ?explore=insights
  // URLs. The implicit "browse" entry created when Explore auto-opens after
  // login (App.jsx's post-login useEffect) never gets its own `?explore`
  // URL -- it's a bare `/` -- so going back to it can't be recognized from
  // the URL alone; fall back to the entry's history.state.etab (tagged by
  // __hcriClearFolderUrl/the tab-bar click handler) for that case.
  useEffect(() => {
    const onPop = (ev) => {
      try {
        const sp = new URLSearchParams(window.location.search);
        const explore = sp.get('explore');
        if (explore != null) {
          setTab(tabFromExploreVal(explore, !!n));
          return;
        }
        const st = (ev && ev.state) || window.history.state || {};
        if (st && st.view === 'explore' && st.etab) {
          setTab(tabFromExploreVal(st.etab === 'myreports' ? 'mine' : st.etab, !!n));
        }
      } catch {}
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [n]);

  // Measure the actual rendered grid to pick a perPage that fills the screen
  // without leaving a half-empty last row.
  useEffect(() => {
    let timer;
    const recalc = () => {
      const grids = document.querySelectorAll('[data-expgrid]');
      let g = null;
      for (let idx = 0; idx < grids.length; idx++) { if (grids[idx].clientWidth > 0) { g = grids[idx]; break; } }
      const W = g ? g.clientWidth : window.innerWidth, gap = 14, minC = 280;
      const cols = Math.max(1, Math.floor((W + gap) / (minC + gap)));
      let ch = g && g.firstElementChild ? g.firstElementChild.offsetHeight : 300;
      if (!(ch > 0)) ch = 300;
      const top = g ? g.getBoundingClientRect().top : 170;
      const avail = Math.max(ch, window.innerHeight - top - 72);
      const rows = Math.max(1, Math.floor((avail + gap) / (ch + gap)));
      const pp = Math.max(cols, Math.min(cols * rows, 120));
      setPerPage((p) => (p === pp ? p : pp));
    };
    const onResize = () => { clearTimeout(timer); timer = setTimeout(recalc, 200); };
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => { raf2 = requestAnimationFrame(recalc); });
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      clearTimeout(timer);
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, [w]);

  // ── My Reports: uploads ──────────────────────────────────────────────────
  const uploadOneSilent = async (f) => {
    const fd = new FormData();
    fd.append('file', f);
    fd.append('label', f.name.replace(/\.[^.]+$/, ''));
    const resp = await fetch('./index.php/api/reports', { method: 'POST', headers: authHeaders(), body: fd });
    const j = await resp.json();
    if (!resp.ok) throw new Error((j && j.error) || 'Upload failed');
    return j;
  };

  const mrUpMany = async (fileList) => {
    const files = Array.from(fileList || []).filter(Boolean);
    if (!files.length) return;
    if (files.length === 1 && !/\.zip$/i.test(files[0].name)) return mrUp(files[0]);
    setMrBusy(true);
    let okCount = 0, failCount = 0;
    for (let idx = 0; idx < files.length; idx++) {
      const f = files[idx];
      setMrStatus(`Analyzing ${idx + 1} of ${files.length}…`);
      try {
        if (/\.zip$/i.test(f.name)) {
          const fd = new FormData();
          fd.append('file', f);
          const resp = await fetch('./index.php/api/reports', { method: 'POST', headers: authHeaders(), body: fd });
          const j = await resp.json();
          if (!resp.ok) throw new Error((j && j.error) || 'ZIP upload failed');
          okCount += (j.results || []).length;
          failCount += (j.errors || []).length;
        } else {
          await uploadOneSilent(f);
          okCount++;
        }
      } catch {
        failCount++;
      }
    }
    setMrStatus(failCount ? `Uploaded ${okCount}, ${failCount} failed — reloading…` : `Uploaded ${okCount} report${okCount === 1 ? '' : 's'} — reloading…`);
    try {
      window.history.replaceState({ hcri: 1, view: 'explore', etab: 'myreports' }, '', window.location.pathname + '?explore=mine');
    } catch {}
    setTimeout(() => window.location.reload(), 900);
  };

  const mrUp = async (f) => {
    if (!f) return;
    setMrBusy(true);
    try {
      const fd = new FormData();
      fd.append('file', f);
      fd.append('label', f.name.replace(/\.[^.]+$/, ''));
      const uRes = await fetch('./index.php/api/reports', { method: 'POST', headers: authHeaders(), body: fd });
      const uJson = await uRes.json().catch(() => ({}));
      if (!uRes.ok) throw new Error(uJson.error || uRes.statusText);
      const rid = uJson.id;
      let full = null;
      try { full = await fetch(`./index.php/api/reports/${rid}`, { headers: authHeaders(true) }).then((rr) => rr.json()); } catch {}
      if (n?.reportsDefaultPrivate && full && full.id && full.isPublic) {
        try {
          await fetch('./index.php/api/explore', { method: 'POST', headers: authHeaders(true), body: JSON.stringify({ id: rid, public: false }) });
        } catch {}
        full.isPublic = false;
        full.private = true;
      }
      const next = full && full.id ? { ...full, userId: n?.id } : { ...uJson, userId: n?.id };
      E((p) => [next, ...(p || []).filter((x) => x.id !== rid)]);
      rngScope.current = null;
      const needsReset = tab !== 'myreports' || folderSel != null;
      if (folderSel != null) setFolderSel(null);
      if (tab !== 'myreports') {
        setTab('myreports');
        try { window.history.replaceState({ hcri: 1, view: 'explore', etab: 'myreports' }, '', window.location.pathname + '?explore=mine'); } catch {}
      }
      if (!needsReset) L(1);
      F(next);
    } catch (e) {
      alert('Upload error: ' + ((e && e.message) || e));
    } finally {
      setMrBusy(false);
    }
  };

  const mrDel = async (rep) => {
    if (!rep || !window.confirm(`Delete "${rep.label || 'this report'}"? This cannot be undone.`)) return;
    try {
      const resp = await fetch(`./index.php/api/reports/${rep.id}`, { method: 'DELETE', headers: authHeaders() });
      if (!resp.ok) {
        const j = await resp.json().catch(() => ({}));
        throw new Error(j.error || resp.statusText);
      }
      L(w.length <= 1 && k > 1 ? k - 1 : k);
    } catch (e) {
      alert('Delete failed: ' + ((e && e.message) || e));
    }
  };

  const bulkDelete = async () => {
    if (tab !== 'myreports') return;
    const mine = cmpSel.filter((x) => n && x.userId == n.id);
    const cnt = mine.length;
    if (!cnt) return;
    if (!window.confirm(`Delete ${cnt} report${cnt === 1 ? '' : 's'} permanently? This cannot be undone.`)) return;
    const ids = mine.map((x) => x.id);
    setCmpBusy(true);
    let failed = 0;
    for (const id of ids) {
      try {
        const resp = await fetch(`./index.php/api/reports/${id}`, { method: 'DELETE', headers: authHeaders() });
        if (!resp.ok) failed++;
      } catch { failed++; }
    }
    setCmpBusy(false);
    setCmpSel([]);
    E((p) => p.filter((x) => !ids.includes(x.id)));
    L(w.filter((x) => !ids.includes(x.id)).length === 0 && k > 1 ? k - 1 : k);
    if (failed) alert(`${failed} report${failed === 1 ? '' : 's'} could not be deleted.`);
  };

  // ── Categorize modal ─────────────────────────────────────────────────────
  const loadAllCategories = async () => {
    try {
      const j = await (await fetch('./index.php/api/categories', { headers: authHeaders() })).json();
      if (j && typeof j === 'object') setAllCatOpts(j);
    } catch {}
  };

  const submitCategorize = async () => {
    const values = {};
    Object.keys(catModalSel).forEach((k2) => {
      const ids = catModalSel[k2] || [];
      if (!ids.length) return;
      const opts = allCatOpts[k2] || [];
      const vals = ids.map((id) => { const match = opts.find((x) => String(x.id) === String(id)); return match ? match.value : null; }).filter(Boolean);
      if (vals.length) values[k2] = vals;
    });
    if (!Object.keys(values).length) { setCatModalOpen(false); return; }
    setCatBusy(true);
    try {
      const resp = await fetch('./index.php/api/categories/bulk_assign', {
        method: 'POST', headers: authHeaders(true),
        body: JSON.stringify({ reportIds: cmpSel.map((x) => x.id), values, overwrite: catOverwrite }),
      });
      const j = await resp.json();
      if (!resp.ok) throw new Error((j && j.error) || 'Categorize failed');
      setCatModalOpen(false);
      setCatModalSel({});
      setCatOverwrite(false);
      setCmpSel([]);
      L(k);
    } catch (e) {
      alert('Categorize failed: ' + ((e && e.message) || e));
    }
    setCatBusy(false);
  };

  // ── Folders ──────────────────────────────────────────────────────────────
  const loadFolders = async () => {
    try {
      const fs = await (await fetch('./index.php/api/folders', { headers: authHeaders() })).json();
      if (Array.isArray(fs)) setFolders(fs);
    } catch {}
  };

  const createFolder = async (nm) => {
    nm = (nm || '').trim();
    if (!nm) return null;
    setFolderBusy(true);
    try {
      const f = await (await fetch('./index.php/api/folders', { method: 'POST', headers: authHeaders(true), body: JSON.stringify({ name: nm }) })).json();
      if (f && f.id) {
        setFolders((p) => (p.some((x) => x.id === f.id) ? p : [...p, f].sort((a2, b2) => a2.name.localeCompare(b2.name))));
        return f.id;
      }
    } catch {
    } finally {
      setFolderBusy(false);
    }
    return null;
  };

  const assignFolderMany = async (ids, fid) => {
    ids = (Array.isArray(ids) ? ids : [ids]).filter(Boolean);
    if (!ids.length) return;
    const okIds = [];
    for (const repId of ids) {
      try {
        await fetch(`./index.php/api/reports/${repId}`, { method: 'PATCH', headers: authHeaders(true), body: JSON.stringify({ folder_id: fid }) });
        okIds.push(repId);
      } catch {}
    }
    if (okIds.length) {
      if (ee && okIds.includes(ee.id)) F((t) => ({ ...t, folderId: fid }));
      setCmpSel((p) => p.filter((x) => !okIds.includes(x.id)));
      rngScope.current = null;
      const willEmptyFolder = folderSel != null && w.filter((x) => !okIds.includes(x.id)).length === 0;
      if (willEmptyFolder) {
        await loadFolders();
        __hcriClearFolderUrl();
        setFolderSel(null);
        if (onHardResetFn) onHardResetFn(); else L(1);
      } else {
        await Promise.all([loadFolders(), L(k)]);
      }
    }
  };

  const reorderFolders = async (ids) => {
    try {
      await fetch('./index.php/api/folders/reorder', { method: 'POST', headers: authHeaders(true), body: JSON.stringify({ folderIds: ids }) });
    } catch {}
  };

  const onFolderTileDrop = (targetId) => {
    const draggedId = dragFolderRef.current;
    dragFolderRef.current = null;
    if (draggedId == null || draggedId === targetId) { setDragOverFolder(null); return; }
    setFolders((prev) => {
      const arr = [...prev];
      const fromIdx = arr.findIndex((f) => f.id === draggedId), toIdx = arr.findIndex((f) => f.id === targetId);
      if (fromIdx < 0 || toIdx < 0) return prev;
      const moved = arr.splice(fromIdx, 1)[0];
      arr.splice(toIdx, 0, moved);
      reorderFolders(arr.map((f) => f.id));
      return arr;
    });
    setDragOverFolder(null);
  };

  const deleteFolder = async (fid) => {
    if (!window.confirm('Delete this folder? Reports inside will move back to uncategorized.')) return;
    try {
      await fetch(`./index.php/api/folders/${fid}`, { method: 'DELETE', headers: authHeaders() });
      setFolders((p) => p.filter((f) => f.id !== fid));
      // Deleting the folder you're currently viewing exits it too -- also
      // strip the now-stale `folder` param it left in the URL (same as
      // leaving via "← My Reports"), or a refresh would 404/land on an
      // empty "folder" that no longer exists.
      if (folderSel === fid) { __hcriClearFolderUrl(); setFolderSel(null); } else L(k);
    } catch {}
  };

  useEffect(() => { if (tab === 'myreports' && n) loadFolders(); }, [tab, n]);

  // Called (via __hcriResetListView) both when leaving a folder within My
  // Reports (its original purpose -- `tab` really is 'myreports' then)
  // and, more broadly, at the start of EVERY tab-bar click, to strip a
  // stale `folder` param before the click handler pushes a new entry for
  // the tab being switched TO. This replaces the CURRENT (about-to-be-left)
  // entry's state, so it must tag it with the tab being left (`tab`, still
  // the pre-switch value here since this runs before setTab) -- not always
  // 'myreports'. Hardcoding that used to corrupt the previous tab's entry
  // (e.g. leaving Explore for My Reports relabeled the Explore entry as
  // 'myreports' too), so pressing back from My Reports landed back on
  // My Reports instead of Explore. See tests/back-button.spec.js.
  const __hcriClearFolderUrl = () => {
    try {
      const sp = new URLSearchParams(window.location.search);
      sp.delete('folder');
      const q = sp.toString();
      window.history.replaceState({ hcri: 1, view: 'explore', etab: tab }, '', window.location.pathname + (q ? '?' + q : ''));
    } catch {}
  };
  const __hcriResetListView = () => {
    __hcriClearFolderUrl();
    setCmpSel([]);
    setFolderSel(null);
    setFiltersTouched(false);
    u('');
    A(1);
    F(null);
  };

  const _tabEffFirst = useRef(true);
  useEffect(() => {
    if (_tabEffFirst.current) { _tabEffFirst.current = false; return; }
    setCmpSel([]);
    setFolderSel(null);
    setFiltersTouched(false);
    u('');
  }, [tab]);

  // ── Browse (guest): quick analysis ──────────────────────────────────────
  const qUp = async (f) => {
    if (!f) return;
    setQBusy(true);
    try {
      const fd = new FormData();
      fd.append('file', f);
      fd.append('label', f.name.replace(/\.[^.]+$/, ''));
      const uRes = await fetch('./index.php/api/guest_analyze', { method: 'POST', body: fd });
      const uJson = await uRes.json();
      if (!uRes.ok) throw new Error(uJson.error || uRes.statusText);
      F(uJson);
    } catch (e) {
      alert('Analysis failed: ' + ((e && e.message) || e));
    } finally {
      setQBusy(false);
    }
  };

  useEffect(() => { try { localStorage.setItem('explore_pinned', ePin); } catch {} }, [ePin]);

  // Seed the filter sliders from the server's data-aware ranges once per scope.
  useEffect(() => {
    if (rng && !rngInit.current) {
      rngInit.current = true;
      m([rng.cct[0], rng.cct[1]]);
      setDuv([rng.duv[0], rng.duv[1]]);
      x([rng.rg[0], rng.rg[1]]);
      y(rng.rf[0]);
      C([rng.r9[0], rng.r9[1]]);
      setRaR(rng.ra ? [rng.ra[0], rng.ra[1]] : [0, 100]);
    }
  }, [rng]);

  const activateFilters = () => {
    if (!filtersTouched) {
      if (rng) {
        m([rng.cct[0], rng.cct[1]]);
        setDuv([rng.duv[0], rng.duv[1]]);
        y(rng.rf[0]);
        x([rng.rg[0], rng.rg[1]]);
        C([rng.r9[0], rng.r9[1]]);
        setRaR(rng.ra ? [rng.ra[0], rng.ra[1]] : [0, 100]);
      }
      setFiltersTouched(true);
    }
  };

  const resetFilters = () => {
    u('');
    m(rng ? [rng.cct[0], rng.cct[1]] : [1000, 10000]);
    setDuv(rng ? [rng.duv[0], rng.duv[1]] : [-0.02, 0.02]);
    y(rng ? rng.rf[0] : 0);
    x(rng ? [rng.rg[0], rng.rg[1]] : [80, 130]);
    C(rng ? [rng.r9[0], rng.r9[1]] : [-100, 100]);
    setRaR(rng && rng.ra ? [rng.ra[0], rng.ra[1]] : [0, 100]);
    setCatSel({});
    setTintSel([]);
    setSortBy('date');
    setSortOrder('desc');
    setUserSel('');
    setFiltersTouched(false);
    A(1);
  };

  // ── Compare: open from a ?compare= link ─────────────────────────────────
  useEffect(() => {
    try {
      const p = new URLSearchParams(window.location.search).get('compare');
      if (!p) return;
      const ids = p.split(',').map((x) => { const q = x.split('.'); return { id: parseInt(q[0], 10), t: q[1] || '' }; })
        .filter((x) => x.id > 0).slice(0, 12);
      if (!ids.length) return;
      setComparing(true);
      setCmpView('cards');
      setCmpBusy(true);
      Promise.all(ids.map((en) => fetch(`./index.php/api/explore/${en.id}` + (en.t ? `?t=${en.t}` : ''), { headers: authHeaders() })
        .then((x) => x.json()).then((d2) => (d2 && d2.id ? d2 : null)).catch(() => null)))
        .then((rs) => {
          const vv = rs.filter(Boolean);
          setCmpData(vv);
          setCmpSel(vv);
          setCmpBusy(false);
        });
    } catch {}
  }, []);

  const openCompare = async () => {
    if (cmpSel.length < 2) return;
    setComparing(true);
    setCmpView('cards');
    setCmpBusy(true);
    try {
      const ds = await Promise.all(cmpSel.map(async (r0) => {
        try {
          const d2 = await (await fetch(`./index.php/api/explore/${r0.id}`, { headers: authHeaders() })).json();
          return d2 && d2.id ? d2 : r0;
        } catch { return r0; }
      }));
      setCmpData(ds);
    } catch {
      setCmpData(cmpSel);
    }
    setCmpBusy(false);
  };

  const shareCmpFull = async () => {
    if (!cmpFull) return;
    try {
      let rep = cmpFull;
      if (rep.private && !rep.shareToken) {
        const rr = await (await fetch(`./index.php/api/reports/${rep.id}`, { method: 'PATCH', headers: authHeaders(true), body: JSON.stringify({ shareAction: 'enable' }) })).json();
        if (rr && rr.shareToken) {
          rep = { ...rep, shareToken: rr.shareToken };
          setCmpFull(rep);
          setCmpData((cd) => cd.map((x) => (x.id === rep.id ? { ...x, shareToken: rr.shareToken } : x)));
        }
      }
      const u2 = rep.private && rep.shareToken
        ? `${window.location.origin}${window.location.pathname}?share=${rep.shareToken}`
        : `${window.location.origin}${window.location.pathname}?report=${rep.id}`;
      navigator.clipboard && navigator.clipboard.writeText(u2);
      setCmpFullCopied(true);
      setTimeout(() => setCmpFullCopied(false), 1500);
    } catch {}
  };

  const copyCompareLink = () => {
    const mk = (arr) => `${window.location.origin}${window.location.pathname}?compare=` +
      arr.map((x) => (x.private && x.shareToken ? `${x.id}.${x.shareToken}` : String(x.id))).join(',');
    const pending = (cmpData || []).some((x) => x && x.private && !x.shareToken);
    if (!pending) {
      try {
        navigator.clipboard && navigator.clipboard.writeText(mk(cmpData));
        setCmpCopied(true);
        setTimeout(() => setCmpCopied(false), 1500);
      } catch {}
      return;
    }
    (async () => {
      try {
        const next = await Promise.all(cmpData.map(async (x) => {
          if (!x.private || x.shareToken) return x;
          try {
            const rr = await (await fetch(`./index.php/api/reports/${x.id}`, { method: 'PATCH', headers: authHeaders(true), body: JSON.stringify({ shareAction: 'enable' }) })).json();
            if (rr && rr.shareToken) return { ...x, shareToken: rr.shareToken };
          } catch {}
          return x;
        }));
        setCmpData(next);
        navigator.clipboard && navigator.clipboard.writeText(mk(next));
        setCmpCopied(true);
        setTimeout(() => setCmpCopied(false), 1500);
      } catch {}
    })();
  };

  const revokeCompareShare = async () => {
    if (!window.confirm('Stop sharing the private report(s) in this comparison? Anyone you sent the link to will lose access.')) return;
    try {
      const mine = cmpData.filter((x) => x.private && x.shareToken && x.userId == n.id);
      await Promise.all(mine.map((x) => fetch(`./index.php/api/reports/${x.id}`, { method: 'PATCH', headers: authHeaders(true), body: JSON.stringify({ shareAction: 'disable' }) })));
      setCmpData(cmpData.map((x) => (x.private && x.userId == n.id ? { ...x, shareToken: null } : x)));
    } catch {}
  };

  const showCompareShareCard = () => {
    try {
      const view = cmpView === 'overlay' ? 'overlay' : 'cards';
      const picked = cmpPick.length ? cmpData.filter((x) => cmpPick.includes(x.id)) : [];
      const chosen = view === 'overlay' ? cmpData : (picked.length ? picked.slice(0, 3) : cmpData.slice(0, 3));
      const cv = compareShareCard(chosen, view, r);
      if (cv) {
        setCmpCardW(view === 'overlay' ? 820 : 440);
        setCmpCardUrl(cv.toDataURL('image/png'));
      }
    } catch {}
  };

  // ── "Filtered Set Summary" iframe overlay ───────────────────────────────
  const openFilteredSummary = async () => {
    try {
      const ov = document.createElement('div');
      ov.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.72);z-index:10000;display:flex;align-items:center;justify-content:center;padding:20px';
      const pn = document.createElement('div');
      pn.style.cssText = `background:${r.bg};border:1px solid ${r.border};border-radius:12px;width:97%;max-width:1200px;height:93vh;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 12px 48px rgba(0,0,0,0.5)`;
      const bar = document.createElement('div');
      bar.style.cssText = `display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px 14px;border-bottom:1px solid ${r.border};flex:0 0 auto`;
      const tt = document.createElement('div');
      tt.textContent = 'Filtered Set Summary';
      tt.style.cssText = `font-weight:700;font-family:monospace;color:${r.text}`;
      const rt = document.createElement('div');
      rt.style.cssText = 'display:flex;gap:8px';
      const cp = document.createElement('button');
      cp.textContent = '🔗 Copy link';
      cp.disabled = true;
      cp.style.cssText = `height:30px;padding:0 12px;background:${r.accent}15;border:1.5px solid ${r.accent}40;color:${r.accent};border-radius:6px;font-family:monospace;font-size:12px;font-weight:600;cursor:pointer;opacity:0.45`;
      const xb = document.createElement('button');
      xb.textContent = '✕';
      xb.style.cssText = `height:30px;width:34px;background:none;border:1.5px solid ${r.border};color:${r.text};border-radius:6px;font-size:14px;cursor:pointer`;
      const bd = document.createElement('div');
      bd.style.cssText = `flex:1;display:flex;align-items:center;justify-content:center;color:${r.text};opacity:0.7;font-family:monospace;font-size:14px`;
      bd.textContent = 'Preparing summary…';
      function cl() { if (ov.parentNode) ov.parentNode.removeChild(ov); document.removeEventListener('keydown', kf); }
      function kf(e) { if (e.key === 'Escape') cl(); }
      xb.onclick = cl;
      ov.onclick = (e) => { if (e.target === ov) cl(); };
      document.addEventListener('keydown', kf);
      rt.appendChild(cp); rt.appendChild(xb);
      bar.appendChild(tt); bar.appendChild(rt);
      pn.appendChild(bar); pn.appendChild(bd);
      ov.appendChild(pn);
      document.body.appendChild(ov);
      const tk = (() => { try { return localStorage.getItem('spd_token') || ''; } catch { return ''; } })();
      const resp = await fetch(`./index.php/api/explore?summary=1&build=1&${window.__exploreQ || ''}`, { headers: { Authorization: 'Bearer ' + tk } })
        .then((x) => x.json()).catch(() => null);
      const listStr = resp && resp.list ? resp.list : '';
      if (!listStr) { bd.textContent = 'No reports match the current filter.'; return; }
      const b2 = new URL('summary', location.href);
      const shareU = b2.href + '?r=' + listStr;
      const frameU = b2.href + '?r=' + listStr + '&embed=1';
      const fr = document.createElement('iframe');
      fr.src = frameU;
      fr.style.cssText = `flex:1;width:100%;border:none;background:${r.bg}`;
      pn.replaceChild(fr, bd);
      cp.disabled = false;
      cp.style.opacity = '1';
      cp.onclick = () => {
        try {
          navigator.clipboard.writeText(shareU);
          const t = cp.textContent;
          cp.textContent = '✓ Copied';
          setTimeout(() => { cp.textContent = t; }, 1500);
        } catch {}
      };
    } catch {}
  };

  // ── Shared styles ────────────────────────────────────────────────────────
  const btn = (color = 'accent') => ({
    background: `${r[color] || r.accent}20`, border: `1.5px solid ${r[color] || r.accent}`, color: r[color] || r.accent,
    borderRadius: 6, padding: '7px 16px', fontSize: 13, cursor: 'pointer', fontFamily: 'monospace', fontWeight: 700,
  });

  // A small square icon-only button -- used in place of a labeled one
  // where mobile space is tight (e.g. compareBar's Clear/Delete on
  // mobile). Pass a title/aria-label at the call site.
  const iconBtn = () => ({
    background: 'none', border: `1px solid ${r.border}`, color: r.dim, borderRadius: 6,
    width: 32, height: 32, padding: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 15, lineHeight: 1, cursor: 'pointer', flexShrink: 0,
  });

  // Closing the open-report view (the "← Back to Explore" button, or the
  // browser back button via usePanelBackClose below -- both just flip `ee`
  // back to null; back-button support owns the actual history navigation,
  // see the comment on that hook call).
  const goBackFromReport = () => {
    F(null);
    L(k);
  };

  const openReport = async (e) => {
    try {
      const t = await (await fetch(`./index.php/api/explore/${e.id}`, { headers: authHeaders() })).json();
      F(t.id ? t : e);
      if (!ePin) setEOpen(false);
    } catch {
      F(e);
    }
  };

  // Restore an open report from `?rid=` on mount -- a refresh while
  // viewing one, or a bookmarked/shared link straight into it. Loads the
  // same way a card click does; usePanelBackClose's pushArgs above
  // recognizes the URL is already there and claims the existing history
  // entry instead of pushing a redundant one (see claimPanel's comment in
  // panelHistory.js).
  useEffect(() => {
    try {
      const rid = new URLSearchParams(window.location.search).get('rid');
      if (rid) openReport({ id: Number(rid) });
    } catch {}
  }, []);

  const onDragStartReport = (ev, rep) => {
    const ids = cmpSel.some((x) => x.id === rep.id) ? cmpSel.map((x) => x.id) : [rep.id];
    dragRepRef.current = ids;
    try {
      ev.dataTransfer.effectAllowed = 'move';
      ev.dataTransfer.setData('text/plain', ids.join(','));
    } catch {}
  };

  const toggleCmpSel = (e) => setCmpSel((p) => {
    const already = p.some((x) => x.id === e.id);
    return already ? p.filter((x) => x.id !== e.id) : (p.length >= 12 ? p : [...p, e]);
  });

  // Common props for the two <FilterPanel> / <ResultsPanel> call sites.
  const filterPanelProps = {
    T: r, isMobile: o, isMyReportsTab: tab === 'myreports', btn,
    search: c, onSearch: (val) => { activateFilters(); u(val); A(1); },
    userOpts, userSel, onUserSel: (a2) => { activateFilters(); setUserSel(a2); A(1); },
    catOpts, catSel, onCatSel: (key, a2) => { activateFilters(); setCatSel((z) => ({ ...z, [key]: a2 })); A(1); },
    rng,
    cct: d, onCct: (e) => { activateFilters(); m(e); A(1); },
    duv: h, onDuv: (e) => { activateFilters(); setDuv(e); A(1); },
    ra: raR, onRa: (e) => { activateFilters(); setRaR(e); A(1); },
    tintSel, onToggleTint: (k2) => { activateFilters(); setTintSel((p) => (p.includes(k2) ? p.filter((z) => z !== k2) : [...p, k2])); A(1); },
    minRf: v, onMinRf: (val) => { activateFilters(); y(val); A(1); },
    rg: b, onRg: (e) => { activateFilters(); x(e); A(1); },
    r9: S, onR9: (e) => { activateFilters(); C(e); A(1); },
    onReset: resetFilters,
    resultCount: D,
    onShowResults: () => te(false),
  };

  const resultsPanelProps = {
    T: r, isMobile: o, btn,
    vAll, setVAll, total: D, unfilteredTotal: unfTotal, loading: N,
    isMyReportsTab: tab === 'myreports', items: w, currentUserId: n && n.id,
    cmpSel, onSelectAllVisible: () => setCmpSel(w.slice(0, 12)), onClearSel: () => setCmpSel([]), onToggleSel: toggleCmpSel,
    sortBy, onSortBy: (val) => { setSortBy(val); A(1); }, sortOrder, onToggleSortOrder: () => { setSortOrder((ord) => (ord === 'asc' ? 'desc' : 'asc')); A(1); },
    page: k, pages: j, onPage: (p2) => L(p2),
    onOpenReport: openReport, onDeleteReport: mrDel, onDragStartReport,
  };

  // Shared header-bar buttons (profile / theme / admin / related / help / feedback / sign out).
  const chromeButtons = (extra) => (
    <Fragment>
      {extra}
      {n && (
        <button onClick={() => setProfileOpen(true)} title="Profile & settings" style={{
          height: 34, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box',
          background: `${r.accent}15`, border: `1.5px solid ${r.accent}40`, color: r.accent, borderRadius: 6,
          padding: '6px 12px', fontSize: 13, cursor: 'pointer', fontFamily: 'monospace', fontWeight: 700, whiteSpace: 'nowrap',
        }}>
          {o ? '👤' : `👤 ${n.name || 'Profile'}`}
        </button>
      )}
      <button onClick={a} title="Toggle light/dark" style={{
        height: 34, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box',
        background: 'none', border: `1.5px solid ${r.border}`, color: r.text, borderRadius: 6, padding: '6px 10px', fontSize: 16, cursor: 'pointer',
      }}>
        {s ? '☀' : '🌙'}
      </button>
      {n && n.isAdmin && (
        <button onClick={() => setAdminOpen(true)} title="Admin" style={{
          height: 34, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box',
          background: 'none', border: `1.5px solid ${r.border}`, color: '#ffaa00', borderRadius: 6, padding: '6px 10px', fontSize: 16, cursor: 'pointer',
        }}>
          ⚙
        </button>
      )}
      {!!(__hcriRelated && __hcriRelated.length) && (
        <div style={{ position: 'relative', display: 'inline-flex' }}>
          <button onClick={() => __setRelOpen((v2) => !v2)} title="Related links" style={{
            height: 34, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box',
            background: __relOpen ? `${r.accent}18` : 'none', border: `1.5px solid ${__relOpen ? r.accent : r.border}`,
            color: r.text, borderRadius: 6, padding: '6px 10px', fontSize: 14, cursor: 'pointer',
          }}>
            🔗
          </button>
          {__relOpen && <div onClick={() => __setRelOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 60 }} />}
          {__relOpen && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 6px)', right: 0, zIndex: 61, background: r.surface,
              border: `1px solid ${r.border}`, borderRadius: 8, padding: 8, minWidth: 210,
              boxShadow: '0 6px 24px rgba(0,0,0,0.35)', display: 'flex', flexDirection: 'column', gap: 2,
            }}>
              <div style={{ fontSize: 10, color: r.dim, textTransform: 'uppercase', letterSpacing: 0.8, fontWeight: 700, padding: '2px 8px 6px' }}>Related</div>
              {__hcriRelated.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => __setRelOpen(false)}
                  onMouseEnter={(ev) => { ev.currentTarget.style.background = `${r.accent}18`; }}
                  onMouseLeave={(ev) => { ev.currentTarget.style.background = 'transparent'; }}
                  style={{ display: 'block', textDecoration: 'none', color: r.text, padding: '7px 8px', fontSize: 13, fontFamily: 'monospace', borderRadius: 6, background: 'transparent', whiteSpace: 'nowrap' }}
                >
                  {link.label}
                </a>
              ))}
            </div>
          )}
        </div>
      )}
      <button onClick={() => setHelpOpen(true)} title="Help & Reference" style={{
        height: 34, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box',
        background: 'none', border: `1.5px solid ${r.border}`, color: r.text, borderRadius: 6, padding: '6px 11px', fontSize: 14, cursor: 'pointer', fontFamily: 'monospace', fontWeight: 700,
      }}>
        ?
      </button>
      <button onClick={() => setFbOpen(true)} title="Send feedback" style={{
        height: 34, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box',
        background: 'none', border: `1.5px solid ${r.border}`, color: r.text, borderRadius: 6, padding: '6px 10px', fontSize: 15, cursor: 'pointer',
      }}>
        ✉
      </button>
      {n && onLogoutFn && (
        <button onClick={onLogoutFn} title="Sign out" style={{
          height: 34, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box',
          background: 'none', border: `1.5px solid ${r.border}`, color: r.dim, borderRadius: 6, padding: '6px 12px', fontSize: 13,
          cursor: 'pointer', fontFamily: 'monospace', fontWeight: 600, marginRight: vAll ? 92 : 0,
        }}>
          Sign Out
        </button>
      )}
    </Fragment>
  );

  // Folder menu for the detail-view toolbar (myreports, viewing own report).
  const folderMenu = ee && tab === 'myreports' && n && ee.userId == n.id && (
    <div style={{ position: 'relative' }}>
      <button onClick={() => setFolderMenuOpen((v2) => !v2)} style={btn()}>
        📁 {ee.folderId ? (folders.find((fo) => fo.id === ee.folderId) || {}).name || 'Folder' : 'Choose folder'}
      </button>
      {folderMenuOpen && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 50, background: r.surface,
          border: `1px solid ${r.border}`, borderRadius: 8, padding: 8, minWidth: 190, boxShadow: '0 6px 24px rgba(0,0,0,0.35)',
          display: 'flex', flexDirection: 'column', gap: 4,
        }}>
          {ee.folderId && (
            <button onClick={async () => { await assignFolderMany([ee.id], null); setFolderMenuOpen(false); }}
              style={{ background: 'none', border: 'none', textAlign: 'left', color: r.dim, padding: '6px 8px', fontSize: 13, fontFamily: 'monospace', cursor: 'pointer', borderRadius: 6 }}>
              ✕ Remove from folder
            </button>
          )}
          {folders.map((fo) => (
            <button key={fo.id} onClick={async () => { await assignFolderMany([ee.id], fo.id); setFolderMenuOpen(false); }}
              style={{
                background: ee.folderId === fo.id ? `${r.accent}20` : 'none', border: 'none', textAlign: 'left', color: r.text,
                padding: '6px 8px', fontSize: 13, fontFamily: 'monospace', cursor: 'pointer', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 6,
              }}>
              📁{fo.name}
            </button>
          ))}
          <div style={{ display: 'flex', gap: 4, marginTop: 4, borderTop: `1px solid ${r.border}`, paddingTop: 6 }}>
            <input
              value={newFolderName}
              onChange={(ev) => setNewFolderName(ev.target.value)}
              placeholder="New folder…"
              onKeyDown={async (ev) => {
                if (ev.key === 'Enter') {
                  const id = await createFolder(newFolderName);
                  setNewFolderName('');
                  if (id) await assignFolderMany([ee.id], id);
                  setFolderMenuOpen(false);
                }
              }}
              style={{ flex: 1, background: r.bg, border: `1px solid ${r.border}`, borderRadius: 6, padding: '5px 7px', fontSize: 12, fontFamily: 'monospace', color: r.text, minWidth: 0, boxSizing: 'border-box' }}
            />
            <button
              disabled={folderBusy}
              onClick={async () => { const id = await createFolder(newFolderName); setNewFolderName(''); if (id) await assignFolderMany([ee.id], id); setFolderMenuOpen(false); }}
              style={{ background: r.accent, border: 'none', color: r.name === 'dark' ? '#06121f' : '#fff', borderRadius: 6, padding: '5px 9px', fontSize: 12, fontFamily: 'monospace', fontWeight: 700, cursor: 'pointer' }}
            >
              +
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const reportDetailView = ee && (
    <ReportDetail
      report={ee}
      allReports={[ee]}
      preview={!n}
      isGuest={!n || Number(ee.userId) !== Number(n.id)}
      onMetaSave={async (patch) => {
        F((t) => ({ ...t, ...patch }));
        try {
          await fetch(`./index.php/api/reports/${ee.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` }, body: JSON.stringify(patch) });
        } catch (e) { console.error(e); }
      }}
    />
  );

  const detailToolbar = (
    <div style={{ background: r.surface2, borderBottom: `1px solid ${r.border}`, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
      <button onClick={goBackFromReport} style={btn()}>
        {tab === 'myreports' ? (folderSel != null ? `← Back to ${(folders.find((fo) => fo.id === folderSel) || {}).name || 'Folder'}` : '← Back to My Reports') : '← Back to Explore'}
      </button>
      {folderMenu}
      {!o && !ePin && !eOpen && (
        <button onClick={() => { setEOpen(true); te(false); }} title="Show results list" style={{
          order: -1, marginRight: 8, background: 'none', border: `1px solid ${r.border}`, color: r.dim, borderRadius: 6,
          padding: '4px 10px', fontSize: 17, cursor: 'pointer', fontFamily: 'monospace', lineHeight: 1,
        }}>
          ☰
        </button>
      )}
      <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
        {chromeButtons(null)}
      </div>
    </div>
  );

  // ── Compare view ─────────────────────────────────────────────────────────
  const compareView = comparing && (
    <div style={{ position: 'fixed', inset: 0, background: r.bg, zIndex: 3000, overflowY: 'auto', padding: o ? 16 : 28, boxSizing: 'border-box' }}>
      {cmpFull && (
        <div onClick={() => setCmpFull(null)} style={{ position: 'fixed', inset: 0, zIndex: 3300, background: 'rgba(0,0,0,0.88)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: o ? 0 : 20, boxSizing: 'border-box', overflowY: 'auto' }}>
          <div onClick={(ev) => ev.stopPropagation()} style={{ width: '100%', maxWidth: 1100, background: r.bg, borderRadius: o ? 0 : 12, overflow: 'hidden', minHeight: o ? '100vh' : 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, padding: '10px 14px', borderBottom: `1px solid ${r.border}`, background: r.surface2, position: 'sticky', top: 0, zIndex: 2 }}>
              <button onClick={shareCmpFull} title="Copy share link" style={{ background: r.surface, border: `1px solid ${r.border}`, color: r.text, borderRadius: 8, padding: '0 14px', height: 36, fontSize: 13, cursor: 'pointer', fontFamily: 'monospace', fontWeight: 700 }}>
                {cmpFullCopied ? '✓ Copied' : '🔗 Share'}
              </button>
              <button onClick={a} title="Toggle light/dark" style={{ background: r.surface, border: `1px solid ${r.border}`, color: r.text, borderRadius: 8, width: 36, height: 36, padding: 0, cursor: 'pointer', fontSize: 16 }}>
                {i === 'dark' ? '☀' : '🌙'}
              </button>
              <button onClick={() => setCmpFull(null)} title="Close" style={{ background: r.surface, border: `1px solid ${r.border}`, color: r.text, borderRadius: 8, width: 36, height: 36, padding: 0, cursor: 'pointer', fontSize: 16, lineHeight: 1 }}>
                ✕
              </button>
            </div>
            <ReportDetail report={cmpFull} allReports={[cmpFull]} preview={!n} isGuest={!n || Number(cmpFull.userId) !== Number(n.id)} isShared />
          </div>
        </div>
      )}

      {cmpCardUrl && (
        o ? (
          <div style={{ position: 'fixed', inset: 0, zIndex: 2147483647, background: r.bg, display: 'flex', flexDirection: 'column' }}>
            <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 8, background: r.surface2, borderBottom: `1px solid ${r.border}`, padding: 'calc(env(safe-area-inset-top) + 10px) 12px 10px', boxSizing: 'border-box' }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: r.text, fontFamily: 'monospace' }}>Share Card</div>
              <div style={{ display: 'flex', gap: 8, width: '100%', boxSizing: 'border-box' }}>
                <a href={cmpCardUrl} download="hcri-comparison.png" style={{
                  background: r.accent, color: r.name === 'dark' ? '#060a0f' : '#ffffff', borderRadius: 6, padding: '12px 8px',
                  fontSize: 13, fontWeight: 700, fontFamily: 'monospace', textDecoration: 'none', flex: '1 1 0', minWidth: 0,
                  textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>
                  ↓ Download
                </a>
                <button onClick={() => setCmpCardUrl(null)} style={{ background: 'none', border: `1px solid ${r.border}`, color: r.dim, borderRadius: 6, padding: '12px 16px', fontSize: 13, cursor: 'pointer', fontFamily: 'monospace', fontWeight: 700, flexShrink: 0 }}>
                  ✕ Close
                </button>
              </div>
            </div>
            <div style={{ flex: '1 1 auto', minHeight: 0, overflow: 'auto', WebkitOverflowScrolling: 'touch', padding: 10, boxSizing: 'border-box' }}>
              <img src={cmpCardUrl} style={{ width: cmpCardW, maxWidth: '100%', borderRadius: 8, display: 'block', margin: '0 auto' }} />
            </div>
          </div>
        ) : (
          <div onClick={() => setCmpCardUrl(null)} style={{ position: 'fixed', inset: 0, zIndex: 2147483647, background: 'rgba(0,0,0,0.88)', overflow: 'auto', padding: 20, display: 'flex', alignItems: 'flex-start', justifyContent: 'center' }}>
            <div onClick={(ev) => ev.stopPropagation()} style={{ background: r.surface, border: `1px solid ${r.border}`, borderRadius: 12, padding: 16, maxWidth: 860, width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: r.text, fontFamily: 'monospace' }}>Share Card</div>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <a href={cmpCardUrl} download="hcri-comparison.png" style={{ background: r.accent, color: r.name === 'dark' ? '#060a0f' : '#ffffff', borderRadius: 8, padding: '8px 18px', fontSize: 13, fontWeight: 700, fontFamily: 'monospace', textDecoration: 'none' }}>
                    ↓ Download
                  </a>
                  <button onClick={() => setCmpCardUrl(null)} style={{ background: r.surface2, border: `1px solid ${r.border}`, color: r.dim, borderRadius: 8, padding: '8px 14px', fontSize: 14, cursor: 'pointer', lineHeight: 1 }}>
                    ✕
                  </button>
                </div>
              </div>
              <img src={cmpCardUrl} style={{ width: cmpCardW, maxWidth: '100%', borderRadius: 8, display: 'block', margin: '0 auto' }} />
            </div>
          </div>
        )
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: 1320, margin: '0 auto 18px' }}>
        <div style={{ fontSize: 20, fontWeight: 800, color: r.text, fontFamily: 'monospace' }}>
          Compare <span style={{ color: r.dim, fontWeight: 400 }}>({cmpData.length || cmpSel.length})</span>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <button onClick={a} title={s ? 'Switch to light mode' : 'Switch to dark mode'} style={btn()}>{s ? '☀' : '🌙'}</button>
          <div style={{ display: 'flex', border: `1px solid ${r.border}`, borderRadius: 6, overflow: 'hidden' }}>
            {[['cards', 'Cards'], ['overlay', 'Overlay'], ['photo', 'Photo']].map(([k2, lab]) => (
              <button key={k2} onClick={() => setCmpView(k2)} style={{
                background: cmpView === k2 ? r.accent : 'transparent', color: cmpView === k2 ? (r.name === 'dark' ? '#06121f' : '#fff') : r.dim,
                border: 'none', padding: '7px 14px', fontSize: 13, fontFamily: 'monospace', fontWeight: 700, cursor: 'pointer',
              }}>
                {lab}
              </button>
            ))}
          </div>
          <button onClick={copyCompareLink} style={btn()} title="Copy a link to this comparison">{cmpCopied ? 'Copied' : 'Copy link'}</button>
          {n && cmpData.some((x) => x.private && x.shareToken && x.userId == n.id) && (
            <button onClick={revokeCompareShare} style={btn('bad')} title="Revoke the share link for the private reports in this comparison">Revoke link</button>
          )}
          {cmpView !== 'photo' && (
            <button onClick={showCompareShareCard} style={btn()} title="Show a shareable card">Share Card</button>
          )}
          <button onClick={() => setComparing(false)} style={btn()}>← Back</button>
        </div>
      </div>

      <div style={{ maxWidth: 1320, margin: '0 auto 12px', background: r.surface, border: `1px solid ${r.border}`, borderRadius: 10, padding: '12px 16px' }}>
        <div onClick={() => setAnaOpen((v2) => !v2)} style={{
          fontSize: 12, fontWeight: 600, color: r.dim, textTransform: 'uppercase', letterSpacing: '.5px',
          marginBottom: anaOpen ? 8 : 0, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', userSelect: 'none',
        }}>
          Analysis
          <span style={{ fontSize: 11 }}>{anaOpen ? '▾' : '▸'}</span>
        </div>
        {anaOpen && (
          <div style={{ color: r.text }} ref={(el) => window.HCRIAnalysis && window.HCRIAnalysis.attach(el, () => ({
            mode: 'compare', theme: i,
            reports: cmpData.map((x) => ({ id: x.id, label: x.label, cct: x.cct, duv: x.duv, ra: x.ra, r9: x.r9, Rf: x.Rf, Rg: x.Rg, rcsBins: x.rcsBins, rhsBins: x.rhsBins })),
          }))} />
        )}
      </div>

      {cmpBusy ? (
        <div style={{ textAlign: 'center', color: r.dim, fontFamily: 'monospace', padding: 60 }}>Loading…</div>
      ) : cmpView === 'photo' ? (
        <div
          key="cmp-photo-view"
          style={{ maxWidth: 1320, margin: '0 auto' }}
          ref={(el) => window.HCRIPhoto && window.HCRIPhoto.attachCompare(el, () => ({
            theme: r, themeName: i, colors: cmpData.map((x, ix) => SERIES_COLORS[ix % SERIES_COLORS.length]),
            reports: cmpData.map((x) => ({ label: x.label, cct: x.cct, duv: x.duv, ra: x.ra, r9: x.r9, Rf: x.Rf, Rg: x.Rg, rfBins: x.rfBins, rcsBins: x.rcsBins, rhsBins: x.rhsBins, rlsBins: x.rlsBins })),
          }))}
        />
      ) : cmpView === 'overlay' ? (
        <div style={{ maxWidth: 1320, margin: '0 auto', background: r.surface, border: `1px solid ${r.border}`, borderRadius: 12, padding: o ? 14 : 20 }}>
          <OverlaySPD data={cmpData} T={r} />
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 16, maxWidth: 1320, margin: '0 auto', alignItems: 'stretch' }}>
          {cmpData.map((rep, idx) => (
            <div
              key={rep.id}
              draggable
              onDragStart={(ev) => { setDragIdx(idx); ev.dataTransfer.effectAllowed = 'move'; try { ev.dataTransfer.setData('text/plain', String(idx)); } catch {} }}
              onDragOver={(ev) => {
                ev.preventDefault();
                if (dragIdx < 0 || dragIdx === idx) return;
                setCmpData((arr) => { const a2 = arr.slice(); const mv = a2.splice(dragIdx, 1)[0]; a2.splice(idx, 0, mv); return a2; });
                setDragIdx(idx);
              }}
              onDrop={(ev) => ev.preventDefault()}
              onDragEnd={() => setDragIdx(-1)}
              title="Drag to reorder"
              style={{ cursor: 'grab', opacity: dragIdx === idx ? 0.5 : 1, transition: 'opacity .12s', position: 'relative' }}
            >
              <input
                type="checkbox"
                checked={cmpPick.includes(rep.id)}
                onClick={(ev) => ev.stopPropagation()}
                onChange={(ev) => setCmpPick((p) => (ev.target.checked ? (p.length >= 3 ? p : [...p, rep.id]) : p.filter((x) => x !== rep.id)))}
                title="Choose up to 3 to display on the share card."
                style={{ position: 'absolute', top: 10, right: 10, zIndex: 5, width: 18, height: 18, cursor: 'pointer', accentColor: r.accent }}
              />
              <CompareCard r={rep} T={r} color={SERIES_COLORS[idx % SERIES_COLORS.length]} onOpen={() => setCmpFull(rep)} />
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // ── Compare-selection floating bar ───────────────────────────────────────
  const compareBar = cmpSel.length > 0 && !(o && I) && (
    o ? (
      // Docked full-width bottom bar on mobile, not a floating centered
      // pill -- the pill's fixed-size buttons plus the "N/12 selected"
      // text didn't fit a phone's width in one row, so the browser's
      // shrink-to-fit sizing for a fixed/centered box with no explicit
      // width squeezed the text into an awkward two-line wrap instead of
      // actually growing the bar. Docking it edge-to-edge gives the row
      // real room: a compact header row (count + Clear), then the action
      // buttons full-width and evenly sized below.
      <div style={{
        position: 'fixed', left: 0, right: 0, bottom: vvBottomInset, zIndex: 1500,
        background: r.surface, borderTop: `1px solid ${r.border}`, boxShadow: '0 -6px 24px rgba(0,0,0,0.45)',
        display: 'flex', flexDirection: 'column', gap: 8,
        padding: '10px 14px calc(env(safe-area-inset-bottom) + 10px)', boxSizing: 'border-box',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 13, color: r.text, fontFamily: 'monospace', fontWeight: 700 }}>{cmpSel.length}/12 selected</span>
          <button onClick={() => setCmpSel([])} title="Clear selection" aria-label="Clear selection" style={iconBtn()}>
            🚫
          </button>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            disabled={cmpSel.length < 2}
            onClick={openCompare}
            style={{
              flex: 1, minWidth: 0, background: cmpSel.length < 2 ? r.border : r.accent, color: cmpSel.length < 2 ? r.dim : (r.name === 'dark' ? '#06121f' : '#fff'),
              border: 'none', borderRadius: 6, padding: '11px 8px', fontSize: 13, fontWeight: 700, fontFamily: 'monospace', cursor: cmpSel.length < 2 ? 'default' : 'pointer',
            }}
          >
            Compare →
          </button>
          {tab === 'myreports' && (
            <button onClick={() => { setCatModalOpen(true); loadAllCategories(); }} title="Add category values to the selected reports" style={{ flex: 1, minWidth: 0, background: 'none', border: `1px solid ${r.border}`, color: r.text, borderRadius: 6, padding: '11px 8px', fontSize: 13, fontWeight: 700, fontFamily: 'monospace', cursor: 'pointer' }}>
              Categorize
            </button>
          )}
          {tab === 'myreports' && (
            <button onClick={bulkDelete} title={`Delete ${cmpSel.length} selected`} aria-label="Delete selected reports" style={{ flexShrink: 0, width: 42, background: 'none', border: `1px solid ${r.bad}`, color: r.bad, borderRadius: 6, padding: '11px 8px', fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              🗑
            </button>
          )}
        </div>
      </div>
    ) : (
      <div style={{
        position: 'fixed', bottom: 22 + vvBottomInset, left: 22, zIndex: 1500,
        display: 'flex', alignItems: 'center', gap: 10, background: r.surface, border: `1px solid ${r.border}`, borderRadius: 10,
        padding: '10px 14px', boxShadow: '0 6px 24px rgba(0,0,0,0.45)',
      }}>
        <span style={{ fontSize: 13, color: r.text, fontFamily: 'monospace', fontWeight: 700 }}>{cmpSel.length}/12 selected</span>
        <button onClick={() => setCmpSel([])} style={{ background: 'none', border: `1px solid ${r.border}`, color: r.dim, borderRadius: 6, padding: '6px 12px', fontSize: 12, fontFamily: 'monospace', cursor: 'pointer' }}>
          Clear
        </button>
        <button
          disabled={cmpSel.length < 2}
          onClick={openCompare}
          style={{
            background: cmpSel.length < 2 ? r.border : r.accent, color: cmpSel.length < 2 ? r.dim : (r.name === 'dark' ? '#06121f' : '#fff'),
            border: 'none', borderRadius: 6, padding: '7px 16px', fontSize: 13, fontWeight: 700, fontFamily: 'monospace', cursor: cmpSel.length < 2 ? 'default' : 'pointer',
          }}
        >
          Compare →
        </button>
        {tab === 'myreports' && (
          <button onClick={() => { setCatModalOpen(true); loadAllCategories(); }} title="Add category values to the selected reports" style={{ background: 'none', border: `1px solid ${r.border}`, color: r.text, borderRadius: 6, padding: '7px 16px', fontSize: 13, fontWeight: 700, fontFamily: 'monospace', cursor: 'pointer' }}>
            Categorize
          </button>
        )}
        {tab === 'myreports' && (
          <button onClick={bulkDelete} title="Delete selected reports" style={{ background: 'none', border: `1px solid ${r.bad}`, color: r.bad, borderRadius: 6, padding: '7px 16px', fontSize: 13, fontWeight: 700, fontFamily: 'monospace', cursor: 'pointer' }}>
            Delete {cmpSel.length}
          </button>
        )}
      </div>
    )
  );

  // ── Categorize modal ─────────────────────────────────────────────────────
  const categorizeModalBody = (
    <Fragment>
      {CATEGORY_FIELDS.map(([k2, lab]) => (
        <div key={k2}>
          <FilterLabel T={r}>{lab}</FilterLabel>
          <CatFilter options={allCatOpts[k2] || []} selected={catModalSel[k2] || []} theme={r} onChange={(a2) => setCatModalSel((p) => ({ ...p, [k2]: a2 }))} />
        </div>
      ))}
      <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontFamily: 'monospace', color: r.text, cursor: 'pointer', marginTop: 4 }}>
        <input type="checkbox" checked={catOverwrite} onChange={(e) => setCatOverwrite(e.target.checked)} style={{ cursor: 'pointer', accentColor: r.accent, width: 15, height: 15 }} />
        Overwrite Existing Values
      </label>
      <div style={{ fontSize: 11, color: r.dim, fontFamily: 'monospace', lineHeight: 1.4 }}>
        {catOverwrite
          ? 'Every selected report will be updated with the values chosen above, replacing anything already set for those categories.'
          : "Only reports that don't already have a value in a given category will be updated — existing choices are left alone."}
      </div>
    </Fragment>
  );

  const categorizeModal = catModalOpen && (
    o ? (
      <div style={{ position: 'fixed', inset: 0, zIndex: 2147483647, background: r.bg, display: 'flex', flexDirection: 'column' }}>
        <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 8, background: r.surface2, borderBottom: `1px solid ${r.border}`, padding: 'calc(env(safe-area-inset-top) + 10px) 14px 10px', boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: r.text, fontFamily: 'monospace' }}>
              Categorize {cmpSel.length} report{cmpSel.length === 1 ? '' : 's'}
            </div>
            <button onClick={() => setCatModalOpen(false)} disabled={catBusy} style={{ background: 'none', border: 'none', color: r.dim, fontSize: 20, cursor: 'pointer', lineHeight: 1 }}>✕</button>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setCatModalOpen(false)} disabled={catBusy} style={{ flex: 1, background: 'none', border: `1px solid ${r.border}`, color: r.dim, borderRadius: 6, padding: 11, fontSize: 13, fontFamily: 'monospace', cursor: 'pointer' }}>Cancel</button>
            <button onClick={submitCategorize} disabled={catBusy} style={{ flex: 1, background: r.accent, border: 'none', color: r.name === 'dark' ? '#06121f' : '#fff', borderRadius: 6, padding: 11, fontSize: 13, fontFamily: 'monospace', fontWeight: 700, cursor: 'pointer', opacity: catBusy ? 0.6 : 1 }}>
              {catBusy ? 'Applying…' : 'Apply'}
            </button>
          </div>
        </div>
        <div style={{ flex: '1 1 auto', minHeight: 0, overflowY: 'auto', padding: 14, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {categorizeModalBody}
        </div>
      </div>
    ) : (
      <div onClick={() => !catBusy && setCatModalOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 4000, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <div onClick={(ev) => ev.stopPropagation()} style={{ background: r.bg, border: `1px solid ${r.border}`, borderRadius: 12, padding: 20, width: '100%', maxWidth: 420, maxHeight: '85vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: r.text, fontFamily: 'monospace' }}>
              Categorize {cmpSel.length} report{cmpSel.length === 1 ? '' : 's'}
            </div>
            <button onClick={() => setCatModalOpen(false)} disabled={catBusy} style={{ background: 'none', border: 'none', color: r.dim, cursor: 'pointer', fontSize: 18, lineHeight: 1 }}>✕</button>
          </div>
          {categorizeModalBody}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 6 }}>
            <button onClick={() => setCatModalOpen(false)} disabled={catBusy} style={{ background: 'none', border: `1px solid ${r.border}`, color: r.dim, borderRadius: 6, padding: '8px 16px', fontSize: 13, fontFamily: 'monospace', cursor: 'pointer' }}>Cancel</button>
            <button onClick={submitCategorize} disabled={catBusy} style={{ background: r.accent, border: 'none', color: r.name === 'dark' ? '#06121f' : '#fff', borderRadius: 6, padding: '8px 16px', fontSize: 13, fontFamily: 'monospace', fontWeight: 700, cursor: 'pointer', opacity: catBusy ? 0.6 : 1 }}>
              {catBusy ? 'Applying…' : 'Apply'}
            </button>
          </div>
        </div>
      </div>
    )
  );

  // ── My Reports: folder bar ───────────────────────────────────────────────
  const folderBar = tab === 'myreports' && n && (
    <div style={{ width: '100%', boxSizing: 'border-box', padding: '10px 14px', borderBottom: `1px solid ${r.border}`, display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', background: r.surface2 }}>
      {folderSel != null ? (
        <Fragment>
          <button onClick={() => { __hcriResetListView(); if (onHardResetFn) onHardResetFn(); }} style={btn()}>← My Reports</button>
          <span style={{ fontSize: 14, fontWeight: 700, color: r.text, fontFamily: 'monospace', display: 'flex', alignItems: 'center', gap: 6 }}>
            📁 {(folders.find((fo) => fo.id === folderSel) || {}).name || 'Folder'}
          </span>
          <button onClick={() => deleteFolder(folderSel)} title="Delete this folder (reports move back to uncategorized)" style={{ background: 'none', border: 'none', color: r.dim, cursor: 'pointer', fontSize: 12, opacity: 0.75, fontFamily: 'monospace' }}>
            🗑 Delete folder
          </button>
          {!o && (
            <div
              onDragOver={(ev) => { ev.preventDefault(); if (dragOverFolder !== '__remove__') setDragOverFolder('__remove__'); }}
              onDragLeave={() => setDragOverFolder((p) => (p === '__remove__' ? null : p))}
              onDrop={(ev) => { ev.preventDefault(); const rids = dragRepRef.current; setDragOverFolder(null); dragRepRef.current = null; if (rids && rids.length) assignFolderMany(rids, null); }}
              style={{
                marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6,
                border: `1.5px dashed ${dragOverFolder === '__remove__' ? r.bad : r.border}`, color: dragOverFolder === '__remove__' ? r.bad : r.dim,
                background: dragOverFolder === '__remove__' ? `${r.bad}15` : 'transparent', borderRadius: 8, padding: '7px 12px', fontSize: 12, fontFamily: 'monospace', fontWeight: 600,
              }}
            >
              Drag here to remove from folder
            </div>
          )}
        </Fragment>
      ) : (
        <Fragment>
          {folders.map((fo) => (
            <div
              key={fo.id}
              onClick={() => {
                setFolderSel(fo.id);
                setCmpSel([]);
                A(1);
                // Tag the URL/history entry with the folder, same as a
                // tab switch -- so refreshing or sharing a link while
                // inside a folder lands back in it instead of at the top
                // of My Reports. __hcriClearFolderUrl (on leaving, via a
                // tab switch or "← My Reports") strips this back off.
                try {
                  window.history.pushState({ hcri: 1, view: 'explore', etab: 'myreports', folder: fo.id }, '', exploreTabUrl('myreports') + '&folder=' + fo.id);
                } catch {}
              }}
              draggable
              onDragStart={(ev) => { dragFolderRef.current = fo.id; try { ev.dataTransfer.effectAllowed = 'move'; } catch {} }}
              onDragEnd={() => { dragFolderRef.current = null; setDragOverFolder(null); }}
              onDragOver={(ev) => { ev.preventDefault(); if (dragOverFolder !== fo.id) setDragOverFolder(fo.id); }}
              onDragLeave={() => setDragOverFolder((p) => (p === fo.id ? null : p))}
              onDrop={(ev) => {
                ev.preventDefault();
                if (dragFolderRef.current != null) { onFolderTileDrop(fo.id); return; }
                const rids = dragRepRef.current;
                setDragOverFolder(null);
                dragRepRef.current = null;
                if (rids && rids.length) assignFolderMany(rids, fo.id);
              }}
              title="Click to open, drag to reorder, or drag a report here"
              style={{
                display: 'flex', alignItems: 'center', gap: 7, background: dragOverFolder === fo.id ? `${r.accent}25` : r.surface,
                border: `1.5px solid ${dragOverFolder === fo.id ? r.accent : r.border}`, borderRadius: 8, padding: '7px 12px',
                cursor: 'grab', fontFamily: 'monospace', fontSize: 13, color: r.text, fontWeight: 600,
              }}
            >
              📁{fo.name}<span style={{ color: r.dim, fontSize: 11 }}>({fo.count})</span>
            </div>
          ))}
          {folderMenuOpen ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <input
                autoFocus
                value={newFolderName}
                onChange={(ev) => setNewFolderName(ev.target.value)}
                onKeyDown={async (ev) => {
                  if (ev.key === 'Enter') { await createFolder(newFolderName); setNewFolderName(''); setFolderMenuOpen(false); }
                  else if (ev.key === 'Escape') { setNewFolderName(''); setFolderMenuOpen(false); }
                }}
                placeholder="Folder name…"
                style={{ background: r.bg, border: `1px solid ${r.border}`, borderRadius: 6, padding: '6px 9px', fontSize: 13, fontFamily: 'monospace', color: r.text, width: 140 }}
              />
              <button disabled={folderBusy} onClick={async () => { await createFolder(newFolderName); setNewFolderName(''); setFolderMenuOpen(false); }} style={{ ...btn('good'), padding: '6px 10px' }}>Add</button>
              <button onClick={() => { setNewFolderName(''); setFolderMenuOpen(false); }} style={{ background: 'none', border: 'none', color: r.dim, cursor: 'pointer', fontSize: 16, lineHeight: 1 }}>✕</button>
            </div>
          ) : (
            <button onClick={() => setFolderMenuOpen(true)} style={{ background: 'none', border: `1.5px dashed ${r.border}`, color: r.dim, borderRadius: 8, padding: '7px 12px', cursor: 'pointer', fontFamily: 'monospace', fontSize: 13, fontWeight: 600 }}>
              + New Folder
            </button>
          )}
        </Fragment>
      )}
    </div>
  );

  // ── Upload / quick-analysis dropzones ───────────────────────────────────
  const uploadBar = (tab === 'myreports' || tab === 'browse') && n && (
    <div style={{ width: '100%', boxSizing: 'border-box', padding: '10px 14px', borderBottom: `1px solid ${r.border}`, display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', background: r.surface2 }}>
      <div
        onClick={() => mrFileRef.current && mrFileRef.current.click()}
        onDragOver={(e) => { e.preventDefault(); setMrDrag(true); }}
        onDragLeave={() => setMrDrag(false)}
        onDrop={(e) => { e.preventDefault(); setMrDrag(false); if (e.dataTransfer.files && e.dataTransfer.files.length) mrUpMany(e.dataTransfer.files); }}
        style={{
          flex: 1, minWidth: 200, border: `2px dashed ${r.accent}${mrDrag ? '' : '50'}`, borderRadius: 8, padding: '9px 14px',
          textAlign: 'center', cursor: 'pointer', background: mrDrag ? `${r.accent}12` : `${r.accent}05`, display: 'flex',
          alignItems: 'center', justifyContent: 'center', gap: 8, color: r.text, fontSize: 13, fontFamily: 'monospace',
        }}
      >
        <span style={{ fontSize: 18 }}>{mrStatus ? (mrBusy ? '⏳' : '✓') : mrBusy ? '⏳' : '📂'}</span>
        <span>{mrStatus || (mrBusy ? 'Analyzing…' : 'Drop CSV / JSON / SP / ZIP — multiple files OK')}</span>
      </div>
      <input
        ref={mrFileRef} type="file" multiple accept=".csv,.txt,.tsv,.json,.sp,.zip" style={{ display: 'none' }}
        onChange={(e) => { if (e.target.files && e.target.files.length) { mrUpMany(e.target.files); e.target.value = ''; } }}
      />
      <button onClick={() => setMrPasteOpen(true)} style={{ flexShrink: 0, background: `${r.accent}12`, border: `1px solid ${r.accent}40`, color: r.accent, borderRadius: 8, padding: '9px 14px', fontSize: 13, cursor: 'pointer', fontFamily: 'monospace', fontWeight: 700 }}>
        📋 Paste
      </button>
      {mrPasteOpen && <PasteSPDModal user={n} onResult={() => { setMrPasteOpen(false); L(1); }} onClose={() => setMrPasteOpen(false)} />}
      <details style={{ width: '100%', marginTop: 6, marginBottom: 2 }}>
        <summary style={{ fontSize: 12, color: r.accent, cursor: 'pointer', fontFamily: 'monospace', fontWeight: 700 }}>How do I get a file to upload?</summary>
        <div style={{ fontSize: 12, color: r.dim, marginTop: 8, lineHeight: 1.55, textAlign: 'left' }}>
          <div style={{ marginBottom: 6 }}>
            You need a <b style={{ color: r.text }}>spectral measurement (SPD)</b> — a two-column list of wavelength (nm) and intensity (relative power).
          </div>
          <div style={{ marginBottom: 6 }}>
            Most spectral meters can export one — e.g. a <b style={{ color: r.text }}>Hopoocolor</b> or <b style={{ color: r.text }}>Torch Bearer</b> spectrometer, or a <b style={{ color: r.text }}>ColorMunki</b> read with Argyll.
          </div>
          <div>
            Save the spectrum as <b style={{ color: r.text }}>CSV/TSV</b> (wavelength in one column, value in the next), <b style={{ color: r.text }}>JSON</b>, or Argyll <b style={{ color: r.text }}>.sp</b>. Some measurement PDFs work too.
          </div>
        </div>
      </details>
    </div>
  );

  const quickAnalysisBar = tab === 'browse' && !n && (
    <div style={{ width: '100%', boxSizing: 'border-box', padding: '10px 14px', borderBottom: `1px solid ${r.border}`, display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', background: r.surface2 }}>
      <div style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 7, fontSize: 11.5, fontFamily: 'monospace', color: r.dim }}>
        <span style={{ background: `${r.accent}1f`, border: `1px solid ${r.accent}40`, color: r.accent, borderRadius: 5, padding: '1px 7px', fontWeight: 700, letterSpacing: 0.5 }}>⚡ QUICK ANALYSIS</span>
        <span>Analyze data without saving it — results aren't stored to your account.</span>
      </div>
      <div
        onClick={() => qFileRef.current && qFileRef.current.click()}
        onDragOver={(e) => { e.preventDefault(); setQDrag(true); }}
        onDragLeave={() => setQDrag(false)}
        onDrop={(e) => { e.preventDefault(); setQDrag(false); if (e.dataTransfer.files[0]) qUp(e.dataTransfer.files[0]); }}
        style={{
          flex: 1, minWidth: 200, border: `2px dashed ${r.accent}${qDrag ? '' : '50'}`, borderRadius: 8, padding: '9px 14px',
          textAlign: 'center', cursor: 'pointer', background: qDrag ? `${r.accent}12` : `${r.accent}05`, display: 'flex',
          alignItems: 'center', justifyContent: 'center', gap: 8, color: r.text, fontSize: 13, fontFamily: 'monospace',
        }}
      >
        <span style={{ fontSize: 18 }}>{qBusy ? '⏳' : '⚡'}</span>
        <span>{qBusy ? 'Analyzing…' : 'Drop a spectrum file to analyze'}</span>
      </div>
      <input ref={qFileRef} type="file" accept=".csv,.txt,.tsv,.json,.sp" style={{ display: 'none' }} onChange={(e) => { if (e.target.files[0]) qUp(e.target.files[0]); e.target.value = ''; }} />
    </div>
  );

  // ── Tab bar ───────────────────────────────────────────────────────────────
  const tabs = [
    ['browse', 'Explore'],
    ...(n ? [['myreports', 'My Reports']] : []),
    ['insights', 'Insights'],
    ...(filtersTouched ? [['finsights', 'Filtered Insights']] : []),
    ...(n ? [['myinsights', 'My Insights']] : []),
  ];
  const tabBar = (
    <div style={{ display: 'flex', gap: 4, padding: '0 16px', borderTop: `1px solid ${r.border}` }}>
      {tabs.map(([id, lab]) => (
        <button
          key={id}
          onClick={() => {
            // Already on this tab and not inside a folder -- don't push a
            // redundant history entry for a click that wouldn't change
            // anything on screen (see tests/no-redundant-history.spec.js).
            // Being inside a folder still counts as a real change even on
            // the same tab -- clicking "My Reports" while inside one
            // should back out of it, matching __hcriResetListView below.
            if (id === tab && folderSel == null) return;
            __hcriResetListView();
            setTab(id);
            try {
              window.history.pushState({ hcri: 1, view: 'explore', etab: id }, '', exploreTabUrl(id));
            } catch {}
          }}
          style={{
            background: 'none', border: 'none', borderBottom: `2px solid ${tab === id ? r.accent : 'transparent'}`,
            color: tab === id ? r.text : r.dim, padding: '10px 14px', fontSize: 13, fontWeight: tab === id ? 700 : 600, cursor: 'pointer', fontFamily: 'monospace',
          }}
        >
          {lab}
        </button>
      ))}
    </div>
  );

  const pageHeader = (
    // No longer position:'sticky' -- pageHeader now lives as a plain,
    // non-scrolling flex sibling above fullPage's own scroll region (see
    // fullPage below), so it's always on-screen without needing to stick to
    // anything. Sticky was only needed in the old layout where fullPage
    // itself was the single scrolling surface and the header had to stick
    // to the top of THAT scroll as it passed underneath. Left in place
    // after the scroll-container split, it became a sticky element with no
    // real scrolling ancestor -- which is exactly the shape of a known
    // WebKit/Safari bug where such an element can compute its containing
    // block wrong and render zero-size or off-screen. That matches the
    // "header and tabs disappeared" regression on a real phone while
    // looking completely fine in Chromium, which doesn't have the bug.
    <div style={{ background: r.surface2, borderBottom: `1px solid ${r.border}`, boxShadow: s ? 'none' : '0 2px 8px rgba(0,0,0,0.08)' }}>
      <div style={{ padding: o ? '8px 14px' : '0 16px', display: 'flex', flexDirection: o ? 'column' : 'row', alignItems: o ? 'stretch' : 'center', justifyContent: 'space-between', gap: o ? 8 : 0, minHeight: 52, boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            onClick={() => {
              if (!n && onHomeFn) { onHomeFn(); return; }
              // "Home" is the base of whichever list (Explore/browse or
              // My Reports) the user was last on, same as the deployed
              // site's own behavior -- not hardcoded to browse.
              let targetTab = 'browse';
              try { targetTab = n && localStorage.getItem('hcri_last_list') === 'myreports' ? 'myreports' : 'browse'; } catch {}
              // Already at the clean BASE of that list -- right tab, no
              // folder, no open report, no filters/search applied -- so
              // there's really nothing to do: don't push a redundant
              // history entry (see goHome's comment in App.jsx and
              // tests/no-redundant-history.spec.js). The earlier version
              // of this only checked the tab itself, which made the logo
              // look broken: clicking it while already on the right tab
              // but with a folder open, or a filter/search applied,
              // silently did nothing instead of actually resetting.
              const atBase = !ee && folderSel == null && !filtersTouched && tab === targetTab;
              if (atBase) return;
              __hcriResetListView();
              setTab(targetTab);
              try { window.history.pushState({ hcri: 1, view: 'explore', etab: targetTab }, '', exploreTabUrl(targetTab)); } catch {}
            }}
            style={{ fontWeight: 900, fontSize: o ? 18 : 20, color: r.text, fontFamily: 'monospace', cursor: 'pointer' }}
          >
            hCRI<span style={{ color: r.accent }}>.io</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', justifyContent: o ? 'flex-start' : 'flex-end' }}>
          <button onClick={() => window.HCRIPlayground && window.HCRIPlayground.open()} title="CRI 3D playground" style={{
            height: 34, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box',
            background: 'none', border: `1.5px solid ${r.border}`, color: r.dim, borderRadius: 6, padding: '6px 12px', fontSize: 13,
            cursor: 'pointer', fontFamily: 'monospace', fontWeight: 700, whiteSpace: 'nowrap',
          }}>
            {o ? '🎛' : '🎛 Playground'}
          </button>
          {(tab === 'browse' || tab === 'myreports') && (
            <button onClick={openFilteredSummary} title="Open a shareable summary report for the current filters" style={{
              height: 34, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box',
              background: `${r.good}15`, border: `1.5px solid ${r.good}40`, color: r.good, borderRadius: 6, padding: '6px 12px',
              fontSize: 13, cursor: 'pointer', fontFamily: 'monospace', fontWeight: 600, whiteSpace: 'nowrap',
            }}>
              {o ? '📊' : '📊 Summary'}
            </button>
          )}
          <button
            onClick={() => {
              try {
                navigator.clipboard.writeText(`${window.location.origin}${window.location.pathname}?explore${tab === 'insights' ? '=insights' : ''}`).then(() => {
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1500);
                });
              } catch {}
            }}
            title="Copy a shareable link to this page"
            style={{
              height: 34, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box',
              background: copied ? `${r.good}20` : 'none', border: `1.5px solid ${copied ? r.good : r.border}`, color: copied ? r.good : r.text,
              borderRadius: 6, padding: '6px 12px', fontSize: 13, cursor: 'pointer', fontFamily: 'monospace', fontWeight: 600, whiteSpace: 'nowrap',
            }}
          >
            {copied ? (o ? '✓' : '✓ Copied') : (o ? '🔗' : '🔗 Copy link')}
          </button>
          {chromeButtons(null)}
          {o && (
            <button onClick={() => te((e) => !e)} style={{ ...btn(I ? 'warn' : 'accent'), padding: '6px 12px' }}>
              {I ? '✕ Close' : '⚙ Filter'}
            </button>
          )}
          {!n && onSignIn && <button onClick={onSignIn} style={{ ...btn('good'), padding: '6px 14px' }}>Sign In</button>}
        </div>
      </div>
      {tabBar}
    </div>
  );

  const listingBody = (
    <div style={{ display: 'flex', flexWrap: 'wrap', alignContent: 'flex-start', minHeight: 'calc(100vh - 56px)', position: 'relative' }}>
      {folderBar}
      {uploadBar}
      {quickAnalysisBar}
      {/* Desktop: a thin arrow tab that collapses/expands the filter sidebar.
          Hidden once filters are pinned open (pinning removes the need to
          collapse) and on mobile (which uses the Filters/Results tab switch
          in pageHeader instead). */}
      {!o && !ePin && (
        <button
          onClick={() => setEFiltCol((c) => !c)}
          title={eFiltCol ? 'Show filters' : 'Hide filters'}
          style={{
            position: 'absolute', left: eFiltCol ? 0 : 270, top: '50%', transform: 'translateY(-50%)',
            zIndex: 10, background: r.surface2, border: `1px solid ${r.border}`, borderLeft: 'none',
            borderRadius: '0 6px 6px 0', color: r.dim, cursor: 'pointer', padding: '10px 5px',
            fontSize: 12, lineHeight: 1, writingMode: 'vertical-rl',
          }}
        >
          {eFiltCol ? '▶' : '◀'}
        </button>
      )}
      {(o ? I : ePin || !eFiltCol) && (
        <FilterPanel {...filterPanelProps} width={o ? '100%' : 270} showPinInHeader ePin={ePin} onTogglePin={setEPin} />
      )}
      {(!o || !I) && <ResultsPanel {...resultsPanelProps} />}
    </div>
  );

  const tabContent =
    tab === 'insights' ? <ExploreStats theme={r} />
    : tab === 'finsights' ? <FilteredInsights q={window.__exploreQ || ''} T={r} heading="Filtered Insights" note="Statistics across every report matching your current Explore filters." />
    : tab === 'myinsights' ? <FilteredInsights q={`userId=${(n && n.id) || 0}`} T={r} heading="My Insights" note="Statistics across your own reports, including private ones." />
    : listingBody;

  const fullPage = (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: r.bg, color: r.text, fontFamily: 'monospace', overflow: 'hidden' }}>
      {pageHeader}
      <div style={{ flex: 1, minHeight: 0, overflow: 'auto', WebkitOverflowScrolling: 'touch' }}>
        {tabContent}
      </div>
    </div>
  );

  // ── Split view: desktop, viewing a report, results list pinned/opened ──
  const splitView = (
    <div style={{ display: 'flex', height: '100vh', background: r.bg, overflow: 'hidden', position: 'relative' }}>
      <div style={{ width: 270, minWidth: 270, flexShrink: 0, borderRight: `1px solid ${r.border}`, height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ flexShrink: 0, display: 'flex', alignItems: 'stretch', background: r.surface2, borderBottom: `1px solid ${r.border}` }}>
          <button onClick={() => te(false)} style={{
            flex: 1, padding: '11px 8px', background: 'none', border: 'none',
            borderBottom: I ? '2px solid transparent' : `2px solid ${r.accent}`, color: I ? r.dim : r.accent,
            fontWeight: 700, fontFamily: 'monospace', fontSize: 13, cursor: 'pointer',
          }}>
            📋 Results
          </button>
          <button onClick={() => te(true)} style={{
            flex: 1, padding: '11px 8px', background: 'none', border: 'none',
            borderBottom: I ? `2px solid ${r.accent}` : '2px solid transparent', color: I ? r.accent : r.dim,
            fontWeight: 700, fontFamily: 'monospace', fontSize: 13, cursor: 'pointer',
          }}>
            ⚙ Filters
          </button>
          <button onClick={() => { const nextPin = !ePin; setEPin(nextPin); if (!nextPin) setEOpen(true); }} title={ePin ? 'Pinned (click to unpin)' : 'Pin open'} style={{
            flexShrink: 0, padding: '0 10px', background: ePin ? `${r.accent}20` : 'none', border: 'none',
            borderLeft: `1px solid ${r.border}`, color: ePin ? r.accent : r.dim, fontSize: 14, cursor: 'pointer', opacity: ePin ? 1 : 0.5,
          }}>
            📌
          </button>
          <button onClick={() => { setEPin(false); setEOpen(false); }} title="Close results" style={{
            flexShrink: 0, padding: '0 12px', background: 'none', border: 'none', borderLeft: `1px solid ${r.border}`,
            color: r.dim, fontSize: 16, cursor: 'pointer', lineHeight: 1,
          }}>
            ✕
          </button>
        </div>
        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
          <div style={{ minHeight: '100vh', background: r.bg, color: r.text, fontFamily: 'monospace' }}>
            <div style={{ display: 'flex', minHeight: 'calc(100vh - 56px)' }}>
              {I && <FilterPanel {...filterPanelProps} />}
              {!I && <ResultsPanel {...resultsPanelProps} />}
            </div>
          </div>
        </div>
      </div>
      <div style={{ flex: 1, minWidth: 0, height: '100%', overflow: 'hidden' }}>
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: r.bg, overflow: 'hidden' }}>
          {detailToolbar}
          <div style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>{reportDetailView}</div>
        </div>
      </div>
    </div>
  );

  // ── Mobile/tablet: full-screen single-pane report view ─────────────────
  const mobileDetailView = (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: r.bg, overflow: 'hidden' }}>
      {detailToolbar}
      <div style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>{reportDetailView}</div>
    </div>
  );

  return (
    <Fragment>
      {adminOpen && <AdminPanel onClose={() => setAdminOpen(false)} me={n} />}
      {helpOpen && <HelpModal onClose={() => setHelpOpen(false)} />}
      {fbOpen && <FeedbackModal user={n} onClose={() => setFbOpen(false)} />}
      {profileOpen && <AccountSettings user={n} onClose={() => setProfileOpen(false)} onUserUpdate={() => {}} />}

      {compareBar}
      {categorizeModal}
      {compareView}

      {/* The three top-level layouts, picked in order: desktop split view
          (a report is open AND the results list is pinned/opened) >
          full-screen single-pane report view (a report is open, otherwise)
          > the default full listing page (browse/myreports/insights). */}
      {ee && !o && (ePin || eOpen)
        ? splitView
        : ee
          ? mobileDetailView
          : fullPage}
    </Fragment>
  );
}
