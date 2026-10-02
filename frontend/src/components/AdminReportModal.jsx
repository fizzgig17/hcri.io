// frontend/src/components/AdminReportModal.jsx
//
// Reconstructed from the deployed assets/app.js (minified function
// Me({report,T,onClose})). Full-screen modal an admin opens from a user's
// report list (in the admin users panel) to inspect and edit any report:
// header with the report's title and owner, an AdminReportEdit panel for
// editing, and the full ReportView below it (rendered with isGuest so it
// never tries to save metadata itself -- AdminReportEdit owns saving).
//
// On mobile it forces the document to natural height/scroll (the app's
// normal layout pins html/body/#root to 100% height for the fixed app
// shell, which this modal needs to override so its content can scroll).

import { useState, useEffect } from 'react';
import ReportView from './ReportView';
import AdminReportEdit from './AdminReportEdit';

export default function AdminReportModal({ report, T: t, onClose }) {
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
  const [rep, setRep] = useState(report);

  useEffect(() => {
    if (!isMobile) return;
    const root = document.getElementById('root');
    document.documentElement.style.setProperty('height', 'auto', 'important');
    document.documentElement.style.setProperty('overflow', 'visible', 'important');
    document.body.style.setProperty('height', 'auto', 'important');
    document.body.style.setProperty('overflow', 'visible', 'important');
    if (root) {
      root.style.setProperty('height', 'auto', 'important');
      root.style.setProperty('overflow', 'visible', 'important');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.92)',
        zIndex: 4500,
        overflowY: isMobile ? 'scroll' : 'hidden',
        WebkitOverflowScrolling: 'touch',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          background: t.surface2,
          borderBottom: `1px solid ${t.border}`,
          padding: '10px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
          position: isMobile ? 'sticky' : 'static',
          top: 0,
          zIndex: 10,
        }}
      >
        <div style={{ fontFamily: 'monospace' }}>
          <span style={{ fontWeight: 700, color: t.white, fontSize: 15 }}>{report.label}</span>
          <span style={{ fontSize: 12, color: t.dim, marginLeft: 12 }}>
            {report.userName} · {report.userEmail}
          </span>
        </div>
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', color: t.dim, fontSize: 20, cursor: 'pointer', fontFamily: 'monospace' }}
        >
          ✕ Close
        </button>
      </div>
      <div style={{ flex: isMobile ? 'none' : 1, overflow: isMobile ? 'visible' : 'auto', minHeight: 0, background: t.bg }}>
        <AdminReportEdit report={rep} T={t} onSaved={(u) => setRep(u)} />
        <ReportView report={rep} allReports={[rep]} isGuest />
      </div>
    </div>
  );
}
