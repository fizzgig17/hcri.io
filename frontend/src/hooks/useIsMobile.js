// frontend/src/hooks/useIsMobile.js
//
// Whether the viewport is phone-width right now. Below this breakpoint,
// App/Sidebar/ReportView switch from the desktop two-pane layout (sidebar +
// report view docked side by side) to a single-pane mobile layout (reports
// list, or report detail, full-screen -- never both at once). 640px covers
// phones in both orientations while leaving small tablets on the desktop
// layout, where there's room for two real panes.
const BREAKPOINT = 640;

import { useState, useEffect } from 'react';

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.innerWidth <= BREAKPOINT
  );

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${BREAKPOINT}px)`);
    const onChange = () => setIsMobile(mq.matches);
    onChange();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return isMobile;
}
