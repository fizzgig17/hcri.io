// frontend/src/components/QuickFieldsModal.jsx
//
// "Fill in" dialog opened from a report card: just the key LED fields (brand, model, CCT), using the same
// category editor as the full report page (changes save as you make them). onClose(changed) tells the list
// to refresh its cards.
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { getToken } from '../lib/api';
import CategoryEditor from './CategoryEditor.jsx';

export default function QuickFieldsModal({ reportId, label, T: t, onClose, onOpenFull }) {
  const [report, setReport] = useState(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    let dead = false;
    fetch(`./index.php/api/reports/${reportId}`, { headers: { Authorization: `Bearer ${getToken()}` } })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('Could not load this report'))))
      .then((j) => { if (!dead) setReport(j); })
      .catch((e) => { if (!dead) setErr(e.message); });
    return () => { dead = true; };
  }, [reportId]);

  return createPortal(
    <div
      onClick={() => onClose(true)}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ background: t.surface, color: t.text, border: `1px solid ${t.border}`, borderRadius: 12, padding: 18, width: 'min(460px,100%)', maxHeight: '85vh', overflowY: 'auto' }}
      >
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 2 }}>LED details</div>
        <div style={{ fontSize: 12, color: t.dim, marginBottom: 12, wordBreak: 'break-word' }}>{label || 'Unnamed'}</div>
        {err && <div style={{ color: t.bad, fontSize: 13 }}>{err}</div>}
        {!report && !err && <div style={{ color: t.dim, fontSize: 13 }}>Loading…</div>}
        {report && <CategoryEditor report={report} isGuest={false} kinds={['led_brand', 'led_model', 'led_cct']} />}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14, gap: 8 }}>
          {onOpenFull ? (
            <button onClick={() => onOpenFull()} style={{ background: 'none', border: 'none', color: t.accent, cursor: 'pointer', fontSize: 12, padding: 0 }}>
              More fields in the full report →
            </button>
          ) : <span />}
          <button
            onClick={() => onClose(true)}
            style={{ background: t.accent, color: '#fff', border: 'none', borderRadius: 6, padding: '7px 16px', fontWeight: 700, cursor: 'pointer' }}
          >
            Done
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
