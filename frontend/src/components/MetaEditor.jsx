// frontend/src/components/MetaEditor.jsx
//
// Reconstructed from assets/app.js (minified fns ge, he, me). Replaces the
// stale ReportView.jsx's MetaEditor, which edited a `model`/`manufacturer`/
// `ledDetails` set of fields that do not exist anywhere in the backend
// (api/reports_item.php's PATCH only ever accepts `label` and `notes`).
// The real editor has exactly two free-text fields -- Title (label) and
// Notes -- each edited in place by click-to-edit (`EditableField`/he), plus
// a category tag editor (`Cat` in the bundle) for the structured
// light/LED/optic fields seen elsewhere (e.g. the Annex E export).
//
// `RenameField` (me) is a second, simpler click-to-edit pattern (an input
// that replaces a plain text label while editing) used for the report
// title elsewhere in the bundle.

import { useState, useRef, useEffect } from 'react';
import { useTheme } from '../lib/ThemeContext.jsx';
import { useIsMobile } from '../hooks/useIsMobile.js';
import CategoryEditor from './CategoryEditor.jsx';

// EditableField (he): a labeled value that becomes an <input>/<textarea>
// on click (when not a guest), saving on blur or Enter, reverting on Escape
// or save failure. Also nudges the mobile viewport meta tag so iOS doesn't
// leave the page zoomed in after the on-screen keyboard closes.
export function EditableField({ label, value, placeholder, isGuest, multiline, onSave }) {
  const { theme: T } = useTheme();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value || '');
  const ref = useRef();
  const prev = useRef(value);

  if (prev.current !== value) { prev.current = value; setDraft(value || ''); }
  useEffect(() => { if (editing && ref.current) ref.current.focus(); }, [editing]);

  async function commit() {
    setEditing(false);
    const vp = document.querySelector('meta[name=viewport]');
    if (vp) {
      vp.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0';
      setTimeout(() => { vp.content = 'width=device-width, initial-scale=1.0'; }, 50);
    }
    const n = draft.trim();
    if (n !== (value || '').trim()) {
      try { await onSave(n); } catch (e) { console.error(e); setDraft(value || ''); }
    }
  }
  function onKeyDown(e) {
    if (e.key === 'Enter' && !multiline) commit();
    if (e.key === 'Escape') { setDraft(value || ''); setEditing(false); }
  }

  const editable = !isGuest;
  const isEmpty = !value;
  const shown = value || (editable ? placeholder : '—');
  const inputStyle = {
    background: 'transparent', border: 'none', borderBottom: `1.5px solid ${T.accent}`,
    color: T.text, fontSize: 16, fontFamily: 'monospace', outline: 'none', width: '100%',
    padding: '1px 2px', resize: 'vertical',
  };

  return (
    <div
      onClick={() => { if (editable && !editing) { setDraft(value || ''); setEditing(true); } }}
      title={editable && !editing ? `Click to edit ${label.toLowerCase()}` : undefined}
      style={{
        background: T.surface, border: `1px solid ${editing ? T.accent + '80' : T.border}`,
        borderRadius: 4, padding: '7px 10px', cursor: editable && !editing ? 'text' : 'default',
        transition: 'border-color .15s',
      }}
      onMouseEnter={(e) => { if (editable && !editing) e.currentTarget.style.borderColor = T.accent + '55'; }}
      onMouseLeave={(e) => { if (editable && !editing) e.currentTarget.style.borderColor = T.border; }}
    >
      <div style={{ fontSize: 10, color: T.dim, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 3, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
        {label}
        {editable && !editing && <span style={{ fontSize: 9, color: T.accent, opacity: 0.55 }}>✏</span>}
      </div>
      {editing ? (
        multiline ? (
          <textarea ref={ref} value={draft} onChange={(e) => setDraft(e.target.value)} onBlur={commit} onKeyDown={onKeyDown} rows={2} style={inputStyle} />
        ) : (
          <input ref={ref} value={draft} onChange={(e) => setDraft(e.target.value)} onBlur={commit} onKeyDown={onKeyDown} style={inputStyle} />
        )
      ) : (
        <div style={{
          fontSize: 13, color: isEmpty ? T.dim + '70' : T.text, fontWeight: 500, overflow: 'hidden',
          // Wrap long titles/values instead of ellipsizing (and never widen the page).
          whiteSpace: 'pre-wrap', overflowWrap: 'anywhere',
          fontStyle: isEmpty ? 'italic' : 'normal', minHeight: 18,
        }}>
          {shown}
        </div>
      )}
    </div>
  );
}

// RenameField (me): a plain text label that swaps to an inline <input> on
// click, used where the value itself (not a labeled field) is the title.
export function RenameField({ value, onSave, disabled }) {
  const { theme: T } = useTheme();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [saving, setSaving] = useState(false);
  const ref = useRef();
  const prev = useRef(value);
  if (prev.current !== value) { prev.current = value; setDraft(value); }

  useEffect(() => { if (editing && ref.current) ref.current.focus(); }, [editing]);

  async function commit() {
    const n = draft.trim();
    if (!n || n === value) { setEditing(false); return; }
    setSaving(true);
    try { await onSave(n); } catch (e) { console.error(e); }
    setSaving(false); setEditing(false);
  }
  function onKeyDown(e) {
    if (e.key === 'Enter') commit();
    if (e.key === 'Escape') setEditing(false);
  }

  if (editing) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
        <input
          ref={ref} value={draft} onChange={(e) => setDraft(e.target.value)} onBlur={commit} onKeyDown={onKeyDown}
          style={{
            fontSize: 18, fontWeight: 700, background: 'transparent', border: 'none',
            borderBottom: `2px solid ${T.accent}`, color: T.text, outline: 'none',
            fontFamily: 'monospace', padding: '0 2px', minWidth: 0, width: 400, maxWidth: '100%',
          }}
        />
        {saving && <span style={{ fontSize: 12, color: T.dim }}>Saving…</span>}
      </div>
    );
  }
  return (
    <div
      onClick={() => { if (!disabled) { setDraft(value); setEditing(true); } }}
      title={disabled ? '' : 'Click to rename'}
      style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: disabled ? 'default' : 'text', marginBottom: 4 }}
    >
      <div style={{ fontSize: 18, fontWeight: 700, color: T.text, minWidth: 0, overflowWrap: 'anywhere' }}>{value}</div>
      {!disabled && (
        <span
          style={{ fontSize: 12, color: `${T.accent}70`, opacity: 0, transition: 'opacity .15s' }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = 1)}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = 0)}
        >
          ✏
        </span>
      )}
    </div>
  );
}

// MetaEditor (ge): the report detail page's "Source Details" block --
// title + notes (each via EditableField) plus the structured category tags.
export default function MetaEditor({ report, isGuest, onSave }) {
  const { theme: T } = useTheme();
  const isMobile = useIsMobile(768);
  const isLoggedIn = typeof window !== 'undefined' && !!(localStorage.getItem('spd_token') || '');

  const save = (field) => async (v) => onSave({ label: report.label || '', notes: report.notes || '', [field]: v });

  return (
    <div style={{ padding: '14px 22px', borderBottom: `1px solid ${T.border}`, background: T.surface2 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 1.5, color: T.dim, fontWeight: 700 }}>Source Details</div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {report.userName && <span style={{ fontSize: 11, color: T.dim, fontWeight: 700 }}>{report.userName}</span>}
          {!isLoggedIn && (
            <span
              onClick={() => {
                try { window.history.pushState({}, '', window.location.pathname); } catch {}
                window.dispatchEvent(new PopStateEvent('popstate'));
              }}
              style={{ fontSize: 11, color: T.accent, fontStyle: 'italic', cursor: 'pointer', textDecoration: 'underline' }}
            >
              Sign in to save details
            </span>
          )}
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: isMobile ? 6 : 8 }}>
        <EditableField label="Title" value={report.label} placeholder="click to name…" isGuest={isGuest} onSave={save('label')} />
        <div style={{ gridColumn: '1/-1' }}>
          <EditableField label="Notes" value={report.notes} placeholder="click to add notes…" isGuest={isGuest} multiline onSave={save('notes')} />
        </div>
        <CategoryEditor report={report} isGuest={isGuest} />
      </div>
    </div>
  );
}
