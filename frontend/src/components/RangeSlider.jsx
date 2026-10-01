// frontend/src/components/RangeSlider.jsx
//
// Reconstructed from assets/app.js (minified function ze). A dual-handle
// (min/max) range slider used by the Explore page's filter panel (e.g.
// CCT range, Ra range). Pointer-based rather than relying on two native
// <input type=range> elements, so both handles can be dragged
// independently and the filled track between them is drawn manually.
//
// value is [low, high]; onChange receives the next [low, high] pair.
import { useRef, useState } from 'react';

export default function RangeSlider({ label, min, max, value, onChange, step = 1, fmt = v => v, T: t }) {
  const [low, high] = value;
  const dark = t.name === 'dark';
  const trackRef = useRef(null);
  const [drag, setDrag] = useState(null); // 'low' | 'high' | null

  // Convert a value in [min, max] to a left-offset percentage along the track.
  const pct = v => (max === min ? 0 : Math.max(0, Math.min(100, ((v - min) / (max - min)) * 100)));

  // Convert a pointer event's clientX to a value on the track, snapped to `step`.
  const valFromClientX = cx => {
    const rc = trackRef.current.getBoundingClientRect();
    const p = Math.max(0, Math.min(1, (cx - rc.left) / (rc.width || 1))); // 0..1 across the track
    const raw = min + p * (max - min);
    const stepped = Math.round(raw / step) * step;
    return Math.max(min, Math.min(max, stepped));
  };

  // Begin dragging a specific handle ('low' or 'high'); captures the pointer
  // so move/up events keep firing even if the cursor leaves the handle.
  const down = (which, ev) => {
    ev.preventDefault();
    try { ev.currentTarget.setPointerCapture(ev.pointerId); } catch (e) {}
    setDrag(which);
  };
  // While a handle is captured, recompute its value from the pointer position
  // and clamp it so the two handles can't cross (each stays `step` away from
  // the other).
  const move = ev => {
    if (!drag || !trackRef.current) return;
    ev.preventDefault();
    const v = valFromClientX(ev.clientX);
    if (drag === 'low') onChange([Math.min(v, high - step), high]);
    else onChange([low, Math.max(v, low + step)]);
  };
  const up = ev => {
    if (drag) {
      try { ev.currentTarget.releasePointerCapture(ev.pointerId); } catch (e) {}
    }
    setDrag(null);
  };
  // Clicking the bare track (not a handle) jumps whichever handle is closer
  // to the click, then starts dragging it from there.
  const onTrackDown = ev => {
    if (!trackRef.current) return;
    const v = valFromClientX(ev.clientX);
    const which = Math.abs(v - low) <= Math.abs(v - high) ? 'low' : 'high';
    down(which, ev);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontFamily: 'monospace' }}>
        <span style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, color: t.text }}>{label}</span>
        <span style={{ color: t.accent, fontWeight: 700 }}>{fmt(low)} – {fmt(high)}</span>
      </div>
      <div
        ref={trackRef}
        onPointerDown={onTrackDown}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
        style={{ position: 'relative', height: 24, display: 'flex', alignItems: 'center', touchAction: 'none', cursor: drag ? 'grabbing' : 'pointer' }}
      >
        <div style={{ position: 'absolute', left: 0, right: 0, height: 4, background: dark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)', borderRadius: 2, pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', left: `${pct(low)}%`, right: `${100 - pct(high)}%`, height: '100%', background: t.accent, borderRadius: 2 }} />
        </div>
        <div
          onPointerDown={ev => down('low', ev)}
          style={{
            position: 'absolute', left: `${pct(low)}%`, width: 20, height: 20, borderRadius: '50%', background: t.accent,
            transform: 'translateX(-50%)', boxShadow: drag === 'low' ? '0 2px 8px rgba(0,0,0,0.45)' : '0 1px 4px rgba(0,0,0,0.3)',
            cursor: drag === 'low' ? 'grabbing' : 'grab', zIndex: drag === 'low' ? 6 : 3, touchAction: 'none',
          }}
        />
        <div
          onPointerDown={ev => down('high', ev)}
          style={{
            position: 'absolute', left: `${pct(high)}%`, width: 20, height: 20, borderRadius: '50%', background: t.accent,
            transform: 'translateX(-50%)', boxShadow: drag === 'high' ? '0 2px 8px rgba(0,0,0,0.45)' : '0 1px 4px rgba(0,0,0,0.3)',
            cursor: drag === 'high' ? 'grabbing' : 'grab', zIndex: drag === 'high' ? 6 : 4, touchAction: 'none',
          }}
        />
      </div>
    </div>
  );
}
