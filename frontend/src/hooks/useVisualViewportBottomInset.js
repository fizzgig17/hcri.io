// frontend/src/hooks/useVisualViewportBottomInset.js
//
// How many px of the bottom of the LAYOUT viewport (window.innerHeight) are
// currently covered by browser chrome that isn't part of the VISUAL
// viewport -- iOS Safari's own bottom toolbar, specifically.
//
// Confirmed 2026-10-02 (iOS Safari, address bar docked at top): a
// `position: fixed; bottom: 0` bar using only
// `padding-bottom: calc(env(safe-area-inset-bottom) + Npx)` still rendered
// partly behind Safari's bottom toolbar (back/forward, share, tabs). That
// toolbar isn't the home-indicator safe area env(safe-area-inset-bottom)
// covers -- it's separate browser chrome that shows/hides as the page
// scrolls, and the env() value doesn't reliably track it live across iOS
// versions. `position: fixed` is anchored to the LAYOUT viewport
// (window.innerHeight), which includes whatever's currently hidden behind
// that chrome -- the toolbar is drawn ON TOP of that area, not pushing it
// up, so `bottom: 0` sits right underneath it.
//
// The VisualViewport API is the actual live authority on what's on screen
// right now: window.innerHeight is the full layout viewport, while
// visualViewport.height (+ its offsetTop, for when the visual viewport has
// scrolled within the layout viewport, e.g. while zoomed) is what's
// actually visible this instant. The gap between them IS the chrome
// height, recomputed every time Safari shows, hides, or resizes it --
// unlike env(safe-area-inset-bottom), this updates live via the
// VisualViewport's own resize/scroll events.
//
// Returns 0 (and does nothing) in browsers without window.visualViewport --
// env(safe-area-inset-bottom) alone still applies there via CSS, which is
// enough for the home-indicator case this hook doesn't need to duplicate.

import { useState, useEffect } from 'react';

export function useVisualViewportBottomInset() {
  const [inset, setInset] = useState(0);

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;

    const update = () => {
      const gap = window.innerHeight - (vv.height + vv.offsetTop);
      // Rounds + clamps to >=0: sub-pixel layout jitter and momentum-scroll
      // overshoot can otherwise produce tiny negative values.
      setInset(Math.max(0, Math.round(gap)));
    };

    update();
    vv.addEventListener('resize', update);
    vv.addEventListener('scroll', update);
    return () => {
      vv.removeEventListener('resize', update);
      vv.removeEventListener('scroll', update);
    };
  }, []);

  return inset;
}
