// frontend/src/components/HelpTip.jsx
//
// Reconstructed from assets/app.js (minified fn `re`). A small "?" badge
// that shows a floating help popover on hover, flipping to the left when
// it would otherwise overflow the right edge of the viewport. Entirely new
// -- the stale ReportView.jsx this replaces had no inline help at all.

import { useState, useRef } from 'react';
import { useTheme } from '../lib/ThemeContext.jsx';
import { useIsMobile } from '../hooks/useIsMobile.js';

export default function HelpTip({ text, children }) {
  const { theme: T } = useTheme();
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0, align: 'left' });
  const ref = useRef();
  const isMobile = useIsMobile(768);

  function show() {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const roomRight = window.innerWidth - r.right;
    setPos({
      x: roomRight > 220 ? r.right + 6 : r.left - 6,
      y: r.top,
      align: roomRight > 220 ? 'left' : 'right',
    });
    setOpen(true);
  }

  return (
    <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
      <span
        ref={ref}
        onMouseEnter={show}
        onMouseLeave={() => setOpen(false)}
        style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: isMobile ? 18 : 14, height: isMobile ? 18 : 14, borderRadius: '50%',
          fontSize: isMobile ? 12 : 9, fontWeight: 700, cursor: 'help', flexShrink: 0,
          background: `${T.accent}20`, border: `1px solid ${T.accent}50`, color: T.accent,
          fontFamily: 'monospace', marginLeft: 4, verticalAlign: 'middle', lineHeight: 1,
        }}
      >
        ?
      </span>
      {open && (
        <div
          style={{
            position: 'fixed',
            left: pos.align === 'left' ? pos.x : undefined,
            right: pos.align === 'right' ? window.innerWidth - pos.x : undefined,
            top: pos.y,
            background: T.name === 'dark' ? '#1a3050' : '#f8faff',
            border: `1px solid ${T.border}`,
            borderRadius: 7, padding: '10px 12px', maxWidth: 240, fontSize: 12,
            color: T.text, lineHeight: 1.7, zIndex: 9999,
            boxShadow: '0 4px 20px rgba(0,0,0,0.4)', fontFamily: 'monospace',
            pointerEvents: 'none', whiteSpace: 'pre-line',
          }}
        >
          {text}
        </div>
      )}
      {children}
    </span>
  );
}
