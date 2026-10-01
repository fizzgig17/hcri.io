// frontend/src/components/ExploreStats.jsx
//
// Reconstructed from assets/app.js (minified functions HBarChart/AreaChart/
// ExploreStats, kept together since the charts only exist to serve this
// page). The public statistics dashboard shown as a tab of the Explore
// page -- aggregate numbers across every public report (CCT/Ra/R9/Duv
// distributions, top LED models and light brands, and a reports-over-time
// trend), fetched from api/explore_stats.php.
//
// Note: despite looking similar to a canvas chart, HBarChart is plain DOM
// (a flex row with a colored div sized by percentage) and AreaChart is
// inline SVG -- neither uses <canvas>.
import { useState, useEffect } from 'react';
import { basePath } from '../lib/api';

// Horizontal bar chart: items = [{label, count}], sized relative to the
// largest count in the set.
export function HBarChart({ items, color, theme: t }) {
  const max = Math.max(1, ...items.map(i => i.count));
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
      {items.length ? items.map((it, idx) => (
        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 104, flexShrink: 0, fontSize: 11, color: t.dim, fontFamily: 'monospace', textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {it.label}
          </div>
          <div style={{ flex: 1, background: t.bg, borderRadius: 4, height: 16, overflow: 'hidden' }}>
            <div style={{ width: `${Math.round((it.count / max) * 100)}%`, height: '100%', background: color, borderRadius: 4, minWidth: it.count > 0 ? 6 : 0 }} />
          </div>
          <div style={{ width: 30, flexShrink: 0, fontSize: 11, color: t.text, fontFamily: 'monospace', fontWeight: 700, textAlign: 'right' }}>
            {it.count}
          </div>
        </div>
      )) : (
        <div style={{ fontSize: 12, color: t.dim, fontFamily: 'monospace', padding: '8px 0' }}>No data yet</div>
      )}
    </div>
  );
}

// Area/line trend chart (SVG): labels/counts are parallel arrays, e.g. one
// point per day/week of reports added.
export function AreaChart({ labels, counts, color, theme: t }) {
  const W = 600, H = 150, pl = 10, pr = 10, pt = 12, pb = 24;
  const pw = W - pl - pr, ph = H - pt - pb;
  const n = counts.length;
  const max = Math.max(1, ...counts);
  const xs = i => (n <= 1 ? pl + pw / 2 : pl + i * (pw / (n - 1)));
  const ys = v => pt + ph - (v / max) * ph;
  const line = counts.map((c, i) => `${xs(i).toFixed(1)},${ys(c).toFixed(1)}`).join(' ');
  const area = `${pl.toFixed(1)},${(pt + ph).toFixed(1)} ${line} ${(pl + pw).toFixed(1)},${(pt + ph).toFixed(1)}`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block' }}>
      <polygon points={area} fill={color} opacity={0.16} />
      <polyline points={line} fill="none" stroke={color} strokeWidth={2} />
      <line x1={pl} y1={pt + ph} x2={pl + pw} y2={pt + ph} stroke={t.border} strokeWidth={1} />
      {counts.map((c, i) => <circle key={`d${i}`} cx={xs(i)} cy={ys(c)} r={2.5} fill={color} />)}
      {labels.map((lb, i) => (n <= 12 || i % 2 === 0) && (
        <text key={`x${i}`} x={xs(i)} y={H - 8} fontSize={9} fill={t.dim} textAnchor="middle" fontFamily="monospace">{lb}</text>
      ))}
      {counts.map((c, i) => c > 0 && (
        <text key={`v${i}`} x={xs(i)} y={ys(c) - 5} fontSize={8} fill={t.dim} textAnchor="middle" fontFamily="monospace">{c}</text>
      ))}
    </svg>
  );
}

export default function ExploreStats({ theme: t }) {
  const [d, setD] = useState(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    fetch(`${basePath()}index.php/api/explore/stats`)
      .then(r => r.json())
      .then(x => { x && !x.error ? setD(x) : setErr((x && x.error) || 'Failed to load'); })
      .catch(() => setErr('Failed to load'));
  }, []);

  if (err) return <div style={{ padding: 40, color: t.dim, fontFamily: 'monospace', textAlign: 'center' }}>{err}</div>;
  if (!d) return <div style={{ padding: 40, color: t.dim, fontFamily: 'monospace', textAlign: 'center' }}>Loading insights…</div>;

  const card = (title, body) => (
    <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 10, padding: '14px 16px' }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: t.text, fontFamily: 'monospace', marginBottom: 12 }}>{title}</div>
      {body}
    </div>
  );
  const tile = (label, val) => (
    <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 10, padding: '12px 14px' }}>
      <div style={{ fontSize: 11, color: t.dim, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 800, color: t.text, fontFamily: 'monospace', marginTop: 4 }}>{val}</div>
    </div>
  );

  return (
    <div style={{ padding: '18px 16px 60px', maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(120px,1fr))', gap: 12, marginBottom: 16 }}>
        {tile('Reports', d.count)}
        {tile('Avg CRI', d.avgRa == null ? '—' : d.avgRa)}
        {tile('Avg CCT', d.avgCct ? d.avgCct + 'K' : '—')}
        {tile('High-CRI ≥90', (d.highCriPct || 0) + '%')}
        {tile('Votes', d.votes || 0)}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 14 }}>
        {card('Color temperature (CCT)', <HBarChart items={d.cct || []} color={t.warn} theme={t} />)}
        {card('Color rendering (Ra)', <HBarChart items={d.ra || []} color={t.good} theme={t} />)}
        {card('Deep red (R9)', <HBarChart items={d.r9 || []} color={t.bad} theme={t} />)}
        {card('Tint (Duv ×1000)', <HBarChart items={d.duv || []} color={t.accent} theme={t} />)}
        {card('Top LED models', <HBarChart items={d.ledModels || []} color="#7F77DD" theme={t} />)}
        {card('Top light brands', <HBarChart items={d.lightBrands || []} color="#1D9E75" theme={t} />)}
      </div>
      <div style={{ marginTop: 14 }}>
        {card('Reports added over time', (
          <AreaChart labels={(d.overTime && d.overTime.labels) || []} counts={(d.overTime && d.overTime.counts) || []} color={t.accent} theme={t} />
        ))}
      </div>
    </div>
  );
}
