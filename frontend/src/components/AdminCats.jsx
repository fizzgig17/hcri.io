// frontend/src/components/AdminCats.jsx
//
// Reconstructed from the deployed assets/app.js (minified function
// AdminCats({theme:o})). Admin-only UI for managing the categorization
// values (light brand/model, LED CCT/brand/model, optic) used throughout
// the app's category filters and per-report tagging. Supports add/rename/
// delete (with optional reassignment of a deleted value's reports to
// another value of the same kind), CSV export/import, case normalization,
// and a duplicate-value finder.
//
// Backend: api/admin.php + api/categories.php --
//   GET  /api/admin/categories                 -- all values w/ usage counts
//   POST /api/categories                        -- add a value { kind, value }
//   POST /api/admin/categories/rename           -- { id, value }
//   POST /api/admin/categories/delete           -- { id, reassignTo? }
//   GET  /api/admin/categories/export           -- CSV download
//   POST /api/admin/categories/import           -- { csv, dryRun }
//   GET  /api/admin/categories/dupes            -- { groups }
//   GET  /api/admin/categories/case_prefs       -- { prefs }
//   POST /api/admin/categories/normalize        -- { kind, case, dryRun, remember }

import { useState, useEffect, useRef } from 'react';
import { basePath, getToken } from '../lib/api';

// Mirrors useIsMobile's 768px breakpoint, but used outside render (to decide
// whether to auto-focus the "add" input after a mutation) so it's a plain
// function rather than a hook.
function isDesktop() {
  try {
    if (typeof window === 'undefined') return false;
    return window.matchMedia ? window.matchMedia('(min-width: 769px)').matches : window.innerWidth > 768;
  } catch {
    return false;
  }
}

const KINDS = [
  ['light_brand', 'Light Brand'],
  ['light_model', 'Light Model'],
  ['led_cct', 'LED CCT'],
  ['led_brand', 'LED Brand'],
  ['led_model', 'LED Model'],
  ['optic', 'Optic'],
];

export default function AdminCats({ theme: o }) {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [reassign, setReassign] = useState({});
  const [adding, setAdding] = useState('');
  const [active, setActive] = useState('light_brand');
  const [q, setQ] = useState('');
  const [casePrefs, setCasePrefs] = useState({});
  const [normCase, setNormCase] = useState('title');
  const [busy, setBusy] = useState(false);
  const [, setDupInfo] = useState(null);
  const [loadedSel, setLoadedSel] = useState({});
  const fileRef = useRef(null);

  const auth = () => ({ Authorization: `Bearer ${getToken()}` });
  const lab = (k) => {
    const r = KINDS.find((x) => x[0] === k);
    return r ? r[1] : k;
  };

  const load = () => {
    setLoading(true);
    setErr('');
    fetch(`${basePath()}index.php/api/admin/categories`, { headers: auth() })
      .then((r) => r.json())
      .then((d) => {
        if (d && d.error) {
          setErr(d.error);
          setData({});
        } else setData(d || {});
        setLoading(false);
      })
      .catch(() => {
        setErr('Failed to load categories');
        setLoading(false);
      });
  };

  useEffect(() => {
    if (open) load();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    fetch(`${basePath()}index.php/api/admin/categories/case_prefs`, { headers: auth() })
      .then((r) => r.json())
      .then((d) => {
        const p = (d && d.prefs) || {};
        setCasePrefs(p);
        setNormCase(p[active] || 'title');
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const del = async (id) => {
    const to = reassign[id] || '';
    if (
      !window.confirm(
        to
          ? 'Delete this value and move its reports to the selected value?'
          : "Delete this value? Reports using it will lose this category (everything else stays categorized)."
      )
    )
      return;
    try {
      await fetch(`${basePath()}index.php/api/admin/categories/delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...auth() },
        body: JSON.stringify({ id, reassignTo: to ? Number(to) : null }),
      });
      setReassign((s) => {
        const n = { ...s };
        delete n[id];
        return n;
      });
      load();
    } catch {
      setErr('Delete failed');
    }
  };

  // Keeps focus on the "add value" input across the add/load round-trip
  // (desktop only), so an admin can hit Enter repeatedly to add several
  // values without reaching for the mouse.
  const addInputRef = useRef(null);
  const addWantFocus = useRef(0);
  const focusAddNow = () => {
    if (!isDesktop()) return;
    try {
      const el = addInputRef.current;
      if (el) el.focus({ preventScroll: true });
    } catch {}
  };
  useEffect(() => {
    if (loading) return;
    if (Date.now() - addWantFocus.current > 4000) return;
    try {
      requestAnimationFrame(focusAddNow);
    } catch {
      focusAddNow();
    }
  }, [loading, data]);
  const refocusAdd = (p) => {
    addWantFocus.current = Date.now();
    Promise.resolve(p)
      .catch(() => {})
      .then(() => {
        addWantFocus.current = Date.now();
        try {
          requestAnimationFrame(focusAddNow);
        } catch {
          focusAddNow();
        }
      });
    return p;
  };

  const add = async () => {
    const v = (adding || '').trim();
    if (!v) return;
    try {
      await fetch(`${basePath()}index.php/api/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...auth() },
        body: JSON.stringify({ kind: active, value: v }),
      });
      setAdding('');
      load();
    } catch {
      setErr('Add failed');
    }
  };

  const doExport = async () => {
    try {
      const res = await fetch(`${basePath()}index.php/api/admin/categories/export`, { headers: auth() });
      if (!res.ok) {
        window.alert('Export failed');
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `hcri-categories-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      window.alert('Export failed');
    }
  };

  const doImportFile = async (file) => {
    if (!file) return;
    setBusy(true);
    try {
      const text = await file.text();
      const dry = await fetch(`${basePath()}index.php/api/admin/categories/import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...auth() },
        body: JSON.stringify({ csv: text, dryRun: true }),
      }).then((r) => r.json());
      if (dry.error) {
        window.alert(dry.error);
        setBusy(false);
        return;
      }
      let msg =
        `This will create ${dry.created}, rename ${dry.renamed}, leave ${dry.unchanged} unchanged, and skip ${dry.skipped} row(s)` +
        (dry.errors ? ` (${dry.errors} error(s) — see below)` : '') +
        '.';
      if (dry.log && dry.log.length) {
        msg += '\n\n' + dry.log.slice(0, 10).join('\n');
      }
      msg += '\n\nImport now?';
      if (!window.confirm(msg)) {
        setBusy(false);
        return;
      }
      const live = await fetch(`${basePath()}index.php/api/admin/categories/import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...auth() },
        body: JSON.stringify({ csv: text, dryRun: false }),
      }).then((r) => r.json());
      if (live.error) window.alert(live.error);
      else
        window.alert(
          `Imported: ${live.created} created, ${live.renamed} renamed, ${live.unchanged} unchanged, ${live.skipped} skipped, ${live.errors} errors.`
        );
      load();
    } catch {
      window.alert('Import failed');
    } finally {
      setBusy(false);
    }
  };

  const doNormalize = async () => {
    setBusy(true);
    try {
      const dry = await fetch(`${basePath()}index.php/api/admin/categories/normalize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...auth() },
        body: JSON.stringify({ kind: active, case: normCase, dryRun: true }),
      }).then((r) => r.json());
      if (dry.error) {
        window.alert(dry.error);
        setBusy(false);
        return;
      }
      if (!dry.changed) {
        window.alert(`${lab(active)} already matches that case.`);
        setBusy(false);
        return;
      }
      const preview = dry.changes.slice(0, 10).map((c) => `${c.from} -> ${c.to}`).join('\n');
      const ok = window.confirm(
        `This will update ${dry.changed} of ${dry.changed + dry.unchanged} ${lab(active)} value(s):\n\n${preview}` +
          (dry.changed > 10 ? '\n…' : '') +
          '\n\nApply now?'
      );
      if (!ok) {
        setBusy(false);
        return;
      }
      const live = await fetch(`${basePath()}index.php/api/admin/categories/normalize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...auth() },
        body: JSON.stringify({ kind: active, case: normCase, dryRun: false, remember: true }),
      }).then((r) => r.json());
      if (live.error) window.alert(live.error);
      setCasePrefs((p) => ({ ...p, [active]: normCase }));
      load();
    } catch {
      window.alert('Normalize failed');
    } finally {
      setBusy(false);
    }
  };

  const checkDupes = async () => {
    setBusy(true);
    try {
      const d = await fetch(`${basePath()}index.php/api/admin/categories/dupes`, { headers: auth() }).then((r) => r.json());
      const groups = (d && d.groups) || [];
      setDupInfo(groups);
      if (!groups.length) {
        window.alert('No duplicate values found.');
        setBusy(false);
        return;
      }
      const lines = groups.map((gr) => `${lab(gr.kind)}: ${gr.items.map((it) => `"${it.value}"`).join(', ')}`);
      window.alert(`Possible duplicates:\n\n${lines.join('\n')}\n\nRename or delete one of each pair below to resolve.`);
    } catch {
      window.alert('Duplicate check failed');
    } finally {
      setBusy(false);
    }
  };

  const selStyle = {
    background: o.surface2 || o.surface,
    border: `1px solid ${o.border}`,
    color: o.text,
    borderRadius: 6,
    padding: '4px 6px',
    fontSize: 12,
    fontFamily: 'monospace',
    maxWidth: 170,
  };
  const dbtn = {
    background: `${o.bad}15`,
    border: `1px solid ${o.bad}55`,
    color: o.bad,
    borderRadius: 6,
    padding: '4px 10px',
    fontSize: 12,
    cursor: 'pointer',
    fontFamily: 'monospace',
    fontWeight: 700,
    flexShrink: 0,
  };

  const cur = (data && data[active]) || [];
  const filtered = q ? cur.filter((x) => (x.value || '').toLowerCase().includes(q.toLowerCase())) : cur;

  const Row = ({ it }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: `1px solid ${o.border}55` }}>
      <span
        style={{
          flex: 1,
          color: o.text,
          fontSize: 13,
          minWidth: 0,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {it.value}
        <span style={{ color: o.dim, fontSize: 11, marginLeft: 8 }}>({it.uses})</span>
      </span>
      <select
        value={reassign[it.id] || ''}
        title="Reassign reports to this value before deleting"
        onChange={(ev) => setReassign((s) => ({ ...s, [it.id]: ev.target.value }))}
        onFocus={() => {
          if (!loadedSel[it.id]) setLoadedSel((s) => ({ ...s, [it.id]: true }));
        }}
        style={selStyle}
      >
        <option value="">— don't reassign —</option>
        {loadedSel[it.id] &&
          cur
            .filter((x) => x.id !== it.id)
            .map((x) => (
              <option key={x.id} value={`${x.id}`}>
                {x.value}
              </option>
            ))}
      </select>
      <button
        onClick={async () => {
          const nv = window.prompt('Rename to:', it.value);
          if (!nv) return;
          const trimmed = nv.trim();
          if (!trimmed || trimmed === it.value) return;
          try {
            const res = await fetch(`${basePath()}index.php/api/admin/categories/rename`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', ...auth() },
              body: JSON.stringify({ id: it.id, value: trimmed }),
            });
            if (!res.ok) {
              const e = await res.json().catch(() => ({}));
              window.alert(e.error || 'Rename failed');
              return;
            }
            load();
          } catch {
            window.alert('Rename failed');
          }
        }}
        style={{
          background: 'none',
          border: `1px solid ${o.border}`,
          color: o.dim,
          borderRadius: 6,
          padding: '4px 8px',
          fontSize: 11,
          cursor: 'pointer',
          fontFamily: 'monospace',
          marginRight: 6,
        }}
      >
        Rename
      </button>
      <button onClick={() => del(it.id)} style={dbtn}>
        Delete
      </button>
    </div>
  );

  const TabBtn = ({ k, la }) => {
    const n = ((data && data[k]) || []).length;
    const on = active === k;
    return (
      <button
        onClick={() => {
          setActive(k);
          setQ('');
          setNormCase(casePrefs[k] || 'title');
        }}
        style={{
          background: on ? o.accent : 'transparent',
          color: on ? '#0a0f14' : o.dim,
          border: `1px solid ${on ? o.accent : o.border}`,
          borderRadius: 6,
          padding: '5px 9px',
          fontSize: 11,
          fontWeight: 700,
          cursor: 'pointer',
          fontFamily: 'monospace',
          whiteSpace: 'nowrap',
        }}
      >
        {la} ({n})
      </button>
    );
  };

  const bodyInner = loading ? (
    <div style={{ padding: 24, color: o.dim, fontSize: 13, textAlign: 'center' }}>Loading…</div>
  ) : (
    <div>
      {err && <div style={{ color: o.bad, fontSize: 12, marginBottom: 10 }}>{err}</div>}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 6,
            alignItems: 'center',
            marginBottom: 10,
            paddingBottom: 10,
            borderBottom: `1px solid ${o.border}`,
          }}
        >
          <button
            disabled={busy}
            onClick={doExport}
            title="Download all categories as CSV"
            style={{
              background: 'none',
              border: `1px solid ${o.border}`,
              color: o.text,
              borderRadius: 6,
              padding: '5px 9px',
              fontSize: 11,
              cursor: busy ? 'default' : 'pointer',
              fontFamily: 'monospace',
              opacity: busy ? 0.6 : 1,
            }}
          >
            ⬇ Export CSV
          </button>
          <button
            disabled={busy}
            onClick={() => fileRef.current && fileRef.current.click()}
            title="Import categories from a CSV (id,kind,value columns)"
            style={{
              background: 'none',
              border: `1px solid ${o.border}`,
              color: o.text,
              borderRadius: 6,
              padding: '5px 9px',
              fontSize: 11,
              cursor: busy ? 'default' : 'pointer',
              fontFamily: 'monospace',
              opacity: busy ? 0.6 : 1,
            }}
          >
            ⬆ Import CSV
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".csv,text/csv"
            style={{ display: 'none' }}
            onChange={(ev) => {
              const file = ev.target.files && ev.target.files[0];
              ev.target.value = '';
              if (file) doImportFile(file);
            }}
          />
          <button
            disabled={busy}
            onClick={checkDupes}
            title="Scan every kind for values that only differ by case"
            style={{
              background: 'none',
              border: `1px solid ${o.border}`,
              color: o.dim,
              borderRadius: 6,
              padding: '5px 9px',
              fontSize: 11,
              cursor: busy ? 'default' : 'pointer',
              fontFamily: 'monospace',
              opacity: busy ? 0.6 : 1,
            }}
          >
            ⚠ Find Duplicates
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 'auto' }}>
            <select
              value={normCase}
              onChange={(ev) => setNormCase(ev.target.value)}
              title={`Case to apply to ${lab(active)}`}
              style={{
                background: o.surface2 || o.surface,
                border: `1px solid ${o.border}`,
                color: o.text,
                borderRadius: 6,
                padding: '4px 6px',
                fontSize: 11,
                fontFamily: 'monospace',
              }}
            >
              <option value="upper">UPPER CASE</option>
              <option value="lower">lower case</option>
              <option value="sentence">Sentence case</option>
              <option value="title">Title Case</option>
            </select>
            <button
              disabled={busy}
              onClick={doNormalize}
              title={`Normalize the case of every ${lab(active)} value`}
              style={{
                background: `${o.accent}20`,
                border: `1px solid ${o.accent}`,
                color: o.accent,
                borderRadius: 6,
                padding: '5px 10px',
                fontSize: 11,
                cursor: busy ? 'default' : 'pointer',
                fontFamily: 'monospace',
                fontWeight: 700,
              }}
            >
              Normalize {lab(active)}
            </button>
            <span style={{ fontSize: 10, color: o.dim, fontFamily: 'monospace' }}>
              {normCase === (casePrefs[active] || 'title') ? 'saved default' : ''}
            </span>
          </div>
        </div>
        {KINDS.map(([k, la]) => <TabBtn key={k} k={k} la={la} />)}
      </div>
      <input
        value={q}
        placeholder={`Filter ${lab(active)}…`}
        onChange={(ev) => setQ(ev.target.value)}
        style={{
          width: '100%',
          boxSizing: 'border-box',
          background: o.surface2 || o.surface,
          border: `1px solid ${o.border}`,
          borderRadius: 6,
          padding: '7px 9px',
          color: o.text,
          fontSize: 13,
          fontFamily: 'monospace',
          outline: 'none',
          marginBottom: 8,
        }}
      />
      <div style={{ maxHeight: '46vh', overflowY: 'auto', paddingRight: 4 }}>
        {filtered.length ? (
          filtered.map((it) => <Row key={it.id} it={it} />)
        ) : (
          <div style={{ fontSize: 12, color: o.dim, fontStyle: 'italic', padding: '8px 0' }}>
            {cur.length ? 'No matches' : 'No values yet'}
          </div>
        )}
      </div>
      <div style={{ display: 'flex', gap: 6, marginTop: 10, borderTop: `1px solid ${o.border}`, paddingTop: 10 }}>
        <input
          ref={addInputRef}
          value={adding}
          placeholder={`Add to ${lab(active)}…`}
          onChange={(ev) => setAdding(ev.target.value)}
          onKeyDown={(ev) => {
            if (ev.key === 'Enter') {
              ev.preventDefault();
              refocusAdd(add());
            }
          }}
          style={{
            flex: 1,
            boxSizing: 'border-box',
            background: o.surface2 || o.surface,
            border: `1px solid ${o.border}`,
            borderRadius: 6,
            padding: '6px 9px',
            color: o.text,
            fontSize: 13,
            fontFamily: 'monospace',
            outline: 'none',
          }}
        />
        <button
          onClick={() => refocusAdd(add())}
          style={{
            background: `${o.accent}20`,
            border: `1px solid ${o.accent}`,
            color: o.accent,
            borderRadius: 6,
            padding: '6px 14px',
            fontSize: 12,
            cursor: 'pointer',
            fontFamily: 'monospace',
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          + Add
        </button>
      </div>
    </div>
  );

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        title="Manage categorization values"
        style={{
          background: o.surface2 || o.surface,
          border: `1px solid ${o.border}`,
          color: o.text,
          borderRadius: 6,
          padding: '5px 10px',
          fontSize: 12,
          cursor: 'pointer',
          fontFamily: 'monospace',
          marginRight: 10,
        }}
      >
        🏷 Categories
      </button>
      {open && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            zIndex: 4000,
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            padding: 16,
            overflowY: 'auto',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div
            style={{
              background: o.surface,
              border: `1px solid ${o.border}`,
              borderRadius: 12,
              width: '100%',
              maxWidth: 720,
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              marginTop: '2vh',
            }}
          >
            <div
              style={{
                padding: '14px 18px',
                borderBottom: `1px solid ${o.border}`,
                background: o.surface2 || o.surface,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexShrink: 0,
              }}
            >
              <div style={{ fontWeight: 900, fontSize: 15, color: o.text, fontFamily: 'monospace' }}>Manage Categories</div>
              <button
                onClick={() => setOpen(false)}
                style={{ background: 'none', border: 'none', color: o.dim, fontSize: 20, cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>
            <div style={{ padding: 18, overflowY: 'auto' }}>{bodyInner}</div>
          </div>
        </div>
      )}
    </>
  );
}
