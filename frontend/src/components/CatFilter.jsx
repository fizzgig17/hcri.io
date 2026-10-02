// frontend/src/components/CatFilter.jsx
//
// Reconstructed from the deployed assets/app.js (minified function
// CatFilter({options,selected,theme,onChange})). A reusable multi-select
// dropdown for filtering by a category's values (e.g. LED Brand, Optic) --
// used in the admin categories panel's row reassignment and also in the
// Explore page's filter bar. Standalone and exported for reuse elsewhere.
//
// options: [{ id, value, ... }]   selected: string[] (ids, as strings)
// onChange(nextSelectedIds: string[])

import { useState, useEffect } from 'react';

export default function CatFilter({ options, selected, theme: t, onChange }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const sel = selected || [];
  const opts = options || [];

  const toggle = (id) => {
    const idStr = `${id}`;
    const next = sel.includes(idStr) ? sel.filter((i) => i !== idStr) : [...sel, idStr];
    onChange(next);
  };

  const label =
    sel.length === 0
      ? 'Any'
      : sel.length === 1
        ? (() => {
            const f = opts.find((i) => `${i.id}` === `${sel[0]}`);
            return f ? f.value : '1 selected';
          })()
        : `${sel.length} selected`;

  useEffect(() => {
    if (!open) setQ('');
  }, [open]);

  const filtered = q ? opts.filter((i) => (i.value || '').toLowerCase().includes(q.toLowerCase())) : opts;

  return (
    <div style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setOpen((e) => !e)}
        style={{
          width: '100%',
          boxSizing: 'border-box',
          textAlign: 'left',
          background: t.surface2 || t.surface,
          border: `1px solid ${open ? t.accent : t.border}`,
          borderRadius: 6,
          padding: '9px 12px',
          color: sel.length ? t.text : t.dim,
          fontSize: 14,
          fontFamily: 'monospace',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
        <span style={{ color: t.dim, fontSize: 11, flexShrink: 0 }}>{open ? '▲' : '▼'}</span>
      </button>
      {open && <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 90 }} />}
      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            zIndex: 100,
            background: t.surface,
            border: `1px solid ${t.border}`,
            borderRadius: 8,
            boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
            maxHeight: 280,
            display: 'flex',
            flexDirection: 'column',
            padding: 4,
          }}
        >
          <input
            type="text"
            value={q}
            autoFocus
            placeholder="Type to search…"
            onChange={(ev) => setQ(ev.target.value)}
            onClick={(ev) => ev.stopPropagation()}
            style={{
              width: '100%',
              boxSizing: 'border-box',
              background: t.bg,
              border: `1px solid ${t.border}`,
              borderRadius: 6,
              padding: '7px 9px',
              color: t.text,
              fontSize: 16,
              fontFamily: 'monospace',
              outline: 'none',
              marginBottom: 4,
              flexShrink: 0,
            }}
          />
          <div style={{ overflowY: 'auto' }}>
            {sel.length > 0 && (
              <div
                onClick={() => onChange([])}
                style={{
                  padding: '6px 10px',
                  fontSize: 12,
                  color: t.accent,
                  cursor: 'pointer',
                  fontFamily: 'monospace',
                  borderBottom: `1px solid ${t.border}`,
                  marginBottom: 2,
                }}
              >
                Clear selection
              </div>
            )}
            {filtered.length === 0 && (
              <div style={{ padding: '8px 10px', fontSize: 12, color: t.dim, fontFamily: 'monospace' }}>No matches</div>
            )}
            {filtered.map((i) => {
              const on = sel.includes(`${i.id}`);
              return (
                <div
                  key={i.id}
                  onClick={() => toggle(i.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '7px 10px',
                    fontSize: 13,
                    color: t.text,
                    cursor: 'pointer',
                    borderRadius: 4,
                    background: on ? `${t.accent}22` : 'transparent',
                    fontFamily: 'monospace',
                  }}
                >
                  <span
                    style={{
                      width: 14,
                      height: 14,
                      flexShrink: 0,
                      borderRadius: 3,
                      border: `1px solid ${on ? t.accent : t.dim}`,
                      background: on ? t.accent : 'transparent',
                      color: '#0a0f14',
                      fontSize: 11,
                      lineHeight: '13px',
                      textAlign: 'center',
                      fontWeight: 900,
                    }}
                  >
                    {on ? '✓' : ''}
                  </span>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{i.value}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
