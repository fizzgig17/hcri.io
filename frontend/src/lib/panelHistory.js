// frontend/src/lib/panelHistory.js
//
// Coordinates the browser back button with in-app panels/modals that have
// no URL of their own (AdminPanel, AccountSettings, HelpModal,
// FeedbackModal, PasteSPDModal, Explore's Compare view and open-report
// detail pane, etc.) -- see App.jsx's history comment for the top-level
// report/explore/home routing this complements, and tests/README.md for
// why this exists: none of those panels pushed a history entry when
// opened, so pressing back while one was open skipped straight past the
// app to whatever was in browser history before the site was ever
// opened, which read as "the back button takes me off the entire site".
//
// Model: a LIFO stack of open panels. Opening one pushes a history entry
// and a close callback; the back button pops the most-recently-opened
// panel and closes just that one (so nested panels unwind one at a time,
// innermost first -- standard modal-stack behavior). Closing a panel via
// its own UI (an "X"/Cancel button, not the back button) removes it from
// the stack and unwinds the one history entry it pushed, via
// `window.history.back()`, so back/forward stay consistent and a later
// *forward* press doesn't resurrect a closed panel.
//
// Use the usePanelBackClose() hook (../hooks/usePanelBackClose.js) from a
// component rather than calling pushPanel/closePanel directly.

const stack = [];

// Set right before we call history.back() ourselves (closing a panel via
// its own UI, not the physical back button), so the popstate event that
// causes is recognized as "expected" rather than re-triggering the normal
// close-the-top-panel handling a second time.
let suppressNextPop = 0;

export function pushPanel(onClose) {
  const entry = { onClose };
  stack.push(entry);
  try {
    window.history.pushState({ hcri: 1, panel: true }, '');
  } catch {}
  return entry;
}

export function closePanel(entry) {
  const i = stack.lastIndexOf(entry);
  if (i === -1) return; // already closed (e.g. the back button beat us to it)
  stack.splice(i, 1);
  try {
    suppressNextPop++;
    window.history.back();
  } catch {}
}

// Called from App.jsx's single popstate listener, before its own
// report/explore/home routing. Returns true if this handled the back
// press (closed a panel, or absorbed our own programmatic
// `history.back()` from closePanel above) -- the caller should stop and
// not also run its normal view-switch logic, since nothing about the
// underlying page actually changed.
export function handlePanelPopState() {
  if (suppressNextPop > 0) {
    suppressNextPop--;
    return true;
  }
  if (!stack.length) return false;
  const entry = stack.pop();
  entry.onClose();
  return true;
}
