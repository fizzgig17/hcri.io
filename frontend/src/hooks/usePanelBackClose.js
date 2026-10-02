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
import { useEffect, useRef } from 'react';
import { pushPanel, closePanel } from '../lib/panelHistory';

export default function usePanelBackClose(open, onClose) {
  const entryRef = useRef(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    const entry = pushPanel(() => onCloseRef.current());
    entryRef.current = entry;
    return () => {
      if (entryRef.current) {
        closePanel(entryRef.current);
        entryRef.current = null;
      }
    };
  }, [open]);
}
