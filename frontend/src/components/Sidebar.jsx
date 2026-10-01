// frontend/src/components/Sidebar.jsx
//
// Reconstructed from assets/app.js (minified function Pe, with its rfColor
// helper Ne). The stale version this replaces was missing a lot of what's
// actually deployed: the recalculate-from-SPD button per report, the
// "Paste nm / value data" entry point, the Explore button, the admin gear
// (shown only for admins), Help/Feedback buttons and their modals, the
// pin/unpin control for keeping the sidebar open on narrower layouts, an
// onHome click on the logo, and a `style` prop so a caller can override
// sizing (e.g. width:'100%' for a mobile full-screen layout) instead of the
// hardcoded 290px desktop width this used to have.
//
// NOTE: HelpModal, AccountSettings, FeedbackModal and AdminPanel are the
// real components behind minified O / k / E / Ae respectively. Now that
// those batches have landed under their real filenames: HelpModal.jsx
// (default export), AccountSettings.jsx (default export, not a file named
// "AccountModal.jsx"), FeedbackModal (a named export from AuthScreen.jsx,
// not its own file), and AdminPanel.jsx (default export) -- fixed below.
import { useRef, useState } from 'react';
import { useTheme } from '../lib/ThemeContext.jsx';
import { fmtTZ } from '../lib/tz';
import HelpModal from './HelpModal';
import AccountSettings from './AccountSettings';
import { FeedbackModal } from './AuthScreen';
import AdminPanel from './AdminPanel';

function rfColor(rf, T) {
  if (rf == null) return T.dim;
  const t = rf / 100;
  return t < 0.7 ? T.bad : t < 0.85 ? T.warn : T.good;
}

export default function Sidebar({
  user,
  reports,
  activeId,
  uploading,
  uploadProgress,
  uploadLabel,
  onUpload,
  onSelect,
  onDelete,
  onRecalc,
  onPaste,
  onExplore,
  onLogout,
  onUserUpdate,
  minRf,
  onMinRfChange,
  pinned,
  onTogglePin,
  onHome,
  style = {},
}) {
  const filtered = minRf > 0 ? reports.filter(r => r.Rf != null && r.Rf >= minRf) : reports;

  const [adminOpen, setAdminOpen] = useState(false);
  const [recalcingId, setRecalcingId] = useState(null);
  const { theme: T, themeName, toggleTheme } = useTheme();
  const fileRef = useRef();
  const [dragOver, setDragOver] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  const S = {
    sidebar: {
      width: style.width || 320,
      flexShrink: style.width ? 1 : 0,
      background: T.surface2,
      borderRight: style.borderRight === undefined ? `1px solid ${T.border}` : style.borderRight,
      display: 'flex',
      flexDirection: 'column',
      overflow: style.width === '100%' ? 'visible' : 'hidden',
      height: '100%',
      boxSizing: 'border-box',
      position: 'relative',
    },
    head: { padding: '18px 16px 14px', borderBottom: `1px solid ${T.border}`, background: T.surface3 },
    logoutBtn: { fontSize: 13, color: T.dim, background: 'none', border: `1px solid ${T.border}`, borderRadius: 6, padding: '6px 12px', cursor: 'pointer', fontWeight: 600 },
    body: { flex: style.width === '100%' ? 'none' : 1, overflow: style.width === '100%' ? 'visible' : 'hidden', display: 'flex', flexDirection: 'column' },
    dropZone: { margin: 12, border: `2px dashed ${T.accent}40`, borderRadius: 8, padding: '16px 14px', textAlign: 'center', cursor: 'pointer', transition: 'all .2s', background: `${T.accent}05` },
    dropOver: { borderColor: T.accent, background: `${T.accent}12` },
    secHead: { padding: '10px 16px 6px', fontSize: 12, textTransform: 'uppercase', letterSpacing: '1.5px', color: T.dim, borderBottom: `1px solid ${T.border}`, fontWeight: 700 },
    item: { display: 'flex', alignItems: 'flex-start', gap: 8, padding: '10px 14px', cursor: 'pointer', borderLeft: '3px solid transparent', transition: 'background .1s' },
    activeItem: { background: `${T.accent}12`, borderLeftColor: T.accent },
    delBtn: { fontSize: 16, color: T.dim, border: 'none', background: 'none', cursor: 'pointer', padding: '2px 5px', flexShrink: 0 },
    empty: { padding: '24px 16px', textAlign: 'center', fontSize: 14, color: T.dim, lineHeight: 2.2 },
    controls: { padding: '12px 14px', borderTop: `1px solid ${T.border}`, marginTop: 'auto' },
  };

  return (
    <>
      <div style={{ ...S.sidebar, ...style }}>
        {onTogglePin && (
          <button
            onClick={onTogglePin}
            title={pinned ? 'Sidebar pinned - click to unpin' : 'Pin sidebar open'}
            style={{
              position: 'absolute', top: 10, right: 10, zIndex: 5, background: 'none', border: 'none',
              padding: 2, lineHeight: 1, cursor: 'pointer', fontSize: 14,
              color: pinned ? T.accent : T.dim, opacity: pinned ? 1 : 0.45,
              transform: pinned ? 'none' : 'rotate(40deg)', transition: 'all .15s',
            }}
          >
            📌
          </button>
        )}

        <div style={S.head}>
          <div onClick={onHome} style={{ fontWeight: 900, fontSize: 20, color: T.white, letterSpacing: 1, marginBottom: 6, cursor: 'pointer' }}>
            hCRI<span style={{ color: T.accent }}>.io</span>
          </div>
          <button
            onClick={() => setAccountOpen(true)}
            style={{ fontSize: 12, color: T.accent, marginBottom: 6, fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'monospace', textAlign: 'left' }}
          >
            👤 {user?.name}
          </button>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            <button onClick={toggleTheme} title={themeName === 'dark' ? 'Light mode' : 'Dark mode'} style={{ ...S.logoutBtn, fontSize: 15, padding: '4px 8px' }}>
              {themeName === 'dark' ? '☀' : '🌙'}
            </button>
            {user?.isAdmin && (
              <button onClick={() => setAdminOpen(true)} title="Admin" style={{ ...S.logoutBtn, padding: '4px 8px', color: '#ffaa00', borderColor: '#ffaa0060' }}>
                ⚙
              </button>
            )}
            <button
              onClick={() => onExplore && onExplore()}
              title="Explore public reports"
              style={{ ...S.logoutBtn, padding: '4px 8px', color: '#00d4ff', borderColor: '#00d4ff40', background: '#00d4ff12' }}
            >
              🔭 Explore
            </button>
            <button onClick={() => setHelpOpen(true)} title="Help" style={{ ...S.logoutBtn, padding: '4px 8px' }}>
              ?
            </button>
            <button onClick={() => setFeedbackOpen(true)} title="Send feedback" style={{ ...S.logoutBtn, padding: '4px 8px' }}>
              ✉
            </button>
            <button style={{ ...S.logoutBtn, padding: '4px 8px' }} onClick={onLogout}>
              Sign Out
            </button>
          </div>
        </div>

        <div style={S.body}>
          <div
            style={{ ...S.dropZone, ...(dragOver ? S.dropOver : {}) }}
            onClick={() => fileRef.current.click()}
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={e => {
              e.preventDefault();
              setDragOver(false);
              if (e.dataTransfer.files[0]) onUpload(e.dataTransfer.files[0]);
            }}
          >
            <div style={{ fontSize: 28, marginBottom: 6 }}>📂</div>
            <div style={{ fontSize: 14, color: T.text, lineHeight: 1.6, fontWeight: 500 }}>
              <strong style={{ color: T.accent, display: 'block', marginBottom: 2 }}>Upload CSV, JSON or SP</strong>
              wavelength · power · TM-30
            </div>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept=".csv,.txt,.tsv,.json,.sp"
            style={{ display: 'none' }}
            onChange={e => {
              if (e.target.files[0]) { onUpload(e.target.files[0]); e.target.value = ''; }
            }}
          />
          <button
            onClick={() => onPaste && onPaste()}
            style={{
              margin: '6px 12px 0', width: 'calc(100% - 24px)', background: `${T.accent}12`,
              border: `1px solid ${T.accent}40`, color: T.accent, borderRadius: 6, padding: '7px 12px',
              fontSize: 12, cursor: 'pointer', fontFamily: 'monospace', fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}
          >
            <span>⌨</span> Paste nm / value data
          </button>

          {uploading && (
            <div style={{ padding: '0 12px 10px' }}>
              <div style={{ height: 4, background: `${T.accent}20`, borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: uploadProgress + '%', background: T.accent, transition: 'width .4s', borderRadius: 2 }} />
              </div>
              <div style={{ fontSize: 13, color: T.dim, marginTop: 4 }}>{uploadLabel}</div>
            </div>
          )}

          <div style={S.secHead}>Saved Reports</div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {filtered.length ? (
              filtered.map(r => (
                <div
                  key={r.id}
                  style={{ ...S.item, ...(r.id === activeId ? S.activeItem : {}) }}
                  onClick={() => onSelect(r.id)}
                >
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: rfColor(r.Rf, T), flexShrink: 0, marginTop: 3 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, color: T.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 600, marginBottom: 2 }}>
                      {r.label}
                    </div>
                    <div style={{ fontSize: 12, color: T.dim }}>
                      {r.cct ? r.cct + 'K · ' : ''}
                      {fmtTZ(r.createdAt.replace(' ', 'T'), { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}
                    </div>
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: rfColor(r.Rf, T), flexShrink: 0, marginRight: 6 }}>
                    {r.Rf ?? '—'}
                  </div>
                  <button
                    style={{ ...S.delBtn, fontSize: 13 }}
                    title="Recalculate metrics from SPD"
                    onMouseEnter={e => Object.assign(e.currentTarget.style, { color: T.accent })}
                    onMouseLeave={e => Object.assign(e.currentTarget.style, { color: T.dim })}
                    onClick={async e => {
                      e.stopPropagation();
                      if (onRecalc) { setRecalcingId(r.id); await onRecalc(r.id); setRecalcingId(null); }
                    }}
                    disabled={recalcingId === r.id}
                  >
                    {recalcingId === r.id ? '⟳' : '↺'}
                  </button>
                  <button
                    style={S.delBtn}
                    title="Delete report"
                    onMouseEnter={e => Object.assign(e.currentTarget.style, { color: '#ff4466' })}
                    onMouseLeave={e => Object.assign(e.currentTarget.style, { color: T.dim })}
                    onClick={e => { e.stopPropagation(); onDelete(r.id); }}
                  >
                    🗑
                  </button>
                </div>
              ))
            ) : (
              <div style={S.empty}>
                No reports yet.
                <br />
                Upload a CSV, JSON or SP file to begin.
              </div>
            )}
          </div>

          <div style={S.controls}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span style={{ fontSize: 13, color: T.text, flex: 1, fontWeight: 500 }}>Min Rf filter</span>
              <span style={{ fontSize: 14, color: T.accent, fontWeight: 700, minWidth: 28, textAlign: 'right' }}>{minRf}</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={minRf}
              onChange={e => onMinRfChange(+e.target.value)}
              style={{ width: '100%', accentColor: T.accent }}
            />
          </div>
        </div>
      </div>

      {helpOpen && <HelpModal onClose={() => setHelpOpen(false)} />}
      {accountOpen && (
        <AccountSettings user={user} onClose={() => setAccountOpen(false)} onUserUpdate={u => onUserUpdate && onUserUpdate(u)} />
      )}
      {feedbackOpen && <FeedbackModal user={user} onClose={() => setFeedbackOpen(false)} />}
      {adminOpen && <AdminPanel onClose={() => setAdminOpen(false)} me={user} />}
    </>
  );
}
