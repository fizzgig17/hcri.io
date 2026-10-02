// frontend/src/components/ExploreReportCard.jsx
//
// Reconstructed from assets/app.js (minified functions Ve/Be/He). The
// report card used in the Explore page's browsable grid/list of public
// reports: a compare checkbox, delete (for the owner's own reports),
// CCT/Duv/Ra/R9/Rf/Rg metric chips, an attribution line, a private-report
// lock icon, the report id, and a Votes widget. Draggable when onDragStart
// is given (dropping a card onto the comparison tray).
//
// Be (MetricChip) and He (SectionLabel) are small presentational helpers
// used alongside this card elsewhere on the Explore page; exported here
// since they're tightly coupled to it rather than giving them their own
// one-line files.
import { tintInfo } from '../lib/compareExport';
import { fmtTZ } from '../lib/tz';
import Votes from './Votes';

export function MetricChip({ label, value, color }) {
  if (value == null) return null;
  return (
    <span style={{ background: `${color}18`, border: `1px solid ${color}40`, color, borderRadius: 4, padding: '2px 7px', fontSize: 12, fontFamily: 'monospace', fontWeight: 700 }}>
      {label}:{value}
    </span>
  );
}

export function SectionLabel({ children, T: t }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: t.text, fontFamily: 'monospace', marginBottom: 4 }}>
      {children}
    </div>
  );
}

export default function ExploreReportCard({ r, onClick, T: t, selected, onToggle, mine, onDelete, full, onDragStart }) {
  const dark = t.name === 'dark';
  const rfColor = v => (v == null ? t.dim : v >= 90 ? t.good : v >= 80 ? t.warn : t.bad);
  const rgColor = v => (Math.abs((v || 100) - 100) <= 8 ? t.good : t.warn);
  const duvColor = v => (Math.abs(v || 0) < 0.006 ? t.good : t.warn);

  return (
    <div
      onClick={onClick}
      draggable={!!onDragStart}
      onDragStart={onDragStart ? ev => onDragStart(ev, r) : undefined}
      style={{
        background: mine ? (dark ? '#11294a' : '#e8f1fd') : r.private ? (dark ? '#3a1620' : '#fbe1e6') : t.surface,
        border: `1px solid ${t.border}`,
        borderRadius: 10,
        padding: '14px 16px',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        minWidth: 0,
        maxWidth: '100%',
        transition: 'all .15s',
        boxShadow: dark ? 'none' : '0 1px 4px rgba(0,0,0,0.08)',
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = t.accent; e.currentTarget.style.boxShadow = `0 2px 12px ${t.accent}25`; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = t.border; e.currentTarget.style.boxShadow = dark ? 'none' : '0 1px 4px rgba(0,0,0,0.08)'; }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
          {onToggle && (
            <input
              type="checkbox"
              checked={!!selected}
              title="Select to compare"
              onClick={ev => ev.stopPropagation()}
              onChange={ev => { ev.stopPropagation(); onToggle(); }}
              style={{ cursor: 'pointer', accentColor: t.accent, width: 15, height: 15, margin: 0, flexShrink: 0 }}
            />
          )}
          <div
            style={{
              fontWeight: 700, fontSize: 14, color: t.text, fontFamily: 'monospace', minWidth: 0,
              overflow: full ? 'visible' : 'hidden', textOverflow: full ? 'clip' : 'ellipsis',
              whiteSpace: full ? 'normal' : 'nowrap', wordBreak: full ? 'break-word' : 'normal',
            }}
          >
            {r.label || 'Unnamed'}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
          {mine && onDelete && (
            <button
              onClick={ev => { ev.stopPropagation(); onDelete(); }}
              title="Delete this report"
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, lineHeight: 1, padding: '2px 5px', color: t.dim, opacity: 0.65, alignSelf: 'center', borderRadius: 5 }}
              onMouseEnter={ev => { ev.currentTarget.style.color = t.bad; ev.currentTarget.style.opacity = '1'; }}
              onMouseLeave={ev => { ev.currentTarget.style.color = t.dim; ev.currentTarget.style.opacity = '0.65'; }}
            >
              🗑
            </button>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {tintInfo(r.duv) && (
          <span style={{ background: `${tintInfo(r.duv).color}22`, border: `1px solid ${tintInfo(r.duv).color}`, color: tintInfo(r.duv).color, borderRadius: 4, padding: '2px 7px', fontSize: 12, fontFamily: 'monospace', fontWeight: 700 }}>
            {tintInfo(r.duv).label}
          </span>
        )}
        {r.cct != null && (
          <span style={{ background: `${t.accent}15`, border: `1px solid ${t.accent}40`, color: t.accent, borderRadius: 4, padding: '2px 7px', fontSize: 12, fontFamily: 'monospace', fontWeight: 700 }}>
            {r.cct}K
          </span>
        )}
        {r.duv != null && (
          <span style={{ background: `${duvColor(r.duv)}15`, border: `1px solid ${duvColor(r.duv)}40`, color: duvColor(r.duv), borderRadius: 4, padding: '2px 7px', fontSize: 12, fontFamily: 'monospace', fontWeight: 700 }}>
            Duv:{r.duv >= 0 ? '+' : ''}{r.duv.toFixed(4)}
          </span>
        )}
        {r.ra != null && <MetricChip label="Ra" value={Math.round(r.ra)} color={rfColor(r.ra)} />}
        {r.r9 != null && <MetricChip label="R9" value={Math.round(r.r9)} color={r.r9 >= 50 ? t.good : r.r9 >= 0 ? t.warn : t.bad} />}
        <MetricChip label="Rf" value={r.Rf} color={rfColor(r.Rf)} />
        <MetricChip label="Rg" value={r.Rg} color={rgColor(r.Rg)} />
      </div>

      {r.userName && (
        <div style={{ fontSize: 11, color: t.dim, fontFamily: 'monospace', borderTop: `1px solid ${t.border}`, paddingTop: 6, marginTop: 2 }}>
          by <span style={{ color: t.text, fontWeight: 700 }}>{r.userName}</span> · {fmtTZ(r.createdAt.replace(' ', 'T'), undefined, true)}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {r.private && (
            <span title="Private — only you can see this" style={{ fontSize: 14, lineHeight: 1, opacity: 0.75 }}>🔒</span>
          )}
          <span title="Report ID" style={{ fontSize: 10, color: t.dim, opacity: 0.5, fontFamily: 'monospace', lineHeight: 1 }}>#{r.id}</span>
        </div>
        <Votes reportId={r.id} theme={t} initialUp={r.up} initialDown={r.down} />
      </div>
    </div>
  );
}
