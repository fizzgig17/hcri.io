// frontend/src/components/ReportActionsMenu.jsx
//
// Reconstructed from assets/app.js (minified fn `pe`). A "⋮" kebab menu in
// the report-view header with TM-30 Report / Share Link / Share Card /
// theme toggle / Help actions. Entirely new -- the stale ReportView.jsx
// this replaces had no such menu (its theme toggle was a standalone
// button and nothing else here existed at all).

import { useState } from 'react';

export default function ReportActionsMenu({
  isGuest, shareToken, isPublic, onTM30, onShareLink, onShareCard,
  onTheme, themeName, onHelp, theme: C,
}) {
  const [open, setOpen] = useState(false);
  const items = [
    { label: 'TM-30 Report', icon: '📋', action: onTM30 },
    (!isGuest || isPublic) && { label: 'Share Link', icon: '🔗', action: onShareLink },
    { label: 'Share Card', icon: '↗', action: onShareCard },
    { label: themeName === 'dark' ? 'Light Mode' : 'Dark Mode', icon: themeName === 'dark' ? '☀' : '🌙', action: onTheme },
    { label: 'Help & Reference', icon: '?', action: onHelp },
  ].filter(Boolean);

  return (
    <div style={{ position: 'relative', flexShrink: 0 }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          background: open ? `${C.accent}20` : C.surface,
          border: `1px solid ${open ? C.accent : C.border}`,
          color: open ? C.accent : C.text,
          borderRadius: 6, padding: '7px 10px', fontSize: 18, cursor: 'pointer', lineHeight: 1,
        }}
      >
        ⋮
      </button>
      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 998 }} />
          <div
            style={{
              position: 'absolute', top: 'calc(100% + 6px)', maxWidth: 'calc(100vw - 24px)',
              ...(typeof window !== 'undefined' && window.innerWidth <= 768 ? { left: 0, right: 'auto' } : { right: 0 }),
              background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 8, zIndex: 999,
              minWidth: 170, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
            }}
          >
            {items.map((item, i) => (
              <button
                key={i}
                onClick={() => { item.action(); setOpen(false); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '12px 16px',
                  background: 'none', border: 'none', color: C.text, fontSize: 14, cursor: 'pointer',
                  fontFamily: 'monospace', textAlign: 'left',
                  borderBottom: i < items.length - 1 ? `1px solid ${C.border}40` : 'none',
                }}
              >
                <span style={{ fontSize: 16, width: 22, textAlign: 'center' }}>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
