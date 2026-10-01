// frontend/src/components/PasteSPDModal.jsx
//
// Reconstructed from assets/app.js (minified function Le). Opened from the
// Sidebar's "Paste nm / value data" button (see Sidebar.jsx's onPaste prop).
// Lets a user type or paste raw wavelength/value pairs directly instead of
// uploading a file, posts them to api/paste_analyze.php, and hands the
// resulting report back to the caller via onResult -- the same shape a
// file upload would produce, so the caller can treat it identically (show
// it, and for a logged-in user optionally persist it with "Save to my
// reports").
import { useState } from 'react';
import { useTheme } from '../lib/ThemeContext.jsx';
import { getToken, basePath } from '../lib/api';

// Example snippets shown in the sidebar of the modal, in the exact order
// the deployed bundle lists them (var `Ie`), content copied verbatim from
// the bundle (two data rows for the plain comma/tab/space formats, one
// data row for the header-row and comment-line formats, matching what the
// deployed app actually shows).
const FORMATS = [
  { label: 'Two columns (comma)', example: '450, 390.61\n460, 347.39' },
  { label: 'Two columns (tab)', example: '450\t390.61\n460\t347.39' },
  { label: 'Two columns (space)', example: '450 390.61\n460 347.39' },
  { label: 'Header rows OK', example: 'wavelength,power\n450,390.61' },
  { label: 'Comment lines OK', example: '# My LED\n450,390.61' },
];

// The textarea's own placeholder sample (bundle var `Fe`) -- the same LED
// spectrum sample FORMATS draws its 450/460 rows from, given here in full
// (380-500nm at 10nm steps; the bundle's sample itself stops at 500nm, it
// isn't abbreviated from a longer 380-780nm table).
const PLACEHOLDER_EXAMPLE = '380,3.11\n390,3.78\n400,4.73\n410,8.85\n420,20.96\n430,69.72\n440,199.95\n450,390.61\n460,347.39\n470,245.68\n480,208.06\n490,242.17\n500,266.48';

function countValidPoints(text) {
  return text.split(/[\r\n]+/).filter(line => {
    const t = line.trim().split(/[\t, ]+/);
    return t.length >= 2 && !isNaN(t[0]) && !isNaN(t[1]) && +t[0] >= 350 && +t[0] <= 850;
  }).length;
}

export default function PasteSPDModal({ user, onResult, onClose }) {
  const { theme: T } = useTheme();
  const [text, setText] = useState('');
  const [label, setLabel] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [save, setSave] = useState(!!user);
  const [instrumentModel, setInstrumentModel] = useState('');
  const [instrumentVersion, setInstrumentVersion] = useState('');

  const validCount = countValidPoints(text);

  const btn = { background: `${T.accent}18`, border: `1px solid ${T.accent}60`, color: T.accent, borderRadius: 5, padding: '7px 16px', fontSize: 13, cursor: 'pointer', fontFamily: 'monospace', fontWeight: 700 };
  const input = { background: T.bg, border: `1px solid ${T.border}`, borderRadius: 5, padding: '8px 10px', color: T.text, fontSize: 13, outline: 'none', fontFamily: 'monospace', width: '100%', boxSizing: 'border-box' };
  const fieldLabel = { fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, color: T.dim, fontWeight: 700, display: 'block', marginBottom: 5 };

  async function analyze() {
    if (!text.trim()) { setError('Paste some data first'); return; }
    setBusy(true); setError('');
    try {
      const res = await fetch(`${basePath()}index.php/api/paste_analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}) },
        body: JSON.stringify({
          text,
          label: label || 'Pasted SPD',
          save: save && !!user,
          instrumentModel: instrumentModel || null,
          instrumentVersion: instrumentVersion || null,
        }),
      });
      const r = await res.json();
      if (!res.ok) throw new Error(r.error || 'Analysis failed');
      onResult(r);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, width: '100%', maxWidth: 700, maxHeight: '92vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: `1px solid ${T.border}`, background: T.surface2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: T.white, fontFamily: 'monospace' }}>Paste SPD Data</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: T.dim, fontSize: 20, cursor: 'pointer' }}>✕</button>
        </div>

        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          <div style={{ flex: 1, padding: 20, display: 'flex', flexDirection: 'column', gap: 14, overflowY: 'auto' }}>
            <div>
              <label style={fieldLabel}>Source Name</label>
              <input style={input} value={label} onChange={e => setLabel(e.target.value)} placeholder="e.g. My LED 3000K" />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <div style={{ flex: 1 }}>
                <label style={fieldLabel}>Instrument / Device</label>
                <input style={input} value={instrumentModel} onChange={e => setInstrumentModel(e.target.value)} placeholder="e.g. OHSP-350C" />
              </div>
              <div style={{ flex: 1 }}>
                <label style={fieldLabel}>Model / Version</label>
                <input style={input} value={instrumentVersion} onChange={e => setInstrumentVersion(e.target.value)} placeholder="e.g. v2.1" />
              </div>
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                <label style={fieldLabel}>Wavelength / Value Pairs</label>
                {validCount > 0 && <span style={{ fontSize: 11, color: T.good, fontFamily: 'monospace' }}>{validCount} valid points detected</span>}
              </div>
              <textarea
                style={{ ...input, flex: 1, minHeight: 260, resize: 'vertical', lineHeight: 1.6 }}
                value={text}
                onChange={e => { setText(e.target.value); setError(''); }}
                placeholder={`Paste nm and value pairs, one per line:\n\n${PLACEHOLDER_EXAMPLE}`}
                spellCheck={false}
              />
            </div>
            {error && <div style={{ fontSize: 13, color: T.bad, fontFamily: 'monospace', fontWeight: 600 }}>⚠ {error}</div>}
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
              {user && (
                <label style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, color: T.dim, cursor: 'pointer' }}>
                  <input type="checkbox" checked={save} onChange={e => setSave(e.target.checked)} style={{ accentColor: T.accent }} />
                  Save to my reports
                </label>
              )}
              <div style={{ flex: 1 }} />
              <button onClick={onClose} style={{ ...btn, background: 'none', color: T.dim, border: `1px solid ${T.border}` }}>Cancel</button>
              <button onClick={analyze} disabled={busy || validCount < 10} style={{ ...btn, opacity: busy || validCount < 10 ? 0.5 : 1 }}>
                {busy ? 'Analyzing…' : `Analyze ${validCount > 0 ? `(${validCount} pts)` : ''}`}
              </button>
            </div>
          </div>

          <div style={{ width: 220, flexShrink: 0, borderLeft: `1px solid ${T.border}`, background: T.surface2, padding: 16, overflowY: 'auto' }}>
            <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, color: T.dim, fontWeight: 700, marginBottom: 12 }}>Accepted Formats</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {FORMATS.map((f, i) => (
                <div key={i}>
                  <div style={{ fontSize: 11, color: T.accent, fontWeight: 700, marginBottom: 4 }}>{f.label}</div>
                  <pre style={{ fontSize: 11, color: T.text, background: T.bg, borderRadius: 4, padding: '6px 8px', margin: 0, fontFamily: 'monospace', lineHeight: 1.6, border: `1px solid ${T.border}` }}>{f.example}</pre>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 16, padding: '10px 12px', background: `${T.accent}12`, borderRadius: 6, border: `1px solid ${T.accent}30` }}>
              <div style={{ fontSize: 11, color: T.accent, fontWeight: 700, marginBottom: 6 }}>Range</div>
              <div style={{ fontSize: 11, color: T.dim, lineHeight: 1.7 }}>
                Wavelengths from <strong style={{ color: T.text }}>350–850 nm</strong> are accepted. Full 380–780 nm gives most accurate results. Sparse data (e.g. every 3–5 nm) is fine — values are interpolated to 5 nm grid.
              </div>
            </div>
            <div style={{ marginTop: 12, padding: '10px 12px', background: T.surface, borderRadius: 6, border: `1px solid ${T.border}` }}>
              <div style={{ fontSize: 11, color: T.dim, fontWeight: 700, marginBottom: 6 }}>Tip</div>
              <div style={{ fontSize: 11, color: T.dim, lineHeight: 1.7 }}>Values can be raw radiance (any scale) — they're normalized automatically before calculation.</div>
            </div>
            <div style={{ marginTop: 8, padding: '10px 12px', background: `${T.accent}10`, borderRadius: 6, border: `1px solid ${T.accent}30` }}>
              <div style={{ fontSize: 11, color: T.accent, fontWeight: 700, marginBottom: 6 }}>Ra / R9</div>
              <div style={{ fontSize: 11, color: T.dim, lineHeight: 1.7 }}>If you know Ra and R9 from your instrument, enter them above for accurate CRI. Otherwise they'll be calculated from the SPD.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
