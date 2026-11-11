// frontend/src/components/SuggestCategory.jsx
//
// "Suggest a new entry": anyone signed in can suggest a value for any of the curated lists (light brand / model,
// LED CCT / brand / model, optic). An admin reviews suggestions (Admin > Categories > Suggestions) and approves or
// rejects them. Also lists the person's own earlier suggestions and what became of them.
// Backend: POST /api/categories/suggest, GET /api/categories/suggestions (api/_core/category_requests.php).

import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { useTheme } from '../lib/ThemeContext.jsx';

export const SUGGEST_KINDS = [
  ['light_brand', 'Light Brand'],
  ['light_model', 'Light Model'],
  ['led_cct', 'LED CCT'],
  ['led_brand', 'LED Brand'],
  ['led_model', 'LED Model'],
  ['optic', 'Optic'],
];
const kindLabel = (k) => (SUGGEST_KINDS.find((x) => x[0] === k) || [k, k])[1];

export default function SuggestCategory({ onClose, kind: kind0 = '', value: value0 = '', isGuest = false }) {
  const { theme: T } = useTheme();
  const [kind, setKind] = useState(SUGGEST_KINDS.some((x) => x[0] === kind0) ? kind0 : 'light_brand');
  const [value, setValue] = useState(value0);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);   // { ok, text }
  const [mine, setMine] = useState([]);

  const loadMine = () => { if (!isGuest) api.get('/categories/suggestions').then((d) => setMine(d.items || [])).catch(() => {}); };
  useEffect(loadMine, []); // eslint-disable-line react-hooks/exhaustive-deps

  const submit = async (e) => {
    e.preventDefault();
    if (!value.trim() || busy) return;
    setBusy(true); setResult(null);
    try {
      const d = await api.post('/categories/suggest', { kind, value, note });
      if (d.status === 'exists') setResult({ ok: true, text: `“${d.value}” is already in the ${kindLabel(kind)} list; you can pick it there.` });
      else if (d.status === 'already') setResult({ ok: true, text: 'You already suggested that one; it is waiting for review.' });
      else { setResult({ ok: true, text: `Thanks! “${d.value}” was sent for review. It is added to the list once approved.` }); setValue(''); setNote(''); }
      loadMine();
    } catch (ex) { setResult({ ok: false, text: ex.message || 'Could not send the suggestion' }); }
    setBusy(false);
  };

  const s = {
    overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.78)', zIndex: 2100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 },
    modal: { background: T.surface2, border: `1px solid ${T.border}`, borderRadius: 10, width: '100%', maxWidth: 440, maxHeight: 'calc(100dvh - 32px)', display: 'flex', flexDirection: 'column', fontFamily: 'monospace', overflow: 'hidden' },
    head: { padding: '14px 18px', borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 },
    body: { padding: 18, overflowY: 'auto', minHeight: 0 },
    label: { fontSize: 11, color: T.dim, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700, display: 'block', marginBottom: 5 },
    input: { width: '100%', background: T.surface, border: `1px solid ${T.border}`, color: T.text, borderRadius: 5, padding: '8px 10px', fontSize: 13, fontFamily: 'monospace', boxSizing: 'border-box', marginBottom: 12 },
  };
  const stat = { pending: [T.dim, 'waiting for review'], approved: [T.good || '#4ade80', 'added'], rejected: [T.bad || '#f87171', 'not added'] };

  return (
    <div style={s.overlay} onClick={onClose}>
      <div style={s.modal} onClick={(e) => e.stopPropagation()}>
        <div style={s.head}>
          <span style={{ fontWeight: 700, color: T.white || T.text, fontSize: 14 }}>Suggest a new entry</span>
          <button onClick={onClose} aria-label="Close" style={{ background: 'none', border: 'none', color: T.dim, fontSize: 20, cursor: 'pointer' }}>×</button>
        </div>
        <div style={s.body}>
          {isGuest ? (
            <div style={{ fontSize: 13, color: T.dim, lineHeight: 1.5 }}>Sign in to suggest new entries for the category lists.</div>
          ) : (
            <form onSubmit={submit}>
              <div style={{ fontSize: 12, color: T.dim, lineHeight: 1.5, marginBottom: 12 }}>
                Can’t find your light, LED or optic in a list? Suggest it and it will be added once reviewed.
              </div>
              <label style={s.label}>List</label>
              <select value={kind} onChange={(e) => setKind(e.target.value)} style={s.input}>
                {SUGGEST_KINDS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
              </select>
              <label style={s.label}>New entry</label>
              <input value={value} onChange={(e) => setValue(e.target.value)} maxLength={120} autoFocus placeholder={kind === 'led_cct' ? 'e.g. 2700K' : kind === 'led_brand' ? 'e.g. Nichia' : kind === 'led_model' ? 'e.g. 519A' : ''} style={s.input} />
              <label style={s.label}>Note (optional)</label>
              <textarea value={note} onChange={(e) => setNote(e.target.value)} maxLength={500} rows={2} placeholder="Anything that helps: a link, the maker, how it is spelled" style={{ ...s.input, resize: 'vertical' }} />
              {result && <div style={{ fontSize: 12, color: result.ok ? (T.good || '#4ade80') : (T.bad || '#f87171'), marginBottom: 10, lineHeight: 1.45 }}>{result.text}</div>}
              <button type="submit" disabled={busy || !value.trim()} style={{ width: '100%', padding: 10, borderRadius: 5, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700, fontFamily: 'monospace', background: T.accent, color: '#000', opacity: busy || !value.trim() ? 0.5 : 1 }}>
                {busy ? 'Sending…' : 'Send suggestion'}
              </button>
            </form>
          )}
          {mine.length > 0 && (
            <div style={{ marginTop: 18 }}>
              <div style={s.label}>Your suggestions</div>
              {mine.slice(0, 15).map((m) => (
                <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 10, fontSize: 12, padding: '5px 0', borderTop: `1px solid ${T.border}55` }}>
                  <span style={{ color: T.text, wordBreak: 'break-word' }}>{m.value} <span style={{ color: T.dim }}>· {kindLabel(m.kind)}</span></span>
                  <span style={{ color: (stat[m.status] || stat.pending)[0], whiteSpace: 'nowrap' }}>{(stat[m.status] || stat.pending)[1]}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
