// frontend/src/hooks/usePanelBackClose.js
//
// Makes an open panel/modal closeable with the browser back button
// instead of letting back navigate off the page behind it (or off the
// site entirely) -- see ../lib/panelHistory.js for the mechanism and why
// this exists.
//
// Usage: call it right alongside the open-state declaration for a panel,
// not inside the panel component itself (a panel like AdminPanel or
// HelpModal can be opened from more than one parent, each with its own
// state) --
//
//   const [adminOpen, setAdminOpen] = useState(false);
//   usePanelBackClose(adminOpen, () => setAdminOpen(false));
//   ...
//   {adminOpen && <AdminPanel onClose={() => setAdminOpen(false)} .../>}
//
// `open` is the panel's own visibility boolean. `onClose` should do the
// same thing its "X"/Cancel button does (usually just the setter above).
//
// `pushArgs` is optional, for a panel whose own identity should survive a
// refresh via the URL (e.g. "which report is open") rather than just this
// in-memory stack -- pass a function (it's re-evaluated on every open, so
// it can close over current props/state) returning
// `{ state, url, closedState, closedUrl }`:
//   - `state`/`url`: what to push when genuinely opening (matches
//     history.pushState's own args).
//   - `closedState`/`closedUrl`: what the entry should become if closed
//     WITHOUT the back button (see claimPanel's comment in
//     panelHistory.js for why that can't just be history.back()).
// If the page is already sitting on `url` (a fresh load or a refresh of a
// `?rid=`-style deep link), nothing is pushed -- see claimPanel.
import { useEffect, useRef } from 'react';
import { pushPanel, claimPanel, closePanel } from '../lib/panelHistory';

export default function usePanelBackClose(open, onClose, pushArgs) {
  const entryRef = useRef(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    let entry;
    if (pushArgs) {
      const { state, url, closedState, closedUrl } = pushArgs() || {};
      const here = window.location.pathname + window.location.search;
      entry = url != null && here === url
        ? claimPanel(() => onCloseRef.current(), closedState, closedUrl)
        : pushPanel(() => onCloseRef.current(), state, url);
    } else {
      entry = pushPanel(() => onCloseRef.current());
    }
    entryRef.current = entry;
    return () => {
      if (entryRef.current) {
        closePanel(entryRef.current);
        entryRef.current = null;
      }
    };
  }, [open]);
}
