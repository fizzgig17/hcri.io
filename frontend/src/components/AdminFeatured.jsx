// frontend/src/components/AdminFeatured.jsx
//
// Reconstructed from the deployed assets/app.js (minified function
// AdminFeatured({theme:o})). Admin-only control, rendered as a small
// toolbar button ("★ Featured") that opens a modal for picking up to 3
// public reports to show on the logged-out homepage / Explore page.
// Backend: GET/POST /api/admin/featured (api/admin.php) -- GET returns
// { ids, reports }, POST body is { ids: number[] } (max 3, numeric only).

import { useState, useEffect } from 'react';
import { basePath, getToken } from '../lib/api';
import usePanelBackClose from '../hooks/usePanelBackClose';
import { useIsMobile } from '../hooks/useIsMobile';

export default function AdminFeatured({ theme: o }) {
  const [open, setOpen] = useState(false);
  const [ids, setIds] = useState(['', '', '']);
  const [reports, setReports] = useState([]);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  usePanelBackClose(open, () => setOpen(false));
  const isMobile = useIsMobile(768);

  const auth = () => ({ Authorization: `Bearer ${getToken()}` });

  const load = () => {
    fetch(`${basePath()}index.php/api/admin/featured`, { headers: auth() })
      .then((r) => r.json())
      .then((d) => {
        const a = (d.ids || []).map(String);
        setIds([a[0] || '', a[1] || '', a[2] || '']);
        setReports(d.reports || []);
      })
      .catch(() => {});
  };

  useEffect(() => {
    if (open) load();
  }, [open]);

  const save = () => {
    setSaving(true);
    setMsg('');
    const cleanIds = ids.map((x) => parseInt(x, 10)).filter((x) => x > 0);
    fetch(`${basePath()}index.php/api/admin/featured`, {
      method: 'POST',
      headers: { ...auth(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: cleanIds }),
    })
      .then((r) => r.json())
      .then((d) => {
        setSaving(false);
        if (d && Array.isArray(d.ids)) {
          setMsg('Saved ✓');
          load();
          setTimeout(() => setMsg(''), 2000);
        } else {
          setMsg((d && d.error) || 'Error');
        }
      })
      .catch(() => {
        setSaving(false);
        setMsg('Error');
      });
  };

  const inp = {
    background: o.surface,
    border: `1px solid ${o.border}`,
    borderRadius: 6,
    padding: '8px 10px',
    color: o.text,
    fontSize: 14,
    fontFamily: 'monospace',
    width: 72,
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          background: 'none',
          border: `1px solid ${o.border}`,
          color: o.dim,
          borderRadius: 6,
          padding: '5px 10px',
          fontSize: 12,
          cursor: 'pointer',
          fontFamily: 'monospace',
          marginLeft: 8,
        }}
      >
        ★ Featured
      </button>
      {open && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: isMobile ? o.bg : 'rgba(0,0,0,0.7)',
            zIndex: 3500,
            display: 'flex',
            alignItems: isMobile ? 'flex-start' : 'center',
            justifyContent: 'center',
            padding: isMobile ? 0 : 20,
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch',
          }}
          onClick={() => { if (!isMobile) setOpen(false); }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: o.surface,
              border: isMobile ? 'none' : `1px solid ${o.border}`,
              borderRadius: isMobile ? 0 : 12,
              padding: isMobile ? '18px 16px' : 24,
              width: '100%',
              maxWidth: isMobile ? '100%' : 460,
              minHeight: isMobile ? '100%' : 'auto',
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
              fontFamily: 'monospace',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 16, fontWeight: 900, color: o.white }}>Featured Reports</div>
              <button
                onClick={() => setOpen(false)}
                style={{ background: 'none', border: 'none', color: o.dim, fontSize: 20, cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>
            <div style={{ fontSize: 12, color: o.dim, lineHeight: 1.5 }}>
              Up to 3 public reports shown on the logged-out homepage. Enter report IDs (an ID
              appears in a report's URL, e.g. ?report=42). Reports must be public to appear.
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[0, 1, 2].map((idx) => {
                const rid = parseInt(ids[idx], 10);
                const rep = reports.find((r) => r.id === rid);
                const repLabel = rep
                  ? (rep.label || '#' + rid) + (rep.isPublic ? '' : ' — PRIVATE, won\'t show')
                  : '';
                return (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 12, color: o.dim, width: 50 }}>Slot {idx + 1}</span>
                    <input
                      value={ids[idx]}
                      onChange={(e) => {
                        const v = e.target.value.replace(/[^0-9]/g, '');
                        setIds((a) => {
                          const b = [...a];
                          b[idx] = v;
                          return b;
                        });
                      }}
                      placeholder="ID"
                      style={inp}
                    />
                    <span
                      style={{
                        fontSize: 12,
                        color: o.text,
                        flex: 1,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {repLabel}
                    </span>
                  </div>
                );
              })}
            </div>
            {msg && <div style={{ fontSize: 13, color: o.accent, fontWeight: 700 }}>{msg}</div>}
            <button
              onClick={save}
              disabled={saving}
              style={{
                background: o.accent,
                border: 'none',
                color: o.bg,
                borderRadius: 8,
                padding: '11px',
                fontWeight: 900,
                fontSize: 14,
                cursor: 'pointer',
                fontFamily: 'monospace',
                opacity: saving ? 0.6 : 1,
              }}
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
