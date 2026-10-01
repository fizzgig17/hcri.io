// frontend/src/hooks/useIsMobile.js
//
// Reconstructed from assets/app.js (minified var p). Real breakpoint is
// 768px (not the 640px guess an earlier, source-less rebuild used), and it
// takes an optional override so a caller can use a tighter/looser
// breakpoint for a specific layout decision.

import { useState, useEffect } from 'react';

export function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= breakpoint);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= breakpoint);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [breakpoint]);

  return isMobile;
}
