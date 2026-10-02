// frontend/src/App.jsx
//
// Reconstructed from the deployed assets/app.js (minified function Ge, the
// root component mounted directly by main.jsx). This replaces a much
// simpler stale App.jsx that only ever rendered AuthScreen / Sidebar+
// ReportView directly -- the real deployed app is a small router/state
// machine with several more entry points than that:
//
//   - A shared/public report view (`?report=<id>` or `?share=<token>`),
//     reachable whether or not anyone is logged in, with its own minimal
//     header (theme toggle + "Explore"/"My Reports"/"Analyze Your Own").
//   - A password-reset screen (`?reset=<token>`) for a logged-out visitor.
//   - A guest-accessible Explore page (`?explore`, `?compare=...`, or a
//     `/explore` path) that works with no account at all, with sign-in
//     offered as an AuthScreen overlay (`overlayMode`) rather than a
//     redirect.
//   - The logged-in dashboard: Sidebar + ReportDetail side by side on
//     desktop, or a single full-screen pane that toggles between them on
//     mobile (useIsMobile(768)), plus Explore as a full-page overlay that
//     a logged-in user can open from the dashboard.
//   - The logged-out marketing/landing page (AuthScreen, full screen).
//
// Browser history is wired by hand with pushState/replaceState + a
// popstate listener (not a router library) so the back button steps back
// through report -> explore -> home the way the bundle does it. The
// sidebar's pinned/unpinned state persists to localStorage
// ("sidebar_pinned"), and an unpinned sidebar auto-closes on narrow
// desktop widths and whenever a report is opened on mobile.
//
// On top of that, every panel/modal with no URL of its own (AdminPanel,
// AccountSettings, HelpModal, FeedbackModal, PasteSPDModal, Explore's
// Compare view and open-report detail pane, etc.) pushes its own history
// entry while open via usePanelBackClose() (hooks/usePanelBackClose.js,
// lib/panelHistory.js), so the back button closes the topmost open panel
// instead of leaving the page behind it -- see tests/back-button.spec.js.
// The onPop handler below checks that stack first, via
// handlePanelPopState(), before falling through to its own routing.

import { useEffect, useState } from 'react';
import { useTheme } from './lib/ThemeContext.jsx';
import { useAuth } from './hooks/useAuth';
import { useIsMobile } from './hooks/useIsMobile';
import { api } from './lib/api';
import { setTZ } from './lib/tz';
import { TopNotices } from './components/Notices';
import HelpModal, { GlobalHelp } from './components/HelpModal';
import AuthScreen, { FeedbackModal } from './components/AuthScreen';
import Sidebar from './components/Sidebar';
import ReportDetail from './components/ReportDetail';
import PasteSPDModal from './components/PasteSPDModal';
import Explore from './components/Explore';
import PasswordReset from './components/PasswordReset';
import { handlePanelPopState } from './lib/panelHistory';
import usePanelBackClose from './hooks/usePanelBackClose';

export default function App() {
  const { theme: T, themeName, toggleTheme } = useTheme();
  const { user, setUser, checking, tryAutoLogin, login, register, logout } = useAuth();

  function patchUser(u) {
    setUser && setUser(u);
  }

  // Keep the shared tz helper (used by fmtTZ() across report views) in
  // sync with whatever timezone the logged-in user has set.
  useEffect(() => {
    setTZ(user && user.timezone);
  }, [user && user.timezone]);

  // ── Shared/public single-report view (?report= or ?share=) ─────────────
  const [sharedReport, setSharedReport] = useState(null);
  const [sharedLoading, setSharedLoading] = useState(false);
  const [sharedError, setSharedError] = useState(null);

  // ── Dashboard state ──────────────────────────────────────────────────────
  const [reports, setReports] = useState([]);
  const [detail, setDetail] = useState(null);
  const [activeId, setActiveId] = useState(null);
  const [minRf, setMinRf] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [pasteOpen, setPasteOpen] = useState(false);

  // ── Explore state ────────────────────────────────────────────────────────
  // Initial value is derived straight from the URL so a deep link into
  // Explore (or a page reload while on it) opens straight into Explore
  // instead of flashing the dashboard/landing page first. A report/share/
  // reset link always wins over an explore-looking URL.
  const [exploreOpen, setExploreOpen] = useState(() => {
    try {
      if (typeof window > 'u') return false;
      const sp = new URLSearchParams(window.location.search);
      if (sp.get('report') || sp.get('share') || sp.get('reset') || sp.has('legacy'))
        return false;
      return (
        sp.has('explore') ||
        window.location.search.includes('compare=') ||
        window.location.pathname.endsWith('/explore')
      );
    } catch (e) {
      return false;
    }
  });
  const [exploreKey, setExploreKey] = useState(0);
  const [exploreAuthOpen, setExploreAuthOpen] = useState(false);

  // ── Password reset (?reset=) ─────────────────────────────────────────────
  const [resetToken, setResetToken] = useState(
    () => new URLSearchParams(window.location.search).get('reset') || '',
  );

  // ── Sidebar / layout ─────────────────────────────────────────────────────
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [helpOpen, setHelpOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  // Back-button support for the modals/panels above that have no URL of
  // their own -- see lib/panelHistory.js. (exploreOpen/exploreAuthOpen's
  // sibling exploreOpen is a top-level view, already handled by the
  // report/explore/home pushState/popstate routing above it; only
  // exploreAuthOpen -- the sign-in overlay shown over guest Explore --
  // needs this.)
  usePanelBackClose(pasteOpen, () => setPasteOpen(false));
  usePanelBackClose(exploreAuthOpen, () => setExploreAuthOpen(false));
  usePanelBackClose(helpOpen, () => setHelpOpen(false));
  usePanelBackClose(feedbackOpen, () => setFeedbackOpen(false));

  const [sidebarPinned, setSidebarPinned] = useState(() => {
    try {
      return localStorage.getItem('sidebar_pinned') !== 'false';
    } catch {
      return true;
    }
  });
  const isMobile = useIsMobile(768);

  useEffect(() => {
    try {
      localStorage.setItem('sidebar_pinned', sidebarPinned);
    } catch {}
  }, [sidebarPinned]);

  // Locks page scroll on the <html>/#root while a logged-in desktop user
  // has the sidebar collapsed -- mirrors the deployed "app-locked" class.
  useEffect(() => {
    const el = document.getElementById('root');
    if (el) {
      if (!isMobile && user) el.classList.add('app-locked');
      else el.classList.remove('app-locked');
      return () => el.classList.remove('app-locked');
    }
  }, [isMobile, user]);

  // Unpinning the sidebar while a report is open on desktop closes it.
  useEffect(() => {
    if (!isMobile && !sidebarPinned && detail) setSidebarOpen(false);
  }, [detail]);

  // On a narrow desktop window (not mobile-layout, just a narrow one) with
  // the sidebar unpinned, auto-close it.
  useEffect(() => {
    function onResize() {
      if (window.innerWidth < 700 && !sidebarPinned) setSidebarOpen(false);
    }
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadLabel, setUploadLabel] = useState('');
  const [notif, setNotif] = useState(null);
  const [guestReport, setGuestReport] = useState(null);

  // Auto-login on mount; also force Explore open if the URL path itself
  // ends in /explore (a plain reload of that path with no query string).
  useEffect(() => {
    tryAutoLogin();
    if (window.location.pathname.endsWith('/explore')) setExploreOpen(true);
  }, []);

  // Resolve ?report= / ?share= into the shared single-report view on load.
  useEffect(() => {
    try {
      const reportId = new URLSearchParams(window.location.search).get('report');
      if (reportId) {
        setSharedLoading(true);
        fetch(`./index.php/api/explore/${encodeURIComponent(reportId)}`, {
          headers: { Authorization: 'Bearer ' + (localStorage.getItem('spd_token') || '') },
        })
          .then(r => r.json())
          .then(r => { r && r.id ? setSharedReport(r) : setSharedError('Could not load report.'); })
          .catch(() => setSharedError('Could not load report.'))
          .finally(() => setSharedLoading(false));
        return;
      }
      const shareToken = new URLSearchParams(window.location.search).get('share');
      if (!shareToken) return;
      setSharedLoading(true);
      fetch(`./index.php/api/shared/${encodeURIComponent(shareToken)}`)
        .then(r => r.json())
        .then(r => { r.error ? setSharedError(r.error) : setSharedReport(r); })
        .catch(() => setSharedError('Could not load shared report.'))
        .finally(() => setSharedLoading(false));
    } catch {}
  }, []);

  // Hand-rolled history: tag our own entries with {hcri:1, ...} and walk
  // back through report -> explore -> home on popstate.
  useEffect(() => {
    try {
      window.history.replaceState(
        Object.assign({ hcri: 1 }, window.history.state || {}),
        '',
        window.location.href,
      );
    } catch (e) {}

    const onPop = (ev) => {
      try {
        // Any open panel/modal (Admin, Account Settings, Help, Feedback,
        // Paste-data, Compare, etc.) gets first claim on a back press --
        // see lib/panelHistory.js. If one handled it, the underlying
        // report/explore/home view hasn't actually changed, so don't also
        // run the routing below.
        if (handlePanelPopState()) return;

        const st = (ev && ev.state) || window.history.state || {};
        const sp = new URLSearchParams(window.location.search);
        const rep = sp.get('report');
        const shr = sp.get('share');
        const exp = window.location.search.includes('explore') || window.location.search.includes('compare=');

        if (st && st.view === 'report' && st.rid) {
          setSharedReport(null);
          setExploreOpen(false);
          setActiveId(st.rid);
          window.trackPage && window.trackPage('/report', 'Report');
          api.get('/reports/' + st.rid).then(setDetail).catch(() => {});
          return;
        }
        if (rep) {
          setSharedLoading(true);
          setExploreOpen(false);
          setDetail(null);
          setActiveId(null);
          fetch('./index.php/api/explore/' + encodeURIComponent(rep))
            .then(r => r.json())
            .then(r => { r && r.id ? setSharedReport(r) : setSharedError('Could not load report.'); })
            .catch(() => setSharedError('Could not load report.'))
            .finally(() => setSharedLoading(false));
          return;
        }
        if (shr) {
          setSharedLoading(true);
          setExploreOpen(false);
          setDetail(null);
          setActiveId(null);
          fetch('./index.php/api/shared/' + encodeURIComponent(shr))
            .then(r => r.json())
            .then(r => { r.error ? setSharedError(r.error) : setSharedReport(r); })
            .catch(() => setSharedError('Could not load shared report.'))
            .finally(() => setSharedLoading(false));
          return;
        }
        if (exp || (st && st.view === 'explore')) {
          setSharedReport(null);
          setDetail(null);
          setActiveId(null);
          setExploreKey(k => k + 1);
          setExploreOpen(true);
          window.trackPage && window.trackPage('/explore', 'Explore');
          return;
        }
        setSharedReport(null);
        setExploreOpen(false);
        setDetail(null);
        setActiveId(null);
        api.get('/reports').then(setReports).catch(() => {});
        window.trackPage && window.trackPage('/', 'Home');
      } catch (e) {}
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  // Load/clear the logged-in user's report list, and default to Explore
  // right after login unless we're mid-way through a report/share/reset
  // deep link.
  useEffect(() => {
    if (!user) {
      setReports([]);
      setDetail(null);
      return;
    }
    setGuestReport(null);
    api.get('/reports').then(setReports).catch(e => showNotif(e.message, 'err'));
    try {
      const sp = new URLSearchParams(window.location.search);
      if (!sp.get('report') && !sp.get('share') && !sp.get('reset')) setExploreOpen(true);
    } catch (e) {}
  }, [user]);

  // Shows the small toast at the bottom of the logged-in dashboard for
  // ~3.2s. type is 'ok' (green) or 'err' (red).
  function showNotif(msg, type = 'ok') {
    setNotif({ msg, type });
    setTimeout(() => setNotif(null), 3200);
  }

  // Handler for AuthScreen's guest (logged-out) upload box. Note: this sets
  // guestReport, but nothing in this component's render output ever reads
  // that state back -- AuthScreen renders the guest result itself inline
  // (see its own `analyzed`/`guestResult` state), so this is dead state
  // kept only because the deployed bundle has it too.
  function handleGuestUpload(result) {
    setGuestReport(result);
  }

  async function handleUpload(file) {
    window.track && window.track('upload_report');
    setUploading(true);
    setUploadProgress(20);
    setUploadLabel('Uploading…');
    const fd = new FormData();
    fd.append('file', file);
    fd.append('label', file.name.replace(/\.[^.]+$/, ''));
    try {
      setUploadProgress(60);
      setUploadLabel('Analyzing…');
      const r = await api.upload('/reports', fd);
      setUploadProgress(100);
      setUploadLabel('Done ✓');
      setReports(prev => [r, ...prev]);
      openReport(r.id);
      showNotif('Saved: ' + r.label, 'ok');
      setTimeout(() => setUploading(false), 1500);
    } catch (e) {
      setUploading(false);
      showNotif(e.message, 'err');
    }
  }

  function goHome() {
    try {
      window.history.pushState({ hcri: 1, view: 'home' }, '', window.location.pathname);
    } catch (e) {}
    window.trackPage && window.trackPage('/', 'Home');
    setExploreOpen(false);
    setDetail(null);
    setActiveId(null);
    setSidebarOpen(true);
  }

  function openExplore() {
    try {
      window.history.pushState({ hcri: 1, view: 'explore' }, '', window.location.pathname + '?explore');
    } catch (e) {}
    window.trackPage && window.trackPage('/explore', 'Explore');
    setExploreOpen(true);
  }

  function lastListTab() {
    try {
      return localStorage.getItem('hcri_last_list');
    } catch (e) {
      return null;
    }
  }

  // Clicking the logo: back to the dashboard's "root" (Explore, despite the
  // name -- this is what the deployed bundle actually does).
  function goRoot() {
    try {
      window.history.pushState({ hcri: 1, view: 'explore' }, '', window.location.pathname);
    } catch (e) {}
    window.trackPage && window.trackPage('/', 'Explore');
    setSharedReport(null);
    setDetail(null);
    setActiveId(null);
    setExploreOpen(true);
  }

  async function openReport(id) {
    if (!id) return;
    window.track && window.track('open_report');
    setActiveId(id);
    if (isMobile || !sidebarPinned) setSidebarOpen(false);
    try {
      window.history.replaceState(
        { hcri: 1, view: exploreOpen ? 'explore' : 'home' },
        '',
        window.location.pathname + (exploreOpen ? '?explore' : ''),
      );
    } catch (e) {}
    try {
      window.history.pushState({ hcri: 1, view: 'report', rid: id }, '', window.location.pathname);
    } catch (e) {}
    window.trackPage && window.trackPage('/report', 'Report');
    try {
      setDetail(await api.get(`/reports/${id}`));
    } catch (e) {
      showNotif(e.message, 'err');
    }
  }

  // Applied after ReportDetail's metadata editor saves (label/notes/etc. --
  // the actual PATCH happens inside ReportDetail/MetaEditor); just merges
  // the updated fields into both the sidebar's report list and the open
  // detail pane so both stay in sync without a refetch.
  async function handleMetaSave(updated) {
    setReports(prev => prev.map(r => (r.id === updated.id ? { ...r, ...updated } : r)));
    setDetail(prev => prev && { ...prev, ...updated });
  }

  // Result handler for the logged-in "paste nm/value data" modal.
  function handlePasteResult(result) {
    setPasteOpen(false);
    setDetail({ ...result, createdAt: result.createdAt || new Date().toISOString(), shareToken: null });
    if (result.id) {
      setReports(prev => [
        {
          id: result.id,
          label: result.label,
          Rf: result.Rf,
          Rg: result.Rg,
          cct: result.cct,
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ]);
      setActiveId(result.id);
    } else {
      setActiveId(null);
    }
  }

  // Deletes a report after a confirm() prompt, removes it from the sidebar
  // list, and clears the detail pane if it was the one open.
  async function handleDelete(id) {
    if (!confirm('Delete this report?')) return;
    try {
      await api.del(`/reports/${id}`);
      setReports(prev => prev.filter(r => r.id !== id));
      if (activeId === id) {
        setActiveId(null);
        setDetail(null);
      }
      showNotif('Deleted', 'ok');
    } catch (e) {
      showNotif(e.message, 'err');
    }
  }

  // Re-runs the TM-30 Rf/Rg calculation for a report server-side (used when
  // the calculation method changes) and patches the new values into both
  // the sidebar list and the open detail pane.
  async function handleRecalc(id) {
    try {
      const r = await api.post(`/reports/${id}/recalc`);
      setReports(prev => prev.map(rep => (rep.id === id ? { ...rep, Rf: r.Rf, Rg: r.Rg } : rep)));
      if (activeId === id) setDetail(prev => ({ ...prev, ...r }));
      showNotif(`Recalculated — Rf ${r.Rf}, Rg ${r.Rg}`, 'ok');
    } catch (e) {
      showNotif('Recalc failed: ' + e.message, 'err');
    }
  }

  // Shared sign-in handlers used by both the full-screen AuthScreen and its
  // overlay form on top of Explore: after a successful login/register we
  // jump straight to the "My Reports" tab of Explore.
  async function handleLogin(...args) {
    const r = await login(...args);
    try {
      window.history.replaceState(
        { hcri: 1, view: 'explore', etab: 'myreports' },
        '',
        window.location.pathname + '?explore=mine',
      );
    } catch (e) {}
    setExploreAuthOpen(false);
    setExploreOpen(true);
    return r;
  }
  async function handleRegister(...args) {
    const r = await register(...args);
    try {
      window.history.replaceState(
        { hcri: 1, view: 'explore', etab: 'myreports' },
        '',
        window.location.pathname + '?explore=mine',
      );
    } catch (e) {}
    setExploreAuthOpen(false);
    setExploreOpen(true);
    return r;
  }

  // ── Shared / public report view ──────────────────────────────────────────
  if (sharedReport) {
    return (
      <>
        <TopNotices theme={T} />
        <GlobalHelp />
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: T.bg, overflow: 'hidden' }}>
          <div style={{ background: T.surface2, borderBottom: `1px solid ${T.border}`, padding: '10px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
            <div style={{ fontWeight: 900, fontSize: 18, color: T.white, fontFamily: 'monospace' }}>
              hCRI<span style={{ color: T.accent }}>.io</span>
              <span style={{ fontSize: 12, color: T.dim, fontWeight: 400, marginLeft: 12 }}>Shared Report</span>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={toggleTheme}
                style={{ background: T.surface, border: `1px solid ${T.border}`, color: T.text, borderRadius: 6, width: 40, height: 34, padding: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box', fontSize: 16, cursor: 'pointer' }}
              >
                {themeName === 'dark' ? '☀' : '🌙'}
              </button>
              {!user && (
                <button
                  onClick={() => { setSharedReport(null); openExplore(); }}
                  style={{ background: T.surface, border: `1px solid ${T.border}`, color: T.text, borderRadius: 6, padding: '7px 14px', fontSize: 13, cursor: 'pointer', fontFamily: 'monospace', fontWeight: 700 }}
                >
                  Explore →
                </button>
              )}
              <button
                onClick={() => {
                  window.history.replaceState({}, '', window.location.pathname);
                  setSharedReport(null);
                  if (user) { setExploreKey(k => k + 1); setExploreOpen(true); }
                }}
                style={{ background: `${T.accent}15`, border: `1px solid ${T.accent}40`, color: T.accent, borderRadius: 6, padding: '7px 14px', fontSize: 13, cursor: 'pointer', fontFamily: 'monospace', fontWeight: 700 }}
              >
                {user ? (lastListTab() === 'myreports' ? 'My Reports →' : 'Explore →') : 'Analyze Your Own →'}
              </button>
            </div>
          </div>
          <div style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
            <ReportDetail
              report={sharedReport}
              allReports={[sharedReport]}
              isGuest={!user || Number(sharedReport.userId) !== Number(user.id)}
              isShared
            />
          </div>
        </div>
      </>
    );
  }

  // ── Password reset (logged out only) ─────────────────────────────────────
  if (resetToken && !user) {
    return (
      <>
        <TopNotices theme={T} />
        <GlobalHelp />
        <PasswordReset
          token={resetToken}
          onDone={(ok) => {
            setResetToken('');
            if (ok) window.history.replaceState({}, '', window.location.pathname);
          }}
        />
      </>
    );
  }

  // ── Guest-accessible Explore (no account, deep-linked via the URL) ──────
  if (
    !user &&
    !checking &&
    (window.location.search.includes('explore') ||
      window.location.search.includes('compare=') ||
      window.location.pathname.endsWith('/explore'))
  ) {
    return (
      <>
        <TopNotices theme={T} />
        <GlobalHelp />
        <div style={{ minHeight: '100vh' }}>
          <Explore
            onBack={() => {
              try { window.history.replaceState({}, '', window.location.pathname); } catch (e) {}
              setExploreOpen(false);
            }}
            onHome={() => {
              try { window.history.replaceState({}, '', window.location.pathname); } catch (e) {}
              setExploreOpen(false);
            }}
            onSignIn={() => setExploreAuthOpen(true)}
            user={null}
          />
          {exploreAuthOpen && (
            <AuthScreen
              overlayMode
              onOverlayClose={() => setExploreAuthOpen(false)}
              onLogin={handleLogin}
              onRegister={handleRegister}
              onGuestUpload={() => {}}
              onExplore={() => {}}
            />
          )}
        </div>
      </>
    );
  }

  // ── Still resolving auto-login ────────────────────────────────────────────
  if (checking) {
    return (
      <>
        <TopNotices theme={T} />
        <GlobalHelp />
        <div style={{ background: T.bg, height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.dim, fontFamily: 'monospace', fontSize: 14 }}>
          Loading…
        </div>
      </>
    );
  }

  // ── Logged-in dashboard ───────────────────────────────────────────────────
  if (user) {
    return (
      <>
        <TopNotices theme={T} />
        <GlobalHelp />
        <div
          className={isMobile ? 'mobile-layout' : 'desktop-layout'}
          style={{
            background: T.bg,
            width: '100%',
            height: isMobile ? 'auto' : '100vh',
            overflow: isMobile ? 'visible' : 'hidden',
            display: isMobile ? 'block' : 'flex',
            minWidth: 0,
          }}
        >
          {isMobile ? (
            <>
              <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, background: T.surface2, borderBottom: `1px solid ${T.border}`, paddingTop: 'env(safe-area-inset-top,0px)' }}>
                <div style={{ height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 12px', gap: 8 }}>
                  <button
                    onClick={() => setSidebarOpen(v => !v)}
                    style={{ background: 'none', border: 'none', color: T.text, fontSize: 26, cursor: 'pointer', padding: '6px 8px', flexShrink: 0, lineHeight: 1 }}
                  >
                    {sidebarOpen ? '✕' : '☰'}
                  </button>
                  <div
                    onClick={goRoot}
                    style={{ fontWeight: 900, fontSize: 18, color: T.white, fontFamily: 'monospace', flexShrink: 0, cursor: 'pointer' }}
                  >
                    hCRI<span style={{ color: T.accent }}>.io</span>
                  </div>
                  <div style={{ flex: 1, fontSize: 12, color: T.dim, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'center', padding: '0 4px' }}>
                    {!sidebarOpen && detail ? detail.label : ''}
                  </div>
                  <button
                    onClick={() => { window.track && window.track('open_explore'); openExplore(); }}
                    style={{ background: `${T.accent}18`, border: `1.5px solid ${T.accent}`, color: T.accent, borderRadius: 8, padding: '7px 12px', fontSize: 13, cursor: 'pointer', fontFamily: 'monospace', fontWeight: 700, flexShrink: 0 }}
                  >
                    🔭 Explore
                  </button>
                  {user && (
                    <button
                      onClick={logout}
                      style={{ background: 'none', border: `1.5px solid ${T.border}`, color: T.dim, borderRadius: 8, padding: '7px 12px', fontSize: 13, cursor: 'pointer', fontFamily: 'monospace', fontWeight: 700, flexShrink: 0 }}
                    >
                      Sign Out
                    </button>
                  )}
                </div>
              </div>
              <div style={{ marginTop: 'calc(env(safe-area-inset-top,0px) + 52px)' }}>
                {sidebarOpen ? (
                  <Sidebar
                    user={user}
                    onHome={goRoot}
                    reports={reports}
                    activeId={activeId}
                    style={{ width: '100%', borderRight: 'none' }}
                    uploading={uploading}
                    uploadProgress={uploadProgress}
                    uploadLabel={uploadLabel}
                    onUpload={handleUpload}
                    onSelect={openReport}
                    onDelete={handleDelete}
                    onRecalc={handleRecalc}
                    onPaste={() => setPasteOpen(true)}
                    onExplore={() => { window.track && window.track('open_explore'); openExplore(); }}
                    onLogout={logout}
                    minRf={minRf}
                    onMinRfChange={setMinRf}
                  />
                ) : (
                  <ReportDetail
                    report={detail}
                    allReports={reports}
                    onMetaSave={handleMetaSave}
                    onRefresh={async () => {
                      try {
                        if (!detail || !detail.id) return;
                        const d = await api.get('/reports/' + detail.id);
                        d && setDetail(d);
                      } catch (e) {}
                    }}
                  />
                )}
              </div>
            </>
          ) : (
            <>
              <div
                style={{
                  width: sidebarOpen ? 320 : 0,
                  minWidth: sidebarOpen ? 320 : 0,
                  maxWidth: sidebarOpen ? 320 : 0,
                  overflow: 'hidden',
                  transition: 'width .2s ease, min-width .2s ease',
                  position: 'relative',
                  flexShrink: 0,
                  height: '100%',
                }}
              >
                {sidebarOpen && (
                  <div style={{ width: 320, height: '100%', position: 'relative' }}>
                    <Sidebar
                      user={user}
                      onHome={goRoot}
                      reports={reports}
                      activeId={activeId}
                      uploading={uploading}
                      uploadProgress={uploadProgress}
                      uploadLabel={uploadLabel}
                      onUpload={handleUpload}
                      onSelect={openReport}
                      onDelete={handleDelete}
                      onRecalc={handleRecalc}
                      onPaste={() => setPasteOpen(true)}
                      onExplore={() => { window.track && window.track('open_explore'); openExplore(); }}
                      onLogout={logout}
                      minRf={minRf}
                      onMinRfChange={setMinRf}
                      onUserUpdate={patchUser}
                      pinned={sidebarPinned}
                      onTogglePin={() => {
                        const next = !sidebarPinned;
                        setSidebarPinned(next);
                        if (next) setSidebarOpen(true);
                      }}
                    />
                  </div>
                )}
              </div>
              <div
                className="report-wrapper"
                style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', minWidth: 0, height: '100%', position: 'relative' }}
              >
                <div style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                  {(!sidebarPinned || !sidebarOpen) && (
                    <button
                      onClick={() => setSidebarOpen(v => !v)}
                      title={sidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
                      style={{ background: T.surface2, border: `1px solid ${T.border}`, borderLeft: 'none', borderRadius: '0 6px 6px 0', color: T.dim, cursor: 'pointer', padding: '10px 5px', fontSize: 12, lineHeight: 1, writingMode: 'vertical-rl' }}
                    >
                      {sidebarOpen ? '◀' : '▶'}
                    </button>
                  )}
                  {!sidebarOpen && (
                    <>
                      <button
                        onClick={toggleTheme}
                        title={themeName === 'dark' ? 'Light mode' : 'Dark mode'}
                        style={{ background: T.surface2, border: `1px solid ${T.border}`, borderLeft: 'none', borderTop: 'none', borderRadius: '0 0 0 0', color: T.dim, cursor: 'pointer', padding: '8px 5px', fontSize: 14, lineHeight: 1 }}
                      >
                        {themeName === 'dark' ? '☀' : '🌙'}
                      </button>
                      <button
                        onClick={() => { window.track && window.track('open_explore'); openExplore(); }}
                        title="Explore"
                        style={{ background: T.surface2, border: `1px solid ${T.border}`, borderLeft: 'none', borderTop: 'none', color: '#00d4ff', cursor: 'pointer', padding: '8px 5px', fontSize: 14, lineHeight: 1 }}
                      >
                        🔭
                      </button>
                      <button
                        onClick={() => setHelpOpen(true)}
                        title="Help"
                        style={{ background: T.surface2, border: `1px solid ${T.border}`, borderLeft: 'none', borderTop: 'none', color: T.dim, cursor: 'pointer', padding: '8px 5px', fontSize: 13, lineHeight: 1 }}
                      >
                        ?
                      </button>
                      <button
                        onClick={() => setFeedbackOpen(true)}
                        title="Send feedback"
                        style={{ background: T.surface2, border: `1px solid ${T.border}`, borderLeft: 'none', borderTop: 'none', color: T.dim, cursor: 'pointer', padding: '8px 5px', fontSize: 13, lineHeight: 1 }}
                      >
                        ✉
                      </button>
                      <button
                        onClick={logout}
                        title="Sign out"
                        style={{ background: T.surface2, border: `1px solid ${T.border}`, borderLeft: 'none', borderTop: 'none', borderRadius: '0 0 6px 0', color: T.dim, cursor: 'pointer', padding: '8px 5px', fontSize: 11, lineHeight: 1, writingMode: 'vertical-rl', fontFamily: 'monospace', fontWeight: 700 }}
                      >
                        Sign Out
                      </button>
                    </>
                  )}
                </div>
                <ReportDetail
                  report={detail}
                  allReports={reports}
                  onMetaSave={handleMetaSave}
                  onRefresh={async () => {
                    try {
                      if (!detail || !detail.id) return;
                      const d = await api.get('/reports/' + detail.id);
                      d && setDetail(d);
                    } catch (e) {}
                  }}
                />
              </div>
            </>
          )}

          {helpOpen && <HelpModal onClose={() => setHelpOpen(false)} />}
          {feedbackOpen && <FeedbackModal onClose={() => setFeedbackOpen(false)} />}
          {pasteOpen && (
            <PasteSPDModal user={user} onResult={handlePasteResult} onClose={() => setPasteOpen(false)} />
          )}
          {exploreOpen && (
            <div style={{ position: 'fixed', inset: 0, zIndex: 1500, overflowY: 'auto', overflowX: 'hidden' }}>
              <Explore
                key={exploreKey}
                onBack={goHome}
                user={user}
                onHome={goHome}
                onLogout={logout}
                onHardReset={() => setExploreKey(k => k + 1)}
              />
            </div>
          )}
          {notif && (
            <div
              style={{
                position: 'fixed',
                bottom: 18,
                left: '50%',
                transform: 'translateX(-50%)',
                background: T.surface2,
                borderRadius: 6,
                padding: '10px 18px',
                fontSize: 13,
                letterSpacing: 0.5,
                zIndex: 200,
                pointerEvents: 'none',
                border: `1px solid ${notif.type === 'err' ? T.bad + '60' : T.good + '60'}`,
                color: notif.type === 'err' ? T.bad : T.good,
              }}
            >
              {notif.msg}
            </div>
          )}
        </div>
      </>
    );
  }

  // ── Logged-out landing page ──────────────────────────────────────────────
  return (
    <>
      <TopNotices theme={T} />
      <GlobalHelp />
      <AuthScreen
        onLogin={handleLogin}
        onRegister={handleRegister}
        onGuestUpload={handleGuestUpload}
        onExplore={() => { window.track && window.track('open_explore'); openExplore(); }}
      />
    </>
  );
}
