// frontend/src/App.jsx
//
// Reconstructed from the deployed assets/app.js (minified function Ge, the
// root component mounted directly by main.jsx). The real deployed app is a
// small router/state machine with several entry points:
//
//   - A shared/public report view (`?report=<id>` or `?share=<token>`),
//     reachable whether or not anyone is logged in, with its own minimal
//     header (theme toggle + "Explore"/"My Reports"/"Analyze Your Own").
//   - A password-reset screen (`?reset=<token>`) for a logged-out visitor.
//   - A guest-accessible Explore page (`?explore`, `?compare=...`, or a
//     `/explore` path) that works with no account at all, with sign-in
//     offered as an AuthScreen overlay (`overlayMode`) rather than a
//     redirect.
//   - The logged-in app: Explore rendered directly as the full page (it's
//     a fully self-contained component -- own upload/paste, own filters,
//     own Help/Feedback/Account/Admin modals, own "My Reports" library and
//     per-report detail view, own internal history handling). There used
//     to be a separate "logged-in dashboard" here (Sidebar + ReportDetail)
//     that Explore rendered as a full-page overlay on top of; it was
//     removed because it was already unreachable in normal use (the
//     effect that auto-opens Explore right after login meant a logged-in
//     user essentially never saw it) and everything in it -- upload,
//     paste, filtering, Help/Feedback/Account, even Admin access -- was
//     already duplicated, more capably, inside Explore itself. The one
//     exception, the per-report "Recalculate metrics from SPD" button, was
//     dropped rather than ported (not something anyone uses).
//   - The logged-out marketing/landing page (AuthScreen, full screen).
//
// Browser history for the shared-report and guest-explore entry points is
// wired by hand with pushState/replaceState + a popstate listener (not a
// router library). Explore.jsx has its own, separate popstate listener for
// navigation *within* itself (tabs, folders, compare, etc.) once a user is
// logged in or has opened guest Explore -- this file's listener only needs
// to care about entering/exiting the shared-report view and the top-level
// guest-explore/landing-page split.
//
// Every panel/modal with no URL of its own (AdminPanel, AccountSettings,
// HelpModal, FeedbackModal, PasteSPDModal, Explore's Compare view and
// open-report detail pane, etc.) pushes its own history entry while open
// via usePanelBackClose() (hooks/usePanelBackClose.js, lib/panelHistory.js),
// so the back button closes the topmost open panel instead of leaving the
// page behind it -- see tests/back-button.spec.js. The onPop handler below
// checks that stack first, via handlePanelPopState(), before falling
// through to its own routing.

import { useEffect, useState } from 'react';
import { useTheme } from './lib/ThemeContext.jsx';
import { useAuth } from './hooks/useAuth';
import { useIsMobile } from './hooks/useIsMobile';
import { setTZ } from './lib/tz';
import { TopNotices } from './components/Notices';
import { GlobalHelp } from './components/HelpModal';
import AuthScreen from './components/AuthScreen';
import ReportDetail from './components/ReportDetail';
import Explore from './components/Explore';
import PasswordReset from './components/PasswordReset';
import { handlePanelPopState } from './lib/panelHistory';
import usePanelBackClose from './hooks/usePanelBackClose';

export default function App() {
  // On-screen keyboard: iOS Safari doesn't shrink the layout viewport, it just pans the
  // visual viewport -- which slides the locked mobile layouts up under the browser's
  // URL bar and hides the bottom of long lists behind the keys. While the keyboard is
  // up, publish the visible height as --vvh so full-screen layouts (.vh-full) shrink to
  // fit above the keyboard instead (so there's nothing for Safari to pan).
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return undefined;
    const root = document.documentElement;
    const editing = () => {
      const a = document.activeElement;
      return !!a && (a.tagName === 'INPUT' || a.tagName === 'TEXTAREA' || a.tagName === 'SELECT' || a.isContentEditable);
    };
    const update = () => {
      // Only while a field is focused AND the keyboard is really up; otherwise a stale
      // value (e.g. captured mid-animation, or left over after the app was backgrounded
      // with the keyboard open) would leave the layout stuck short with a gap below it.
      if (editing() && window.innerHeight - vv.height > 120) root.style.setProperty('--vvh', Math.round(vv.height + vv.offsetTop) + 'px'); // bottom edge of the visible area, in layout coordinates
      else root.style.removeProperty('--vvh');
    };
    const timers = [];
    const settle = () => {
      update();
      timers.splice(0).forEach(clearTimeout);
      [150, 400, 800].forEach((ms) => timers.push(setTimeout(update, ms)));
    };
    update();
    vv.addEventListener('resize', update);
    vv.addEventListener('scroll', update);
    document.addEventListener('focusin', settle);
    document.addEventListener('focusout', settle);
    document.addEventListener('visibilitychange', settle);
    window.addEventListener('pageshow', settle);
    window.addEventListener('focus', settle);
    return () => {
      vv.removeEventListener('resize', update);
      vv.removeEventListener('scroll', update);
      document.removeEventListener('focusin', settle);
      document.removeEventListener('focusout', settle);
      document.removeEventListener('visibilitychange', settle);
      window.removeEventListener('pageshow', settle);
      window.removeEventListener('focus', settle);
      timers.forEach(clearTimeout);
      root.style.removeProperty('--vvh');
    };
  }, []);
  const { theme: T, themeName, toggleTheme } = useTheme();
  const { user, checking, tryAutoLogin, login, register, logout } = useAuth();

  // Keep the shared tz helper (used by fmtTZ() across report views) in
  // sync with whatever timezone the logged-in user has set.
  useEffect(() => {
    setTZ(user && user.timezone);
  }, [user && user.timezone]);

  // ── Shared/public single-report view (?report= or ?share=) ─────────────
  const [sharedReport, setSharedReport] = useState(null);
  const [sharedLoading, setSharedLoading] = useState(false);
  const [sharedError, setSharedError] = useState(null);

  // ── Explore state ────────────────────────────────────────────────────────
  // Initial value is derived straight from the URL so a deep link into
  // Explore (or a page reload while on it) opens straight into Explore
  // instead of flashing the landing page first. A report/share/reset link
  // always wins over an explore-looking URL. For a logged-in user, Explore
  // is always what's shown (see the user-login effect below); exploreOpen's
  // remaining job there is just driving the mobile scroll-lock effect and
  // being bumped back to true by onPop's 'explore' history-state handling.
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

  // Back-button support for the exploreAuthOpen sign-in overlay shown over
  // guest Explore (it has no URL of its own) -- see lib/panelHistory.js.
  usePanelBackClose(exploreAuthOpen, () => setExploreAuthOpen(false));

  const isMobile = useIsMobile(768);

  // Locks page scroll on the <html> element on mobile whenever Explore is
  // being shown full-screen -- for a logged-in user that's unconditionally
  // true (Explore is the whole app), and for a guest it tracks exploreOpen.
  // Explore manages its own internal scrolling (overflowY:auto), so this
  // just keeps the document itself from being a second, competing scroll
  // surface underneath it on mobile Safari/Firefox. Desktop never needed
  // this (the guest-Explore page has always just scrolled normally at
  // desktop widths, with no lock), so the logged-in case now matches that.
  useEffect(() => {
    // The class goes on <html>, not #root: #root's `height: 100%` can only
    // resolve to a real pixel value (letting `overflow: hidden` actually
    // clip anything) if its whole ancestor chain -- html and body too --
    // has a definite height. Locking #root alone while html/body stay
    // `height: auto` leaves the percentage height undefined, so it
    // computes as 'auto' and nothing gets clipped.
    const el = document.documentElement;
    if (isMobile && (exploreOpen || user)) el.classList.add('app-locked');
    else el.classList.remove('app-locked');
    return () => el.classList.remove('app-locked');
  }, [isMobile, user, exploreOpen]);

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

        // (No more 'report'/'home' view-state handling here -- those only
        // ever came from the old dashboard's openReport()/goHome(), which
        // no longer exist. A logged-in user is just always showing Explore,
        // which has its own popstate listener for navigation within itself.)
        if (rep) {
          setSharedLoading(true);
          setExploreOpen(false);
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
          fetch('./index.php/api/shared/' + encodeURIComponent(shr))
            .then(r => r.json())
            .then(r => { r.error ? setSharedError(r.error) : setSharedReport(r); })
            .catch(() => setSharedError('Could not load shared report.'))
            .finally(() => setSharedLoading(false));
          return;
        }
        if (exp || (st && st.view === 'explore')) {
          setSharedReport(null);
          setExploreKey(k => k + 1);
          setExploreOpen(true);
          window.trackPage && window.trackPage('/explore', 'Explore');
          return;
        }
        setSharedReport(null);
        setExploreOpen(false);
        window.trackPage && window.trackPage('/', 'Home');
      } catch (e) {}
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  // Clear the guest-upload result once a user logs in (see handleGuestUpload
  // below).
  useEffect(() => {
    if (user) setGuestReport(null);
  }, [user]);

  // Handler for AuthScreen's guest (logged-out) upload box. Note: this sets
  // guestReport, but nothing in this component's render output ever reads
  // that state back -- AuthScreen renders the guest result itself inline
  // (see its own `analyzed`/`guestResult` state), so this is dead state
  // kept only because the deployed bundle has it too.
  function handleGuestUpload(result) {
    setGuestReport(result);
  }

  function openExplore() {
    // No-op if already on Explore -- don't push a redundant history entry
    // for a click that wouldn't change anything on screen (see
    // tests/no-redundant-history.spec.js).
    if (exploreOpen) return;
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
        <div className="vh-full" style={{ display: 'flex', flexDirection: 'column', background: T.bg, overflow: 'hidden' }}>
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

  // ── Logged-in: Explore is the whole app ──────────────────────────────────
  // There used to be a separate dashboard here (Sidebar + ReportDetail)
  // that Explore rendered as a full-page overlay on top of -- removed; see
  // the header comment. This now mirrors the guest-accessible Explore
  // branch above exactly, just with a real `user`. Explore doesn't call
  // onHome/onBack for a logged-in user (see its own `if (!n && onHomeFn)`
  // guard), so they're not passed here; onHardReset (full remount via
  // exploreKey) is real functionality independent of the old dashboard and
  // stays wired.
  if (user) {
    return (
      <>
        <TopNotices theme={T} />
        <GlobalHelp />
        <div style={{ minHeight: '100vh' }}>
          <Explore
            key={exploreKey}
            user={user}
            onLogout={logout}
            onHardReset={() => setExploreKey(k => k + 1)}
          />
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
