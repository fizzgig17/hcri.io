// frontend/src/components/ExploreSummary.jsx
//
// Reconstructed from assets/app.js (minified fns __SumInsights, __ScrollPos,
// __ePP0). These belong to the Explore page (not Sidebar/ReportView) but
// fell inside this reconstruction batch's assigned bundle-line range.
// Entirely new -- none of this existed in the stale frontend/src.
//
//  - SummaryInsights (__SumInsights): fetches /api/explore?summary=1&<query>
//    and renders stat tiles + histograms (CCT/CRI/R9/Rf/Rg/Duv) plus a
//    Duv tint-distribution breakdown for whatever report set the query
//    selects. Matches api/summary_stats.php's build_explore_summary() shape.
//  - ScrollPositionPill (__ScrollPos): a small floating "N / total" pill
//    for the Explore grid that also lets you drag it to scroll the grid --
//    it finds the nearest scrollable ancestor of a `[data-expgrid]` element
//    and reports which row range is currently in view.
//  - explorePageSize (__ePP0): how many grid tiles fit the viewport, used
//    to size an Explore page/batch request.

import { useState, useEffect, useRef } from 'react';
import { getToken } from '../lib/api.js';

export function explorePageSize() {
  const W = window.innerWidth > 900 ? window.innerWidth - 360 : window.innerWidth - 24;
  const gap = 14;
  const cols = Math.max(1, Math.floor((W + gap) / 294));
  const rows = Math.max(2, Math.floor((window.innerHeight - 200) / 314));
  return Math.max(cols, Math.min(cols * rows, 120));
}

export function SummaryInsights({ q, T, heading, note }) {
  const [d, setD] = useState(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    let dead = false;
    setD(null); setErr('');
    fetch(`./index.php/api/explore?summary=1&${q || ''}`, { headers: { Authorization: 'Bearer ' + getToken() } })
      .then((r) => r.json())
      .then((x) => { if (!dead) (x && !x.error ? setD(x) : setErr((x && x.error) || 'Failed to load')); })
      .catch(() => { if (!dead) setErr('Failed to load'); });
    return () => { dead = true; };
  }, [q]);

  const pad = { padding: 40, color: T.dim, fontFamily: 'monospace', textAlign: 'center' };
  if (err) return <div style={pad}>{err}</div>;
  if (!d) return <div style={pad}>Loading insights…</div>;
  if (!d.count) return <div style={pad}>No reports match — nothing to summarise.</div>;

  const M = d.metrics || {};
  const fmt = (v, dg) => (v == null ? '—' : (Math.round(v * 10 ** dg) / 10 ** dg).toFixed(dg));

  const Tile = ({ label, val, sub }) => (
    <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, padding: '12px 14px' }}>
      <div style={{ fontSize: 11, color: T.dim, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 800, color: T.text, fontFamily: 'monospace', marginTop: 4 }}>{val}</div>
      {sub ? <div style={{ fontSize: 10.5, color: T.dim, fontFamily: 'monospace', marginTop: 2 }}>{sub}</div> : null}
    </div>
  );

  const Hist = ({ m, dg }) => {
    if (!m || !m.hist || !m.hist.bins || !m.hist.bins.length) return null;
    const bins = m.hist.bins;
    const mx = Math.max(1, ...bins.map((b) => b.count));
    return (
      <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, padding: '12px 14px' }}>
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
            mean <b style={{ color: T.text }}>{fmt(m.stats.mean, dg)}</b> · median {fmt(m.stats.median, dg)}<br />
            p25–p75 {fmt(m.stats.p25, dg)}–{fmt(m.stats.p75, dg)} · range {fmt(m.stats.min, dg)}–{fmt(m.stats.max, dg)}
          </div>
        ) : null}
      </div>
    );
  };

  const tint = d.tint || {};
  const tTot = Math.max(1, (tint.rosy || 0) + (tint.neutral || 0) + (tint.green || 0));
  const TintBar = ({ label, v, col }) => (
    <div style={{ marginBottom: 6 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: T.dim, fontFamily: 'monospace' }}>
        <span>{label}</span>
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
        {note ? <div style={{ fontSize: 11.5, color: T.dim, fontFamily: 'monospace', marginTop: 3 }}>{note}</div> : null}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(120px,1fr))', gap: 12, marginBottom: 16 }}>
        <Tile label="Reports" val={d.count} />
        <Tile label="Mean CCT" val={M.cct && M.cct.stats.mean != null ? Math.round(M.cct.stats.mean) + 'K' : '—'} />
        <Tile label="Mean CRI" val={M.ra && M.ra.stats.mean != null ? fmt(M.ra.stats.mean, 1) : '—'} />
        <Tile label="Mean R9" val={M.r9 && M.r9.stats.mean != null ? fmt(M.r9.stats.mean, 1) : '—'} />
        <Tile label="Mean Rf" val={M.Rf && M.Rf.stats.mean != null ? fmt(M.Rf.stats.mean, 1) : '—'} />
        <Tile label="Mean Rg" val={M.Rg && M.Rg.stats.mean != null ? fmt(M.Rg.stats.mean, 1) : '—'} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 12, marginBottom: 16 }}>
        <Hist m={M.cct} dg={0} /><Hist m={M.ra} dg={1} /><Hist m={M.r9} dg={0} />
        <Hist m={M.Rf} dg={1} /><Hist m={M.Rg} dg={1} /><Hist m={M.duv} dg={4} />
      </div>
      <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, padding: '14px 16px' }}>
        <div style={{ fontSize: 12.5, fontWeight: 700, color: T.text, fontFamily: 'monospace', marginBottom: 10 }}>Tint distribution (Duv)</div>
        <TintBar label="Rosy (Duv < -0.002)" v={tint.rosy} col="#e06c9f" />
        <TintBar label="Neutral" v={tint.neutral} col={T.dim} />
        <TintBar label="Green (Duv > +0.002)" v={tint.green} col="#5fbf6a" />
      </div>
    </div>
  );
}

export function ScrollPositionPill({ total, count, T }) {
  const [st, setSt] = useState(null);
  const [awake, setAwake] = useState(false);
  const scRef = useRef(null), dragRef = useRef(null), timerRef = useRef(0);

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
      setSt({
        first, last, frac: Math.max(0, Math.min(1, sT / sMax)),
        trackTop: vTop + 10, trackBot: vTop + vH - 10, vRight, n, scrollable: sMax > 24,
      });
    };
    const wake = () => {
      setAwake(true);
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => { if (!dragRef.current) setAwake(false); }, 1200);
    };
    const on = () => { wake(); if (!raf) raf = requestAnimationFrame(calc); };
    calc();
    const t1 = setTimeout(calc, 250), t2 = setTimeout(calc, 900);
    window.addEventListener('scroll', on, true);
    window.addEventListener('resize', on);
    return () => {
      dead = true;
      clearTimeout(t1); clearTimeout(t2); clearTimeout(timerRef.current);
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
    dragRef.current = { y0: e.clientY, f0: st.frac, track: trackLen };
    setAwake(true);
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch {}
  };
  const onMove = (e) => {
    const d = dragRef.current;
    if (!d) return;
    e.preventDefault();
    scrollTo(Math.max(0, Math.min(1, d.f0 + (e.clientY - d.y0) / d.track)));
  };
  const onUp = (e) => {
    if (!dragRef.current) return;
    dragRef.current = null;
    try { e.currentTarget.releasePointerCapture(e.pointerId); } catch {}
  };

  if (!st || st.n <= 1 || !st.scrollable) return null;
  const dragging = !!dragRef.current;
  const top = st.trackTop + st.frac * trackLen;
  return (
    <div
      title="Drag to scroll through the list"
      onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}
      style={{
        position: 'fixed', top, right: st.vRight + 10, zIndex: 60, height: pillH,
        display: 'flex', alignItems: 'center', gap: 3, pointerEvents: 'auto',
        cursor: dragging ? 'grabbing' : 'grab', touchAction: 'none', userSelect: 'none',
        WebkitUserSelect: 'none', background: T.surface2 || T.surface,
        border: `1px solid ${dragging ? T.accent || T.border : T.border}`, color: T.text,
        borderRadius: 999, padding: '0 9px', fontSize: 10.5, fontFamily: 'monospace', fontWeight: 700,
        fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap',
        opacity: dragging || awake ? 1 : 0.28, transition: 'opacity .28s ease',
      }}
    >
      <span>{st.first}</span>
      <span style={{ color: T.dim, fontWeight: 600 }}>/{total || st.n}</span>
    </div>
  );
}
