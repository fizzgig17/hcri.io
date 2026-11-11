// frontend/src/components/ScrollRow.jsx
//
// A single row of buttons/chips that scrolls sideways when it does not fit, with a fade + arrow on whichever edge has more
// hidden (the same look as the Profile window's tab bar). Used for the admin tool buttons on mobile.

import { useRef, useState, useEffect, useCallback } from 'react';

export default function ScrollRow({ children, bg, accent, style }) {
  const ref = useRef(null);
  const [edge, setEdge] = useState({ left: false, right: false });
  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setEdge({ left: el.scrollLeft > 2, right: el.scrollLeft + el.clientWidth < el.scrollWidth - 2 });
  }, []);
  useEffect(() => {
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [update]);

  const fade = (side) => edge[side] && (
    <div aria-hidden="true" style={{
      position: 'absolute', top: 0, bottom: 0, [side]: 0, width: 30, pointerEvents: 'none',
      display: 'flex', alignItems: 'center', justifyContent: side === 'left' ? 'flex-start' : 'flex-end',
      background: `linear-gradient(to ${side === 'left' ? 'right' : 'left'}, ${bg} 35%, transparent)`,
      color: accent, fontSize: 18, fontWeight: 700, padding: '0 4px', boxSizing: 'border-box',
    }}>{side === 'left' ? '‹' : '›'}</div>
  );

  return (
    <div style={{ position: 'relative', ...style }}>
      <div ref={ref} onScroll={update} style={{ display: 'flex', alignItems: 'center', overflowX: 'auto', whiteSpace: 'nowrap', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch', padding: '2px 0' }}>
        {children}
      </div>
      {fade('left')}
      {fade('right')}
    </div>
  );
}
