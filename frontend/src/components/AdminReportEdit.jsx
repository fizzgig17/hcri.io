// frontend/src/components/AdminReportEdit.jsx
//
// Reconstructed from the deployed assets/app.js (minified function
// AdminReportEdit({report,T,onSaved})). An inline admin editor for a single
// report's title/notes/categories/public-visibility, shown above the full
// report view inside AdminReportModal.jsx (Me). Category kinds behave as
// free-text chip inputs backed by a datalist of existing values, except
// 'lumens' and 'current' which are single plain numeric fields.
//
// Backend: GET /api/categories (value suggestions), PATCH /api/admin/reports/:id
// (api/admin.php) -- body { label, notes, categories: { kind: [values] }, isPublic }

import LedGroupsEditor from './LedGroupsEditor.jsx';
import { useState, useEffect } from 'react';
import { basePath, getToken } from '../lib/api';

async function adminFetch(path, opts = {}) {
  const res = await fetch(`${basePath()}index.php/api/admin${path}`, {
    ...opts,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}`, ...(opts.headers || {}) },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || res.statusText);
  return data;
}

const LED_IDS = ['led_brand', 'led_model', 'led_cct'];
const FIELDS = [
  ['light_brand', 'Light Brand'],
  ['light_model', 'Light Model'],
  ['led_cct', 'LED CCT'],
  ['led_brand', 'LED Brand'],
  ['led_model', 'LED Model'],
  ['optic', 'Optic'],
  ['lumens', 'Lumens'],
  ['current', 'Current (A)'],
];

export default function AdminReportEdit({ report, T: t, onSaved }) {
  const catValues = (k) => ((report && report.categories && report.categories[k]) || []).map((c) => c && c.value).filter(Boolean);
  const initCats = () => {
    const o = {};
    for (const [k] of FIELDS) o[k] = catValues(k);
    return o;
  };

  const [label, setLabel] = useState((report && report.label) || '');
  const [notes, setNotes] = useState((report && report.notes) || '');
  const [cats, setCats] = useState(initCats);
  const [draft, setDraft] = useState({});
  const [opts, setOpts] = useState({});
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [excluded, setExcluded] = useState(() => !(report && report.isPublic));

  useEffect(() => {
    setLabel((report && report.label) || '');
    setNotes((report && report.notes) || '');
    setCats(initCats());
    setExcluded(!(report && report.isPublic));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [report && report.id]);

  useEffect(() => {
    fetch(`${basePath()}index.php/api/categories`)
      .then((r) => r.json())
      .then(setOpts)
      .catch(() => {});
  }, []);

  const save = async () => {
    setBusy(true);
    setMsg('');
    try {
      const r = await adminFetch(`/reports/${report.id}`, {
        method: 'PATCH',
        // LED brand / LED / CCT are saved as LED groups by the editor below, not through the per-kind chips.
        body: JSON.stringify({ label, notes, categories: Object.fromEntries(Object.entries(cats).filter(([k]) => !LED_IDS.includes(k))), isPublic: !excluded }),
      });
      setMsg('Saved ✓');
      if (onSaved) onSaved(r);
    } catch (x) {
      setMsg(`Error: ${(x && x.message) || 'save failed'}`);
    }
    setBusy(false);
  };

  const inp = {
    background: t.bg,
    border: `1px solid ${t.border}`,
    borderRadius: 5,
    padding: '8px 10px',
    color: t.text,
    fontSize: 13,
    outline: 'none',
    fontFamily: 'monospace',
    width: '100%',
    boxSizing: 'border-box',
  };
  const lbl = {
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: t.dim,
    fontWeight: 700,
    display: 'block',
    marginBottom: 4,
  };

  return (
    <div style={{ background: t.surface2, border: `1px solid ${t.border}`, borderRadius: 8, padding: 16, margin: '12px 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: t.accent, textTransform: 'uppercase', letterSpacing: 1 }}>
          Admin Edit
        </div>
        <span style={{ fontSize: 11, color: t.dim }}>{msg}</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 10, marginBottom: 10 }}>
        <div>
          <label style={lbl}>Title</label>
          <input value={label} onChange={(e) => setLabel(e.target.value)} style={inp} />
        </div>
        <div>
          <label style={lbl}>Notes</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} style={{ ...inp, resize: 'vertical' }} />
        </div>
      </div>
      <div style={{ marginBottom: 12 }}>
        <LedGroupsEditor
          report={report}
          isGuest={false}
          saveFn={async (leds) => {
            const r = await adminFetch(`/reports/${report.id}`, { method: 'PATCH', body: JSON.stringify({ leds }) });
            return { leds: (r && r.leds) || [] };
          }}
        />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 10, marginBottom: 12 }}>
        {FIELDS.filter(([k]) => !LED_IDS.includes(k)).map(([k, lab]) => {
          if (k === 'lumens' || k === 'current') {
            return (
              <div key={k}>
                <label style={lbl}>{lab}</label>
                <input
                  value={(cats[k] || [])[0] || ''}
                  onChange={(e) => {
                    let v = e.target.value.replace(/[^\d.]/g, '');
                    const i = v.indexOf('.');
                    if (i >= 0) v = v.slice(0, i + 1) + v.slice(i + 1).replace(/\./g, '');
                    setCats((c) => ({ ...c, [k]: v ? [v] : [] }));
                  }}
                  placeholder={k === 'lumens' ? 'e.g. 450' : 'e.g. 0.35'}
                  inputMode="decimal"
                  style={inp}
                />
              </div>
            );
          }
          const chips = cats[k] || [];
          const dd = draft[k] || '';
          const addV = (val) => {
            val = (val || '').trim();
            if (!val || chips.some((x) => x.toLowerCase() === val.toLowerCase())) return;
            setCats((c) => ({ ...c, [k]: [...(c[k] || []), val] }));
          };
          const rmV = (val) => setCats((c) => ({ ...c, [k]: (c[k] || []).filter((x) => x !== val) }));
          return (
            <div key={k}>
              <label style={lbl}>{lab}</label>
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 5,
                  alignItems: 'center',
                  background: t.bg,
                  border: `1px solid ${t.border}`,
                  borderRadius: 5,
                  padding: '5px 6px',
                  minHeight: 34,
                  boxSizing: 'border-box',
                }}
              >
                {chips.map((v) => (
                  <span
                    key={v}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 5,
                      background: `${t.accent}1f`,
                      border: `1px solid ${t.accent}55`,
                      color: t.text,
                      borderRadius: 12,
                      padding: '2px 4px 2px 9px',
                      fontSize: 12,
                      fontFamily: 'monospace',
                    }}
                  >
                    {v}
                    <button
                      type="button"
                      onClick={() => rmV(v)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: t.dim,
                        cursor: 'pointer',
                        fontSize: 14,
                        lineHeight: 1,
                        padding: '0 3px',
                      }}
                    >
                      ×
                    </button>
                  </span>
                ))}
                <input
                  list={`aedl_${k}`}
                  value={dd}
                  placeholder={chips.length ? 'add…' : '—'}
                  onChange={(r) => {
                    const val = r.target.value;
                    setDraft((d) => ({ ...d, [k]: val }));
                    if ((opts[k] || []).some((o) => o.value === val)) {
                      addV(val);
                      setDraft((d) => ({ ...d, [k]: '' }));
                    }
                  }}
                  onKeyDown={(r) => {
                    if (r.key === 'Enter' || r.key === ',') {
                      r.preventDefault();
                      addV(dd);
                      setDraft((d) => ({ ...d, [k]: '' }));
                    }
                  }}
                  onBlur={() => {
                    if (dd.trim()) {
                      addV(dd);
                      setDraft((d) => ({ ...d, [k]: '' }));
                    }
                  }}
                  style={{
                    flex: 1,
                    minWidth: 60,
                    background: 'none',
                    border: 'none',
                    color: t.text,
                    fontSize: 13,
                    fontFamily: 'monospace',
                    outline: 'none',
                    padding: '2px',
                  }}
                />
                <datalist id={`aedl_${k}`}>
                  {(opts[k] || []).map((o) => (
                    <option key={o.id} value={o.value} />
                  ))}
                </datalist>
              </div>
            </div>
          );
        })}
      </div>
      <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', marginBottom: 14, userSelect: 'none' }}>
        <input
          type="checkbox"
          checked={excluded}
          onChange={(e) => setExcluded(e.target.checked)}
          style={{ accentColor: t.accent, width: 16, height: 16, cursor: 'pointer' }}
        />
        <span style={{ fontSize: 13, color: excluded ? t.warn : t.dim, fontFamily: 'monospace', fontWeight: excluded ? 700 : 400 }}>
          Exclude Report From Explore
        </span>
      </label>
      <button
        onClick={save}
        disabled={busy}
        style={{
          background: `${t.accent}22`,
          border: `1px solid ${t.accent}`,
          color: t.accent,
          borderRadius: 6,
          padding: '8px 18px',
          fontSize: 13,
          fontWeight: 700,
          cursor: busy ? 'default' : 'pointer',
          fontFamily: 'monospace',
          opacity: busy ? 0.6 : 1,
        }}
      >
        {busy ? 'Saving…' : 'Save changes'}
      </button>
    </div>
  );
}
